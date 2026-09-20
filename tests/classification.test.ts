import { ClassificationEngine } from '../src/modules/classification/classification.service';
import { TransactionType, DisputeCategory } from '@prisma/client';

describe('Transaction Classification Engine', () => {
  it('should classify bank transfers with debited narrative as DEBITED_NOT_CREDITED', async () => {
    const result = await ClassificationEngine.classifyDispute({
      transactionType: TransactionType.BANK_TRANSFER,
      claimAmount: 25000,
      transactionReference: '999001234567890123456789012345',
      narrativeDescription: 'Sent 25,000 NGN to GTBank, debited but beneficiary was not credited',
      hasDebitAlert: true,
      hasValueDelivered: false,
      hoursElapsedSinceTransaction: 48,
    });

    expect(result.category).toBe(DisputeCategory.DEBITED_NOT_CREDITED);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(90);
    expect(result.suggestedAction).toContain('72hr SLA');
  });

  it('should classify failed airtime transactions as FAILED_SERVICE', async () => {
    const result = await ClassificationEngine.classifyDispute({
      transactionType: TransactionType.AIRTIME,
      claimAmount: 2000,
      transactionReference: 'VTU-2026-94819',
      narrativeDescription: 'Airtime recharge debited on mobile app but phone line did not receive airtime credit',
      hasDebitAlert: true,
      hasValueDelivered: false,
      hoursElapsedSinceTransaction: 12,
    });

    expect(result.category).toBe(DisputeCategory.FAILED_SERVICE);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(85);
  });

  it('should classify electricity token claims as SERVICE_NOT_RECEIVED', async () => {
    const result = await ClassificationEngine.classifyDispute({
      transactionType: TransactionType.ELECTRICITY_TOKEN,
      claimAmount: 10000,
      transactionReference: 'DISCO-984210',
      narrativeDescription: 'Paid EKEDC prepaid meter 041928492 but no token was generated',
      hasDebitAlert: true,
      hasValueDelivered: false,
      hoursElapsedSinceTransaction: 5,
    });

    expect(result.category).toBe(DisputeCategory.SERVICE_NOT_RECEIVED);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(90);
  });
});
