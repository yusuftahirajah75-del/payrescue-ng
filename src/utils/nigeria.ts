/**
 * Nigeria-First Utility Suite
 * Handles phone normalization, currency formatting, and bank/telco identifier validation.
 */
export class NigeriaUtils {
  /**
   * Normalizes Nigerian phone numbers into international E.164 format (+234...)
   * Examples:
   *  "08031234567" -> "+2348031234567"
   *  "2348031234567" -> "+2348031234567"
   *  "+2348031234567" -> "+2348031234567"
   */
  static normalizePhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('+234')) {
      return cleaned;
    }
    if (cleaned.startsWith('234')) {
      return `+${cleaned}`;
    }
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      return `+234${cleaned.slice(1)}`;
    }
    return cleaned;
  }

  /**
   * Validates if a string is a legitimate Nigerian mobile or fixed line
   */
  static isValidNigerianPhone(phone: string): boolean {
    const normalized = this.normalizePhoneNumber(phone);
    const regex = /^\+234[789][01]\d{8}$/;
    return regex.test(normalized);
  }

  /**
   * Format decimal / number to Nigerian Naira display
   * Example: 15400.5 -> "₦15,400.50"
   */
  static formatNaira(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(num);
  }

  /**
   * Validate standard NIBSS NIP Session ID format (30 characters, typically begins with 999 or bank code)
   */
  static isValidNipSessionId(sessionId: string): boolean {
    return typeof sessionId === 'string' && sessionId.trim().length === 30 && /^\d+$/.test(sessionId.trim());
  }

  /**
   * Validate Bank RRN (Retrieval Reference Number, typically 12 alphanumeric characters)
   */
  static isValidRrn(rrn: string): boolean {
    return typeof rrn === 'string' && rrn.trim().length >= 10 && rrn.trim().length <= 16;
  }
}
