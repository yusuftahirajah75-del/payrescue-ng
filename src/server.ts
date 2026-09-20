import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { prisma } from './prisma/client';

const app = createApp();

const server = app.listen(config.PORT, () => {
  logger.info(`================================================================`);
  logger.info(`🛡️  PAYRESCUE NG — Transaction Recovery & Reconciliation API`);
  logger.info(`================================================================`);
  logger.info(`🚀 Server running on port: ${config.PORT}`);
  logger.info(`🌐 Environment: ${config.NODE_ENV}`);
  logger.info(`📚 Swagger OpenAPI Documentation: http://localhost:${config.PORT}/api/docs`);
  logger.info(`🩺 Health Endpoint: http://localhost:${config.PORT}/health`);
  logger.info(`⚡ API Base URL: http://localhost:${config.PORT}${config.API_PREFIX}`);
  logger.info(`================================================================`);
});

// Graceful Shutdown Handlers
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      await prisma.$disconnect();
      logger.info('Database connection closed cleanly.');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during database disconnect.');
      process.exit(1);
    }
  });

  // Force shutdown after 10s if connections linger
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Promise Rejection detected');
});

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught Exception detected! Exiting process...');
  process.exit(1);
});
