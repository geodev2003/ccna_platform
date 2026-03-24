import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer ')) throw new AppError('No token', 401);
    const payload = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: payload.userId, isActive: true },
      select: { id: true, email: true, role: true },
    });
    if (!user) throw new AppError('User not found', 401);
    req.user = user; next();
  } catch (e) {
    next(e instanceof jwt.JsonWebTokenError ? new AppError('Invalid token', 401) : e);
  }
};

export const requireRole = (...roles: string[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role))
      return next(new AppError('Insufficient permissions', 403));
    next();
  };
