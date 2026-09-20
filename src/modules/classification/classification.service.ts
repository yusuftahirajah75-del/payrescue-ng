import { DisputeCategory, TransactionType } from '@prisma/client';
import { prisma } from '../../prisma/client';

export interface ClassificationInput {
  transactionType: TransactionType;
  claimAmount: number;
  transactionReference: string;
  narrativeDescription: string;
  hasDebitAlert: boolean;
  hasValueDelivered: boolean;
  hoursElapsedSinceTransaction: number;
}

export interface ClassificationResult {
  category: DisputeCategory;
  confidenceScore: number;
  rationale: string;
  suggestedAction: string;
}

export class ClassificationEngine {
  static async classifyDispute(input: ClassificationInput): Promise<ClassificationResult> {
    const desc = input.narrativeDescription.toLowerCase();

    // Rule 1: Duplicate check across database
    let existingRefCount = 0;
    try {
      existingRefCount = await prisma.transaction.count({
        where: { publicReference: input.transactionReference },
      });
    } catch {
      existingRefCount = 0;
    }

    if (existingRefCount > 1 || desc.includes('duplicate') || desc.includes('double debit') || desc.includes('twice')) {
      return {
        category: DisputeCategory.DUPLICATE,
        confidenceScore: 92.0,
        rationale: 'Multiple records or customer narrative indicates duplicate debit on the same transaction reference.',
        suggestedAction: 'Request bank statement showing twin debits; file for immediate duplicate reversal under CBN Guidelines.',
      };
    }

    // Rule 2: Debited not credited (Interbank transfer)
    if (
      input.transactionType === TransactionType.BANK_TRANSFER ||
      desc.includes('not credited') ||
      desc.includes('beneficiary not received') ||
      desc.includes('reversed') ||
      desc.includes('debited but')
    ) {
      return {
        category: DisputeCategory.DEBITED_NOT_CREDITED,
        confidenceScore: 95.0,
        rationale: 'Funds debited from sender bank account without recipient bank ledger credit acknowledgment.',
        suggestedAction: 'Generate NIBSS NIP Session ID verification package and trigger 72hr SLA countdown for bank dispute desk.',
      };
    }

    // Rule 3: Failed Airtime / Data
    if (
      (input.transactionType === TransactionType.AIRTIME || input.transactionType === TransactionType.DATA) &&
      !input.hasValueDelivered
    ) {
      return {
        category: DisputeCategory.FAILED_SERVICE,
        confidenceScore: 90.0,
        rationale: 'Telecom utility payment completed, but network operator failed to credit voice/data balance.',
        suggestedAction: 'Dispatch automated ticket to Telco Aggregator with phone number and recharge timestamp.',
      };
    }

    // Rule 4: Electricity Token Not Received
    if (
      input.transactionType === TransactionType.ELECTRICITY_TOKEN &&
      (desc.includes('token') || !input.hasValueDelivered)
    ) {
      return {
        category: DisputeCategory.SERVICE_NOT_RECEIVED,
        confidenceScore: 94.0,
        rationale: 'Electricity DisCo payment succeeded without 20-digit token generation or meter recharge.',
        suggestedAction: 'Query DisCo vending switch using meter number or escalate directly to DisCo Customer Complaints unit.',
      };
    }

    // Rule 5: Wrong Amount
    if (desc.includes('wrong amount') || desc.includes('overcharge') || desc.includes('excess')) {
      return {
        category: DisputeCategory.WRONG_AMOUNT,
        confidenceScore: 88.0,
        rationale: 'Amount charged differs from stated invoice, product price, or authorization token.',
        suggestedAction: 'Generate price difference refund request with attached invoice and checkout summary.',
      };
    }

    // Rule 6: Pending within statutory window
    if (input.hoursElapsedSinceTransaction < 24 && !input.hasDebitAlert) {
      return {
        category: DisputeCategory.PENDING,
        confidenceScore: 80.0,
        rationale: 'Transaction is within standard clearing and automated retry window (less than 24 hours).',
        suggestedAction: 'Advise customer to wait for clearing window; schedule automated alert if still unfulfilled after 24h.',
      };
    }

    // Default Fallback
    return {
      category: DisputeCategory.NEEDS_VERIFICATION,
      confidenceScore: 70.0,
      rationale: 'General transaction discrepancy requiring evidence review by dispute officer.',
      suggestedAction: 'Review submitted receipts and contact provider support desk.',
    };
  }
}
