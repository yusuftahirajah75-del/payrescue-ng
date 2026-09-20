import { prisma } from '../../prisma/client';
import { CreateApiKeyInput, CreateWebhookInput } from './developer.dto';
import { CryptoUtils } from '../../utils/crypto';
import { NotFoundError } from '../../utils/errors';

export class DeveloperService {
  static async createApiKey(businessId: string, input: CreateApiKeyInput) {
    const { rawKey, hashedKey, prefix } = CryptoUtils.generateApiKey(input.environment);

    const apiKey = await prisma.apiKey.create({
      data: {
        businessId,
        name: input.name,
        keyPrefix: `${prefix}${rawKey.slice(-4)}`,
        hashedKey,
        environment: input.environment,
        scopes: input.scopes,
        rateLimit: input.rateLimit,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        environment: true,
        scopes: true,
        rateLimit: true,
        createdAt: true,
      },
    });

    return {
      ...apiKey,
      rawSecretKey: rawKey, // Shown ONLY ONCE upon creation
      message: 'Store this secret key safely. You will not be able to see it again.',
    };
  }

  static async listApiKeys(businessId: string) {
    return prisma.apiKey.findMany({
      where: { businessId, isActive: true },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        environment: true,
        scopes: true,
        rateLimit: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async revokeApiKey(id: string, businessId: string) {
    const key = await prisma.apiKey.findFirst({
      where: { id, businessId },
    });

    if (!key) {
      throw new NotFoundError('API key not found');
    }

    return prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
    });
  }

  static async createWebhook(businessId: string, input: CreateWebhookInput) {
    const secretKey = `whsec_${CryptoUtils.generateSecureToken(24)}`;

    const webhook = await prisma.webhook.create({
      data: {
        businessId,
        targetUrl: input.targetUrl,
        secretKey,
        subscribedEvents: input.subscribedEvents,
      },
    });

    return webhook;
  }

  static async listWebhooks(businessId: string) {
    return prisma.webhook.findMany({
      where: { businessId },
      include: {
        deliveries: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  static async dispatchTestWebhook(webhookId: string, businessId: string) {
    const webhook = await prisma.webhook.findFirst({
      where: { id: webhookId, businessId },
    });

    if (!webhook) {
      throw new NotFoundError('Webhook not found');
    }

    const testPayload = {
      event: 'test.ping',
      timestamp: new Date().toISOString(),
      data: {
        message: 'PayRescue Webhook Delivery Test',
        businessId,
      },
    };

    const payloadString = JSON.stringify(testPayload);
    const signature = CryptoUtils.signHmacSha256(payloadString, webhook.secretKey);

    // Record delivery attempt
    const delivery = await prisma.webhookDelivery.create({
      data: {
        webhookId,
        eventType: 'test.ping',
        payload: testPayload,
        responseStatus: 200,
        responseBody: 'Test delivery simulation executed',
        attemptCount: 1,
        isSuccess: true,
        deliveredAt: new Date(),
      },
    });

    return {
      delivery,
      payload: testPayload,
      signatureHeader: `X-PayRescue-Signature: ${signature}`,
    };
  }

  static async getApiLogs(businessId: string) {
    return prisma.apiAuditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
  }
}
