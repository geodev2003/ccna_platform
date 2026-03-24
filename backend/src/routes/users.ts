// src/routes/users.ts
import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, createdAt: true },
    });
    res.json(user);
  } catch (e) { next(e); }
});

router.patch('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      name: z.string().min(2).optional(),
      avatarUrl: z.string().url().optional(),
    }).parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: { id: true, name: true, email: true, role: true, avatarUrl: true },
    });
    res.json(user);
  } catch (e) { next(e); }
});

router.patch('/me/password', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = z.object({
      currentPassword: z.string(), newPassword: z.string().min(8),
    }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user || !await (await import('bcryptjs')).compare(currentPassword, user.passwordHash))
      throw (await import('../utils/AppError')).AppError.prototype.constructor('Incorrect password', 401);
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user!.id }, data: { passwordHash } });
    res.json({ message: 'Password updated' });
  } catch (e) { next(e); }
});

export default router;
