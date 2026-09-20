import crypto from 'crypto';

export class CryptoUtils {
  /**
   * Compute SHA-256 hash of a string or buffer (used for evidence integrity and API key hashing)
   */
  static sha256(data: string | Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate a secure random token (e.g. for email verification or password reset)
   */
  static generateSecureToken(bytes: number = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Generate an API Key with a prefix, and return both the raw secret and its SHA-256 hash
   */
  static generateApiKey(env: 'live' | 'test' = 'test'): {
    rawKey: string;
    hashedKey: string;
    prefix: string;
  } {
    const prefix = `pr_${env}_`;
    const randomEntropy = crypto.randomBytes(24).toString('hex');
    const rawKey = `${prefix}${randomEntropy}`;
    const hashedKey = this.sha256(rawKey);
    return { rawKey, hashedKey, prefix };
  }

  /**
   * Sign a payload with HMAC SHA-256 for outgoing webhooks
   */
  static signHmacSha256(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Verify HMAC signature timing-safely
   */
  static verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
    const expected = this.signHmacSha256(payload, secret);
    try {
      return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
    } catch {
      return false;
    }
  }

  /**
   * Generate human-readable case number: e.g. RC-202609-847291
   */
  static generateCaseNumber(): string {
    const now = new Date();
    const yearMonth = now.toISOString().slice(0, 7).replace('-', '');
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `RC-${yearMonth}-${rand}`;
  }

  /**
   * Generate internal transaction reference: e.g. PRTX-20260920-ABCD1234
   */
  static generateInternalReference(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `PRTX-${dateStr}-${randHex}`;
  }

  /**
   * Generate complaint reference: e.g. CP-202609-12345
   */
  static generateComplaintReference(): string {
    const now = new Date();
    const yearMonth = now.toISOString().slice(0, 7).replace('-', '');
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `CP-${yearMonth}-${rand}`;
  }
}
