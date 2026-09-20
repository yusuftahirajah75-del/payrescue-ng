import { NotificationChannel } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { getEmailSender, SmsSender } from './adapters';

export class NotificationsService {
  static async sendNotification(params: {
    userId: string;
    channel?: NotificationChannel;
    title: string;
    body: string;
    linkUrl?: string;
    metadata?: any;
  }) {
    const channel = params.channel || NotificationChannel.IN_APP;

    const notif = await prisma.notification.create({
      data: {
        userId: params.userId,
        channel,
        title: params.title,
        body: params.body,
        linkUrl: params.linkUrl,
        metadata: params.metadata,
        sentAt: new Date(),
      },
    });

    // If Email channel requested
    if (channel === NotificationChannel.EMAIL) {
      const user = await prisma.user.findUnique({ where: { id: params.userId } });
      if (user && user.email) {
        const emailSender = getEmailSender();
        emailSender
          .send({
            to: user.email,
            subject: params.title,
            html: `<p>${params.body}</p>`,
          })
          .catch(() => {});
      }
    }

    return notif;
  }

  static async listUserNotifications(userId: string, unreadOnly: boolean = false) {
    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  static async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
