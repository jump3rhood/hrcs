import { Router } from 'express';
import { body } from 'express-validator';
import { register, verifyEmail, login, getMe } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('role').isIn(['candidate', 'employer']),
  ],
  validate,
  register
);

router.get('/verify-email', verifyEmail);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  login
);

router.get('/me', authenticate, getMe);

export default router;
