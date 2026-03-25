import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const router = Router();

router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
      include: {
        module: { select: { id: true, title: true, slug: true } },
        tags: { include: { tag: true } },
        quizzes: {
          select: { id: true, title: true, passingScore: true, timeLimit: true, _count: { select: { questions: true } },
            attempts: { where: { userId: req.user!.id }, orderBy: { completedAt: 'desc' }, take: 1, select: { score: true, passed: true } } },
        },
        labs: {
          select: { id: true, title: true, description: true, durationMin: true, toolRequired: true,
            attempts: { where: { userId: req.user!.id }, orderBy: { startedAt: 'desc' }, take: 1, select: { status: true } } },
        },
        progress: { where: { userId: req.user!.id }, select: { status: true, timeSpentSec: true, completedAt: true } },
      },
    });
    if (!lesson) throw new AppError('Lesson not found', 404);
    await prisma.activityLog.create({ data: { userId: req.user!.id, action: 'LESSON_VIEW', entityId: lesson.id } });
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: req.user!.id, lessonId: lesson.id } },
      create: { userId: req.user!.id, lessonId: lesson.id, status: 'IN_PROGRESS', lastAccessAt: new Date() },
      update: { lastAccessAt: new Date(), status: lesson.progress[0]?.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS' },
    });
    res.json(lesson);
  } catch (e) { next(e); }
});

router.post('/reorder', authenticate, requireRole('ADMIN','INSTRUCTOR'), async (req, res, next) => {
  try {
    const { lessons } = z.object({
      lessons: z.array(z.object({ id: z.string(), orderIndex: z.number().int() })),
    }).parse(req.body);
    await Promise.all(lessons.map(({ id, orderIndex }) =>
      prisma.lesson.update({ where: { id }, data: { orderIndex } })
    ));
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post('/', authenticate, requireRole('ADMIN','INSTRUCTOR'), async (req, res, next) => {
  try {
    const data = z.object({
      moduleId: z.string(), title: z.string().min(3),
      slug: z.string().regex(/^[a-z0-9-]+$/),
      type: z.enum(['THEORY','LAB','QUIZ_ONLY','MIXED']),
      orderIndex: z.number().int(), durationMin: z.number().optional(),
      content: z.array(z.any()), isPublished: z.boolean().optional(), isFree: z.boolean().optional(),
    }).parse(req.body);
    res.status(201).json(await prisma.lesson.create({ data }));
  } catch (e) { next(e); }
});

router.patch('/:id', authenticate, requireRole('ADMIN','INSTRUCTOR'), async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string().optional(), type: z.enum(['THEORY','LAB','QUIZ_ONLY','MIXED']).optional(),
      orderIndex: z.number().optional(), durationMin: z.number().optional(),
      content: z.array(z.any()).optional(), isPublished: z.boolean().optional(), isFree: z.boolean().optional(),
    }).parse(req.body);
    res.json(await prisma.lesson.update({ where: { id: req.params.id }, data }));
  } catch (e) { next(e); }
});

router.delete('/:id', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    await prisma.lesson.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
});

router.post('/:id/complete', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { timeSpentSec } = z.object({ timeSpentSec: z.number().int().min(0) }).parse(req.body);
    const p = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: req.user!.id, lessonId: req.params.id } },
      create: { userId: req.user!.id, lessonId: req.params.id, status: 'COMPLETED', timeSpentSec, completedAt: new Date(), lastAccessAt: new Date() },
      update: { status: 'COMPLETED', timeSpentSec: { increment: timeSpentSec }, completedAt: new Date(), lastAccessAt: new Date() },
    });
    await prisma.activityLog.create({ data: { userId: req.user!.id, action: 'LESSON_COMPLETE', entityId: req.params.id, meta: { timeSpentSec } } });
    res.json(p);
  } catch (e) { next(e); }
});

router.patch('/:id/time', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { seconds } = z.object({ seconds: z.number().int().min(1) }).parse(req.body);
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: req.user!.id, lessonId: req.params.id } },
      create: { userId: req.user!.id, lessonId: req.params.id, status: 'IN_PROGRESS', timeSpentSec: seconds, lastAccessAt: new Date() },
      update: { timeSpentSec: { increment: seconds }, lastAccessAt: new Date() },
    });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
