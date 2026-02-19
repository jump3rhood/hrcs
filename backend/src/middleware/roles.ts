import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const requireRole =
  (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
