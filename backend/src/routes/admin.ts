import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireRole('ADMIN'));

router.get('/stats', async (_req, res, next) => {
  try {
    const [users, modules, lessons, quizzes, labs, attempts] = await Promise.all([
      prisma.user.count(),
      prisma.module.count(),
      prisma.lesson.count(),
      prisma.quiz.count(),
      prisma.lab.count(),
      prisma.quizAttempt.count(),
    ]);
    const avgAgg = await prisma.quizAttempt.aggregate({ _avg: { score: true } });
    res.json({ users, modules, lessons, quizzes, labs, attempts, avgScore: Math.round(avgAgg._avg.score ?? 0) });
  } catch (e) { next(e); }
});

router.patch('/users/:id', async (req, res, next) => {
  try {
    const data = z.object({
      role: z.enum(['STUDENT','INSTRUCTOR','ADMIN']).optional(),
      isActive: z.boolean().optional(),
    }).parse(req.body);
    res.json(await prisma.user.update({ where: { id: req.params.id }, data, select: { id: true, name: true, email: true, role: true, isActive: true } }));
  } catch (e) { next(e); }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'User deactivated' });
  } catch (e) { next(e); }
});

router.get('/activity', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const logs = await prisma.activityLog.findMany({
      skip: (page-1)*limit, take: limit, orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });
    res.json(logs);
  } catch (e) { next(e); }
});

export default router;
