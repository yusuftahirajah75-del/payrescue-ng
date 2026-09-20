import pino from 'pino';
import { config } from '../config';

export const logger = pino({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    config.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
          },
        }
      : undefined,
  base: {
    service: 'payrescue-backend',
    env: config.NODE_ENV,
  },
  redact: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token', 'secret'],
});
