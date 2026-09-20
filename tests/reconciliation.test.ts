import { ReconciliationService } from '../src/modules/reconciliation/reconciliation.service';

describe('Payment Reconciliation Engine', () => {
  it('should parse standard Nigerian bank CSV settlements accurately', () => {
    const csvContent = `Date,Reference,Amount,Narration,Sender
2026-09-20,999001234567890123456789012345,"25,000.00",NIP TRF / CHIDI OKAFOR,Chidi Okafor
2026-09-20,999001234567890123456789012346,15000.00,NIP TRF / AMINA DANJUMA,Amina Danjuma
`;
    const buffer = Buffer.from(csvContent, 'utf-8');
    const parsed = ReconciliationService.parseCsvSettlement(buffer);

    expect(parsed).toHaveLength(2);
    expect(parsed[0].reference).toBe('999001234567890123456789012345');
    expect(parsed[0].amount).toBe(25000);
    expect(parsed[0].sender).toBe('Chidi Okafor');

    expect(parsed[1].reference).toBe('999001234567890123456789012346');
    expect(parsed[1].amount).toBe(15000);
  });
});
