import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const router = Router();

const profileSelect = {
  id: true, name: true, email: true, role: true, avatarUrl: true,
  bio: true, skills: true, linkedinUrl: true, githubUrl: true,
  websiteUrl: true, cvUrl: true, createdAt: true,
} as const;

// Public profile fields (no email, no cvUrl for privacy)
const publicProfileSelect = {
  id: true, name: true, role: true, avatarUrl: true,
  bio: true, skills: true, linkedinUrl: true, githubUrl: true,
  websiteUrl: true, createdAt: true,
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

    // Prisma nullable JSON fields require Prisma.DbNull instead of plain null
    const { skills, ...rest } = data;
    const updateData: Prisma.UserUpdateInput = { ...rest };
    if (skills !== undefined) {
      updateData.skills = skills === null ? Prisma.DbNull : skills;
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
      select: profileSelect,
    });
    res.json(user);
  } catch (e) { next(e); }
});

// GET /profile/:userId — Public profile view (requires auth)
router.get('/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.params;
    // If requesting own profile, return full profile including email
    if (userId === req.user!.id) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: profileSelect,
      });
      if (!user) throw new AppError('User not found', 404);
      return res.json({ ...user, isOwner: true });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
      select: publicProfileSelect,
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ ...user, isOwner: false });
  } catch (e) { next(e); }
});

export default router;
