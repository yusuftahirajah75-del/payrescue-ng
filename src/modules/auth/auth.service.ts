import bcrypt from 'bcryptjs';
import { Role, AccountStatus } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { RegisterInput, LoginInput } from './auth.dto';
import { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } from '../../utils/errors';
import { AuthService } from '../../middleware/auth';
import { CryptoUtils } from '../../utils/crypto';
import { NigeriaUtils } from '../../utils/nigeria';

export class AuthDomainService {
  static async register(input: RegisterInput, meta?: { userAgent?: string; ipAddress?: string }) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictError('An account with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const normalizedPhone = input.phone ? NigeriaUtils.normalizePhoneNumber(input.phone) : null;

    if (normalizedPhone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
      });
      if (existingPhone) {
        throw new ConflictError('An account with this phone number already exists.');
      }
    }

    const emailVerifyToken = CryptoUtils.generateSecureToken(24);

    // Determine initial role
    let role = input.role || Role.USER;
    if (input.businessName) {
      role = Role.BUSINESS_OWNER;
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email.toLowerCase().trim(),
          passwordHash,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          phone: normalizedPhone,
          role,
          status: AccountStatus.ACTIVE,
          emailVerified: false,
          emailVerifyToken,
        },
      });

      let business = null;
      if (input.businessName || role === Role.BUSINESS_OWNER) {
        const slug = (input.businessName || `${user.firstName}-${user.lastName}`)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          + `-${Date.now().toString().slice(-4)}`;

        business = await tx.business.create({
          data: {
            name: input.businessName || `${user.firstName}'s Enterprise`,
            slug,
            contactEmail: user.email,
            contactPhone: user.phone,
            members: {
              create: {
                userId: user.id,
                role: Role.BUSINESS_OWNER,
                title: 'Founder / Owner',
              },
            },
          },
        });
      }

      return { user, business };
    });

    const tokens = AuthService.generateTokens({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    // Create session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.session.create({
      data: {
        userId: result.user.id,
        refreshToken: tokens.refreshToken,
        userAgent: meta?.userAgent,
        ipAddress: meta?.ipAddress,
        expiresAt,
      },
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        phone: result.user.phone,
        role: result.user.role,
        emailVerified: result.user.emailVerified,
      },
      business: result.business,
      tokens,
    };
  }

  static async login(input: LoginInput, meta?: { userAgent?: string; ipAddress?: string }) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
      include: {
        businessMembers: {
          include: { business: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    if (user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedError(`Your account is ${user.status.toLowerCase()}. Please contact support.`);
    }

    const tokens = AuthService.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Register active session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        userAgent: meta?.userAgent,
        ipAddress: meta?.ipAddress,
        expiresAt,
      },
    });

    // Audit login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: user.id,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
        businesses: user.businessMembers.map((m) => ({
          id: m.business.id,
          name: m.business.name,
          slug: m.business.slug,
          role: m.role,
        })),
      },
      tokens,
    };
  }

  static async refreshToken(refreshToken: string) {
    const payload = AuthService.verifyRefreshToken(refreshToken);

    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || !session.isValid || session.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token is invalid or expired. Please log in again.');
    }

    // Generate new token pair
    const tokens = AuthService.generateTokens({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    // Rotate refresh token in session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  static async logout(refreshToken?: string) {
    if (refreshToken) {
      await prisma.session
        .updateMany({
          where: { refreshToken },
          data: { isValid: false },
        })
        .catch(() => {});
    }
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Return true without disclosing whether email exists
      return true;
    }

    const token = CryptoUtils.generateSecureToken(32);
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpiry: expiry,
      },
    });

    // In a live environment, email dispatcher sends reset link with token
    return true;
  }

  static async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestError('Password reset token is invalid or has expired.');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    // Invalidate all existing sessions
    await prisma.session.updateMany({
      where: { userId: user.id },
      data: { isValid: false },
    });

    return true;
  }

  static async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const isValid = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isValid) {
      throw new BadRequestError('Current password provided is incorrect.');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPass, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return true;
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        businessMembers: {
          include: {
            business: {
              select: {
                id: true,
                name: true,
                slug: true,
                kybStatus: true,
                currency: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User profile not found.');
    }

    return user;
  }
}
