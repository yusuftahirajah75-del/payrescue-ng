import { CryptoUtils } from '../src/utils/crypto';
import { NigeriaUtils } from '../src/utils/nigeria';

describe('Cryptographic & Nigeria Utilities Suite', () => {
  it('should compute consistent SHA-256 digests for evidence tampering protection', () => {
    const data = Buffer.from('Official Bank Debit Alert Receipt');
    const hash = CryptoUtils.sha256(data);

    expect(hash).toHaveLength(64);
    expect(CryptoUtils.sha256(data)).toBe(hash);
  });

  it('should generate secure API keys with pr_live_ and pr_test_ prefixes', () => {
    const liveKey = CryptoUtils.generateApiKey('live');
    expect(liveKey.rawKey.startsWith('pr_live_')).toBe(true);
    expect(liveKey.hashedKey).toHaveLength(64);

    const testKey = CryptoUtils.generateApiKey('test');
    expect(testKey.rawKey.startsWith('pr_test_')).toBe(true);
    expect(testKey.hashedKey).toHaveLength(64);
  });

  it('should sign and verify HMAC SHA-256 webhook signatures timing-safely', () => {
    const payload = JSON.stringify({ event: 'case.resolved', amount: 50000 });
    const secret = 'whsec_test_secret_key_12345';

    const signature = CryptoUtils.signHmacSha256(payload, secret);
    const isValid = CryptoUtils.verifyHmacSignature(payload, signature, secret);

    expect(isValid).toBe(true);

    const isTamperedValid = CryptoUtils.verifyHmacSignature(payload + 'tamper', signature, secret);
    expect(isTamperedValid).toBe(false);
  });

  it('should correctly normalize Nigerian phone numbers to E.164 (+234...) format', () => {
    expect(NigeriaUtils.normalizePhoneNumber('08031234567')).toBe('+2348031234567');
    expect(NigeriaUtils.normalizePhoneNumber('2348031234567')).toBe('+2348031234567');
    expect(NigeriaUtils.normalizePhoneNumber('+2348031234567')).toBe('+2348031234567');
    expect(NigeriaUtils.normalizePhoneNumber('0701-234-5678')).toBe('+2347012345678');
  });

  it('should validate Nigerian mobile numbers', () => {
    expect(NigeriaUtils.isValidNigerianPhone('+2348031234567')).toBe(true);
    expect(NigeriaUtils.isValidNigerianPhone('08031234567')).toBe(true);
    expect(NigeriaUtils.isValidNigerianPhone('+14155552671')).toBe(false);
  });

  it('should format numbers to Nigerian Naira currency display', () => {
    const formatted = NigeriaUtils.formatNaira(15000.5);
    expect(formatted).toContain('15,000.50');
  });
});
