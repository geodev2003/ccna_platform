import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const progress = await prisma.lessonProgress.findMany({
      where: { userId: req.user!.id },
      include: { lesson: { select: { id: true, title: true, type: true, durationMin: true, module: { select: { title: true, phase: true } } } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(progress);
  } catch (e) { next(e); }
});

router.get('/me/modules/:moduleId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const lessons = await prisma.lesson.findMany({
      where: { moduleId: req.params.moduleId, isPublished: true },
      orderBy: { orderIndex: 'asc' },
      include: {
        progress: { where: { userId: req.user!.id }, select: { status: true, timeSpentSec: true, completedAt: true } },
        _count: { select: { quizzes: true, labs: true } },
      },
    });
    const total = lessons.length;
    const completed = lessons.filter(l => l.progress[0]?.status === 'COMPLETED').length;
    res.json({
      moduleId: req.params.moduleId, total, completed,
      pct: total > 0 ? Math.round(completed / total * 100) : 0,
      lessons,
    });
  } catch (e) { next(e); }
});

export default router;
