import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { courseType } = req.query;
    const whereClause: any = { isPublished: true };
    if (courseType === 'CCNA' || courseType === 'IELTS') {
      whereClause.courseType = courseType;
    }
    const mods = await prisma.module.findMany({
      where: whereClause, orderBy: { orderIndex: 'asc' },
      include: { _count: { select: { lessons: true } }, enrollments: { where: { userId: req.user!.id } } },
    });
    const result = await Promise.all(mods.map(async m => {
      const ids = (await prisma.lesson.findMany({ where: { moduleId: m.id, isPublished: true }, select: { id: true } })).map(l => l.id);
      const done = await prisma.lessonProgress.count({ where: { userId: req.user!.id, lessonId: { in: ids }, status: 'COMPLETED' } });
      return { ...m, lessonCount: m._count.lessons, completedCount: done, enrolled: m.enrollments.length > 0, enrollments: undefined, _count: undefined };
    }));
    res.json(result);
  } catch (e) { next(e); }
});

router.get('/:slug', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'INSTRUCTOR';
    const m = await prisma.module.findUnique({
      where: { slug: req.params.slug, ...(isAdmin ? {} : { isPublished: true }) },
      include: {
        lessons: {
          where: isAdmin ? {} : { isPublished: true },
          orderBy: { orderIndex: 'asc' },
          include: {
            tags: { include: { tag: true } },
            _count: { select: { quizzes: true, labs: true } },
            progress: { where: { userId: req.user!.id }, select: { status: true, timeSpentSec: true } },
          },
        },
      },
    });
    if (!m) throw new AppError('Module not found', 404);
    res.json(m);
  } catch (e) { next(e); }
});

router.post('/', authenticate, requireRole('ADMIN','INSTRUCTOR'), async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string().min(3), slug: z.string().regex(/^[a-z0-9-]+$/),
      description: z.string(), phase: z.number().int().min(1).max(4),
      orderIndex: z.number().int(), isPublished: z.boolean().optional(),
      courseType: z.enum(['CCNA', 'IELTS']).optional(),
    }).parse(req.body);
    res.status(201).json(await prisma.module.create({ data }));
  } catch (e) { next(e); }
});

router.patch('/:id', authenticate, requireRole('ADMIN','INSTRUCTOR'), async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string().optional(), description: z.string().optional(),
      phase: z.number().optional(), orderIndex: z.number().optional(),
      isPublished: z.boolean().optional(),
      courseType: z.enum(['CCNA', 'IELTS']).optional(),
    }).parse(req.body);
    res.json(await prisma.module.update({ where: { id: req.params.id }, data }));
  } catch (e) { next(e); }
});

router.delete('/:id', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    await prisma.module.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
});

router.post('/:id/enroll', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const e = await prisma.enrollment.upsert({
      where: { userId_moduleId: { userId: req.user!.id, moduleId: req.params.id } },
      create: { userId: req.user!.id, moduleId: req.params.id },
      update: {},
    });
    res.json(e);
  } catch (e) { next(e); }
});

export default router;
