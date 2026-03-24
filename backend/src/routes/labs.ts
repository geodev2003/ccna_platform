import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const router = Router();

router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const lab = await prisma.lab.findUnique({
      where: { id: req.params.id },
      include: {
        lesson: { select: { id: true, title: true } },
        attempts: { where: { userId: req.user!.id }, orderBy: { startedAt: 'desc' }, take: 1 },
      },
    });
    if (!lab) throw new AppError('Lab not found', 404);
    res.json(lab);
  } catch (e) { next(e); }
});

router.post('/:id/start', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const attempt = await prisma.labAttempt.create({
      data: { userId: req.user!.id, labId: req.params.id, status: 'IN_PROGRESS' },
    });
    await prisma.activityLog.create({ data: { userId: req.user!.id, action: 'LAB_START', entityId: req.params.id } });
    res.status(201).json(attempt);
  } catch (e) { next(e); }
});

router.patch('/:id/attempts/:attemptId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { status, notes, timeTaken } = z.object({
      status: z.enum(['IN_PROGRESS','COMPLETED','SKIPPED']),
      notes: z.string().optional(),
      timeTaken: z.number().int().optional(),
    }).parse(req.body);
    const attempt = await prisma.labAttempt.update({
      where: { id: req.params.attemptId },
      data: { status, notes, timeTaken, completedAt: status === 'COMPLETED' ? new Date() : undefined },
    });
    if (status === 'COMPLETED') {
      await prisma.activityLog.create({ data: { userId: req.user!.id, action: 'LAB_COMPLETE', entityId: req.params.id, meta: { timeTaken } } });
    }
    res.json(attempt);
  } catch (e) { next(e); }
});

router.post('/', authenticate, requireRole('ADMIN','INSTRUCTOR'), async (req, res, next) => {
  try {
    const data = z.object({
      lessonId: z.string(), title: z.string().min(3), description: z.string(),
      objectives: z.array(z.string()), topology: z.any().optional(),
      instructions: z.array(z.any()), toolRequired: z.string().default('Packet Tracer'),
      durationMin: z.number().int().default(60),
    }).parse(req.body);
    res.status(201).json(await prisma.lab.create({ data }));
  } catch (e) { next(e); }
});

router.patch('/:id', authenticate, requireRole('ADMIN','INSTRUCTOR'), async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string().optional(), description: z.string().optional(),
      objectives: z.array(z.string()).optional(), topology: z.any().optional(),
      instructions: z.array(z.any()).optional(), durationMin: z.number().optional(),
    }).parse(req.body);
    res.json(await prisma.lab.update({ where: { id: req.params.id }, data }));
  } catch (e) { next(e); }
});

router.delete('/:id', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try { await prisma.lab.delete({ where: { id: req.params.id } }); res.json({ message: 'Deleted' }); }
  catch (e) { next(e); }
});

export default router;
