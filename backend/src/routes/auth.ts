import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const makeTokens = (userId: string) => ({
  accessToken:  jwt.sign({ userId }, process.env.JWT_SECRET!,         { expiresIn: '15m' }),
  refreshToken: jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' }),
});
const WEEK = 7 * 24 * 60 * 60 * 1000;

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = z.object({
      name: z.string().min(2), email: z.string().email(), password: z.string().min(8),
    }).parse(req.body);
    if (await prisma.user.findUnique({ where: { email } }))
      throw new AppError('Email already registered', 409);
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, role: true },
    });
    const tokens = makeTokens(user.id);
    await prisma.refreshToken.create({ data: { ...tokens, token: tokens.refreshToken, userId: user.id, expiresAt: new Date(Date.now() + WEEK) } });
    res.status(201).json({ user, ...tokens });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive || !await bcrypt.compare(password, user.passwordHash))
      throw new AppError('Invalid credentials', 401);
    const tokens = makeTokens(user.id);
    await prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: user.id, expiresAt: new Date(Date.now() + WEEK) } });
    await prisma.activityLog.create({ data: { userId: user.id, action: 'LOGIN', meta: { ip: req.ip } } });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl }, ...tokens });
  } catch (e) { next(e); }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('Refresh token required', 400);
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) throw new AppError('Invalid refresh token', 401);
    const { userId } = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    const tokens = makeTokens(userId);
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    await prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId, expiresAt: new Date(Date.now() + WEEK) } });
    res.json(tokens);
  } catch (e) { next(e); }
});

router.post('/logout', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (req.body.refreshToken) await prisma.refreshToken.deleteMany({ where: { token: req.body.refreshToken } });
    res.json({ message: 'Logged out' });
  } catch (e) { next(e); }
});

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, createdAt: true },
    });
    res.json(user);
  } catch (e) { next(e); }
});

export default router;
