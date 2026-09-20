import { Prisma, ReconciliationStatus } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { prisma } from '../../prisma/client';
import { NotFoundError } from '../../utils/errors';

export interface SettlementRow {
  reference: string;
  amount: number;
  date?: string;
  sender?: string;
  narration?: string;
}

export class ReconciliationService {
  static parseCsvSettlement(csvBuffer: Buffer): SettlementRow[] {
    const records: any[] = parse(csvBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    return records.map((r) => {
      // Find reference column
      const reference = r.Reference || r.reference || r.SessionID || r['Session ID'] || r.RRN || r['Transaction ID'] || '';
      // Find amount column
      const rawAmount = r.Amount || r.amount || r.Credit || r['Credit (NGN)'] || '0';
      const cleanAmount = parseFloat(String(rawAmount).replace(/[^0-9.]/g, '')) || 0;

      return {
        reference: String(reference).trim(),
        amount: cleanAmount,
        date: r.Date || r.date || r.Timestamp || undefined,
        sender: r.Sender || r.sender || r.Payer || undefined,
        narration: r.Narration || r.narration || r.Description || undefined,
      };
    });
  }

  static async reconcileBatch(
    businessId: string,
    claims: Array<{
      claimedReference: string;
      claimedAmount: number;
      transactionDate?: string;
      rawEntryData?: any;
    }>,
    sourceFileName: string = 'CSV_IMPORT'
  ) {
    const jobReference = `REC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Fetch all transactions for this business for matching
    const knownTransactions = await prisma.transaction.findMany({
      where: { businessId },
    });

    const txMap = new Map<string, typeof knownTransactions[0]>();
    for (const tx of knownTransactions) {
      txMap.set(tx.publicReference.toLowerCase().trim(), tx);
    }

    let matchedCount = 0;
    let partialCount = 0;
    let unmatchedCount = 0;
    let mismatchCount = 0;

    const resultsToInsert: Array<{
      claimedReference: string;
      actualReference?: string;
      claimedAmount: Prisma.Decimal;
      actualAmount?: Prisma.Decimal;
      status: ReconciliationStatus;
      confidenceScore: Prisma.Decimal;
      discrepancyReason?: string;
      matchedTransactionId?: string;
      rawEntryData?: any;
    }> = [];

    for (const claim of claims) {
      const cleanRef = claim.claimedReference.toLowerCase().trim();
      const matchedTx = txMap.get(cleanRef);
      const claimedDecimal = new Prisma.Decimal(claim.claimedAmount);

      if (matchedTx) {
        const actualAmt = Number(matchedTx.amount);
        const claimedAmt = claim.claimedAmount;

        if (Math.abs(actualAmt - claimedAmt) < 0.01) {
          // Exact Match
          matchedCount++;
          resultsToInsert.push({
            claimedReference: claim.claimedReference,
            actualReference: matchedTx.publicReference,
            claimedAmount: claimedDecimal,
            actualAmount: matchedTx.amount,
            status: ReconciliationStatus.MATCHED,
            confidenceScore: new Prisma.Decimal(99.0),
            discrepancyReason: 'Exact reference and amount match confirmed',
            matchedTransactionId: matchedTx.id,
            rawEntryData: claim.rawEntryData,
          });
        } else {
          // Amount Mismatch
          mismatchCount++;
          resultsToInsert.push({
            claimedReference: claim.claimedReference,
            actualReference: matchedTx.publicReference,
            claimedAmount: claimedDecimal,
            actualAmount: matchedTx.amount,
            status: ReconciliationStatus.MISMATCH,
            confidenceScore: new Prisma.Decimal(45.0),
            discrepancyReason: `Amount mismatch: Claimed ₦${claimedAmt}, but bank settled ₦${actualAmt}`,
            matchedTransactionId: matchedTx.id,
            rawEntryData: claim.rawEntryData,
          });
        }
      } else {
        // Look for amount match among unsettled transactions (Potential Partial Match)
        const fuzzyMatch = knownTransactions.find(
          (t) => Math.abs(Number(t.amount) - claim.claimedAmount) < 0.01
        );

        if (fuzzyMatch) {
          partialCount++;
          resultsToInsert.push({
            claimedReference: claim.claimedReference,
            actualReference: fuzzyMatch.publicReference,
            claimedAmount: claimedDecimal,
            actualAmount: fuzzyMatch.amount,
            status: ReconciliationStatus.PARTIAL_MATCH,
            confidenceScore: new Prisma.Decimal(70.0),
            discrepancyReason: `Amount matches unassigned transaction, but reference differs (${fuzzyMatch.publicReference})`,
            matchedTransactionId: fuzzyMatch.id,
            rawEntryData: claim.rawEntryData,
          });
        } else {
          // Unmatched
          unmatchedCount++;
          resultsToInsert.push({
            claimedReference: claim.claimedReference,
            claimedAmount: claimedDecimal,
            status: ReconciliationStatus.UNMATCHED,
            confidenceScore: new Prisma.Decimal(0.0),
            discrepancyReason: 'No corresponding bank transaction found in ledger',
            rawEntryData: claim.rawEntryData,
          });
        }
      }
    }

    // Persist Job and Results
    const job = await prisma.$transaction(async (tx) => {
      const createdJob = await tx.reconciliationJob.create({
        data: {
          businessId,
          jobReference,
          totalRecords: claims.length,
          matchedCount,
          partialCount,
          unmatchedCount,
          mismatchCount,
          status: 'COMPLETED',
          sourceFileName,
          completedAt: new Date(),
        },
      });

      if (resultsToInsert.length > 0) {
        await tx.reconciliationResult.createMany({
          data: resultsToInsert.map((r) => ({
            ...r,
            jobId: createdJob.id,
          })),
        });
      }

      return createdJob;
    });

    return {
      job,
      summary: {
        totalRecords: claims.length,
        matchedCount,
        partialCount,
        unmatchedCount,
        mismatchCount,
        reconciliationRate:
          claims.length > 0 ? `${((matchedCount / claims.length) * 100).toFixed(1)}%` : '0%',
      },
    };
  }

  static async getJobResults(jobId: string, businessId: string) {
    const job = await prisma.reconciliationJob.findFirst({
      where: { id: jobId, businessId },
      include: {
        results: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!job) {
      throw new NotFoundError('Reconciliation job not found');
    }

    return job;
  }
}
