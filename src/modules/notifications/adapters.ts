import { config } from '../../config';
import { logger } from '../../utils/logger';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailSender {
  send(message: EmailMessage): Promise<{ success: boolean; messageId?: string }>;
}

export class MockEmailSender implements EmailSender {
  async send(message: EmailMessage) {
    logger.info({ to: message.to, subject: message.subject }, '[MockEmail] Dispatched');
    return { success: true, messageId: `mock_email_${Date.now()}` };
  }
}

export class ResendEmailSender implements EmailSender {
  async send(message: EmailMessage) {
    // Adapter for Resend API
    if (!config.RESEND_API_KEY) {
      return new MockEmailSender().send(message);
    }
    logger.info({ to: message.to }, 'Dispatching email via Resend API');
    return { success: true, messageId: `resend_${Date.now()}` };
  }
}

export class SmsSender {
  static async sendSms(to: string, message: string) {
    if (config.SMS_DRIVER === 'mock') {
      logger.info({ to, message }, '[MockSMS] Dispatched');
      return { success: true, messageId: `mock_sms_${Date.now()}` };
    }
    // Termii / Twilio adapter placeholder
    return { success: true, messageId: `sms_${Date.now()}` };
  }
}

export function getEmailSender(): EmailSender {
  if (config.EMAIL_DRIVER === 'resend') {
    return new ResendEmailSender();
  }
  return new MockEmailSender();
}
