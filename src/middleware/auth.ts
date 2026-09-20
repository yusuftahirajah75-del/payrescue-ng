import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { config } from '../config';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { prisma } from '../prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      businessId?: string;
      businessRole?: Role;
    }
  }
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
}

export class AuthService {
  static generateTokens(user: { id: string; email: string; role: Role }): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRATION as any,
    });

    const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRATION as any,
    });

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.JWT_ACCESS_SECRET) as TokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }

  static verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  static setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProd = config.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: config.COOKIE_SECURE || isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      domain: config.COOKIE_DOMAIN === 'localhost' ? undefined : config.COOKIE_DOMAIN,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: config.COOKIE_SECURE || isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      domain: config.COOKIE_DOMAIN === 'localhost' ? undefined : config.COOKIE_DOMAIN,
    });
  }

  static clearAuthCookies(res: Response): void {
    const isProd = config.NODE_ENV === 'production';
    const cookieOpts = {
      httpOnly: true,
      secure: config.COOKIE_SECURE || isProd,
      sameSite: isProd ? ('none' as const) : ('lax' as const),
      domain: config.COOKIE_DOMAIN === 'localhost' ? undefined : config.COOKIE_DOMAIN,
    };
    res.clearCookie('access_token', cookieOpts);
    res.clearCookie('refresh_token', cookieOpts);
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    // 1. Check HTTP-Only Cookie
    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }
    // 2. Check Authorization Header Bearer
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required. Missing token.');
    }

    const decoded = AuthService.verifyAccessToken(token);

    // Fetch user from DB to verify status
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User account not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenError(`Account is ${user.status.toLowerCase()}. Please contact support.`);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // SUPER_ADMIN has access to all authorized endpoints
    if (req.user.role === Role.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Action forbidden. Required roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };
}
