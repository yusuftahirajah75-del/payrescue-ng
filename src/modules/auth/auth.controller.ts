import { Request, Response } from 'express';
import { AuthDomainService } from './auth.service';
import { AuthService } from '../../middleware/auth';
import { ApiResponseHandler } from '../../utils/apiResponse';
import { BadRequestError } from '../../utils/errors';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const meta = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.socket.remoteAddress,
    };

    const result = await AuthDomainService.register(req.body, meta);

    // Set secure httpOnly cookies
    AuthService.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    ApiResponseHandler.created(
      res,
      {
        user: result.user,
        business: result.business,
        token: result.tokens.accessToken,
      },
      'Account created successfully. Welcome to PayRescue.'
    );
  }

  static async login(req: Request, res: Response): Promise<void> {
    const meta = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.socket.remoteAddress,
    };

    const result = await AuthDomainService.login(req.body, meta);

    // Set secure httpOnly cookies
    AuthService.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    ApiResponseHandler.success(
      res,
      {
        user: result.user,
        token: result.tokens.accessToken,
      },
      'Authenticated successfully.'
    );
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    const token = req.cookies?.refresh_token || req.body?.refreshToken;
    if (!token) {
      throw new BadRequestError('Refresh token required in cookie or request body.');
    }

    const tokens = await AuthDomainService.refreshToken(token);
    AuthService.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    ApiResponseHandler.success(res, { token: tokens.accessToken }, 'Session refreshed successfully.');
  }

  static async logout(req: Request, res: Response): Promise<void> {
    const token = req.cookies?.refresh_token || req.body?.refreshToken;
    await AuthDomainService.logout(token);
    AuthService.clearAuthCookies(res);

    ApiResponseHandler.success(res, null, 'Logged out successfully.');
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    await AuthDomainService.forgotPassword(req.body.email);
    ApiResponseHandler.success(
      res,
      null,
      'If an account exists with this email, a password reset instruction has been dispatched.'
    );
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    await AuthDomainService.resetPassword(req.body.token, req.body.newPassword);
    ApiResponseHandler.success(res, null, 'Password reset successful. You may now log in.');
  }

  static async changePassword(req: Request, res: Response): Promise<void> {
    await AuthDomainService.changePassword(
      req.user!.id,
      req.body.currentPassword,
      req.body.newPassword
    );
    ApiResponseHandler.success(res, null, 'Password updated successfully.');
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    const user = await AuthDomainService.getMe(req.user!.id);
    ApiResponseHandler.success(res, user, 'User profile retrieved.');
  }
}
