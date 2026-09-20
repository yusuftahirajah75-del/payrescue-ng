import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  API_PREFIX: z.string().default('/api/v1'),
  APP_NAME: z.string().default('PayRescue NG'),
  APP_URL: z.string().default('http://localhost:5000'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/payrescue_db?schema=public'),

  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.string().transform(Number).default('6379'),

  JWT_ACCESS_SECRET: z.string().default('payrescue_super_secure_access_secret_key_2026_lagos'),
  JWT_REFRESH_SECRET: z.string().default('payrescue_super_secure_refresh_secret_key_2026_nigeria'),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: z.string().transform((v) => v === 'true').default('false'),

  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),

  STORAGE_DRIVER: z.enum(['local', 's3', 'cloudinary']).default('local'),
  LOCAL_UPLOAD_DIR: z.string().default('./uploads'),
  AWS_ACCESS_KEY_ID: z.string().optional().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().optional().default(''),
  AWS_REGION: z.string().default('eu-west-1'),
  AWS_S3_BUCKET: z.string().default('payrescue-evidence-vault'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  PAYSTACK_SECRET_KEY: z.string().default('sk_test_placeholder_payrescue_nigeria'),
  PAYSTACK_PUBLIC_KEY: z.string().default('pk_test_placeholder_payrescue_nigeria'),
  PAYSTACK_WEBHOOK_SECRET: z.string().default('whsec_placeholder_payrescue_webhook'),

  EMAIL_DRIVER: z.enum(['mock', 'smtp', 'resend']).default('mock'),
  RESEND_API_KEY: z.string().optional().default(''),
  SMTP_HOST: z.string().default('smtp.mailtrap.io'),
  SMTP_PORT: z.string().transform(Number).default('2525'),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('PayRescue Support <support@payrescue.ng>'),

  SMS_DRIVER: z.enum(['mock', 'termii']).default('mock'),
  TERMII_API_KEY: z.string().optional().default(''),
  TERMII_SENDER_ID: z.string().default('PayRescue'),

  MALWARE_SCANNER_ENABLED: z.string().transform((v) => v === 'true').default('false'),
  CLAMAV_HOST: z.string().default('localhost'),
  CLAMAV_PORT: z.string().transform(Number).default('3310'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;
