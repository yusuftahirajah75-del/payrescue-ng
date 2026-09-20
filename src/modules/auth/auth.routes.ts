import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.dto';

const router = Router();

router.post('/register', validateRequest({ body: registerSchema }), AuthController.register);
router.post('/login', validateRequest({ body: loginSchema }), AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', validateRequest({ body: forgotPasswordSchema }), AuthController.forgotPassword);
router.post('/reset-password', validateRequest({ body: resetPasswordSchema }), AuthController.resetPassword);

// Authenticated Routes
router.get('/me', authenticate, AuthController.getMe);
router.put(
  '/change-password',
  authenticate,
  validateRequest({ body: changePasswordSchema }),
  AuthController.changePassword
);

export const authRoutes = router;
