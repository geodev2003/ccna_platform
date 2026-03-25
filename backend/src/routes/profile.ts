import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const profileSelect = {
  id: true, name: true, email: true, role: true, avatarUrl: true,
  bio: true, skills: true, linkedinUrl: true, githubUrl: true,
  websiteUrl: true, cvUrl: true, createdAt: true,
} as const;

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: profileSelect,
    });
    res.json(user);
  } catch (e) { next(e); }
});

router.patch('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      name:        z.string().min(2).max(100).optional(),
      avatarUrl:   z.string().url().nullable().optional(),
      bio:         z.string().max(600).nullable().optional(),
      skills:      z.array(z.object({
        name:     z.string().min(1).max(60),
        level:    z.number().int().min(0).max(100),
        category: z.string().optional(),
      })).nullable().optional(),
      linkedinUrl: z.string().url().nullable().optional(),
      githubUrl:   z.string().url().nullable().optional(),
      websiteUrl:  z.string().url().nullable().optional(),
      cvUrl:       z.string().url().nullable().optional(),
    }).parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: profileSelect,
    });
    res.json(user);
  } catch (e) { next(e); }
});

export default router;
