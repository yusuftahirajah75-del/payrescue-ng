import { Request, Response } from 'express';
import { NotificationsService } from './notifications.service';
import { ApiResponseHandler } from '../../utils/apiResponse';

export class NotificationsController {
  static async list(req: Request, res: Response): Promise<void> {
    const unreadOnly = req.query.unread === 'true';
    const notifs = await NotificationsService.listUserNotifications(req.user!.id, unreadOnly);
    ApiResponseHandler.success(res, notifs, 'Notifications retrieved.');
  }

  static async markRead(req: Request, res: Response): Promise<void> {
    await NotificationsService.markAsRead(req.params.id, req.user!.id);
    ApiResponseHandler.success(res, null, 'Notification marked as read.');
  }

  static async markAllRead(req: Request, res: Response): Promise<void> {
    await NotificationsService.markAllAsRead(req.user!.id);
    ApiResponseHandler.success(res, null, 'All notifications marked as read.');
  }
}
