import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { prisma } from '../prisma/client';

export function tenantIsolation(allowedRoles?: Role[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // 1. Identify Target Business ID from Route Params or Headers
      const businessId = (req.params.businessId || req.headers['x-business-id']) as string | undefined;

      if (!businessId) {
        throw new ForbiddenError('Business context required. Missing businessId.');
      }

      // 2. Allow SUPER_ADMIN or ADMIN global override
      if (req.user.role === Role.SUPER_ADMIN || req.user.role === Role.ADMIN) {
        const business = await prisma.business.findUnique({
          where: { id: businessId },
        });
        if (!business) {
          throw new NotFoundError('Business not found');
        }
        req.businessId = business.id;
        req.businessRole = req.user.role;
        return next();
      }

      // 3. Verify user membership in the requested business
      const membership = await prisma.businessMember.findUnique({
        where: {
          businessId_userId: {
            businessId,
            userId: req.user.id,
          },
        },
        include: {
          business: true,
        },
      });

      if (!membership) {
        throw new ForbiddenError('You do not belong to this business or tenant');
      }

      // 4. If allowedRoles specified, check member role
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(membership.role)) {
          throw new ForbiddenError(
            `Insufficient business permissions. Required roles: [${allowedRoles.join(', ')}]`
          );
        }
      }

      req.businessId = membership.businessId;
      req.businessRole = membership.role;

      next();
    } catch (error) {
      next(error);
    }
  };
}
