import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const router = Router();

// GET quiz (questions without correct answers)
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: { options: { orderBy: { orderIndex: 'asc' }, select: { id: true, text: true, orderIndex: true } } },
        },
      },
    });
    if (!quiz) throw new AppError('Quiz not found', 404);
    res.json(quiz);
  } catch (e) { next(e); }
});

// Submit attempt
router.post('/:id/attempt', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { answers, timeTaken } = z.object({
      answers: z.array(z.object({ questionId: z.string(), selectedOptionIds: z.array(z.string()) })),
      timeTaken: z.number().int().min(0),
    }).parse(req.body);

    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: { questions: { include: { options: true } } },
    });
    if (!quiz) throw new AppError('Quiz not found', 404);

    let total = 0, earned = 0;
    const graded: { questionId: string; selectedIds: string[]; isCorrect: boolean }[] = [];
    for (const q of quiz.questions) {
      total += q.points;
      const sel = answers.find(a => a.questionId === q.id)?.selectedOptionIds ?? [];
      const correct = q.options.filter(o => o.isCorrect).map(o => o.id);
      const ok = sel.length === correct.length && sel.every(id => correct.includes(id));
      if (ok) earned += q.points;
      graded.push({ questionId: q.id, selectedIds: sel, isCorrect: ok });
    }
    const score = total > 0 ? Math.round(earned / total * 100) : 0;
    const passed = score >= quiz.passingScore;

    const attempt = await prisma.quizAttempt.create({
      data: { userId: req.user!.id, quizId: quiz.id, score, maxScore: 100, passed, timeTaken, answers: { create: graded } },
      include: { answers: { include: { question: { include: { options: true } } } } },
    });

    await prisma.activityLog.create({ data: { userId: req.user!.id, action: 'QUIZ_SUBMIT', entityId: quiz.id, meta: { score, passed } } });

    res.json({
      attemptId: attempt.id, score, passed, passingScore: quiz.passingScore, timeTaken,
      breakdown: attempt.answers.map(a => ({
        questionId: a.questionId, questionText: a.question.text,
        selectedIds: a.selectedIds, isCorrect: a.isCorrect,
        explanation: a.question.explanation,
        correctIds: a.question.options.filter(o => o.isCorrect).map(o => o.id),
      })),
    });
  } catch (e) { next(e); }
});

router.get('/:id/attempts', authenticate, async (req: AuthRequest, res, next) => {
  try {
    res.json(await prisma.quizAttempt.findMany({
      where: { quizId: req.params.id, userId: req.user!.id },
      orderBy: { completedAt: 'desc' },
      select: { id: true, score: true, passed: true, timeTaken: true, completedAt: true },
    }));
  } catch (e) { next(e); }
});

router.post('/', authenticate, requireRole('ADMIN','INSTRUCTOR'), async (req, res, next) => {
  try {
    const { questions, ...base } = z.object({
      lessonId: z.string(), title: z.string().min(3),
      passingScore: z.number().int().min(1).max(100).default(70),
      timeLimit: z.number().int().positive().optional(),
      questions: z.array(z.object({
        text: z.string(), type: z.enum(['SINGLE_CHOICE','MULTIPLE_CHOICE','TRUE_FALSE','FILL_BLANK']),
        explanation: z.string().optional(), points: z.number().default(1), orderIndex: z.number(),
        options: z.array(z.object({ text: z.string(), isCorrect: z.boolean(), orderIndex: z.number() })).min(2),
      })),
    }).parse(req.body);
    const quiz = await prisma.quiz.create({
      data: { ...base, questions: { create: questions.map(q => ({ ...q, options: { create: q.options } })) } },
      include: { questions: { include: { options: true } } },
    });
    res.status(201).json(quiz);
  } catch (e) { next(e); }
});

router.delete('/:id', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try { await prisma.quiz.delete({ where: { id: req.params.id } }); res.json({ message: 'Deleted' }); }
  catch (e) { next(e); }
});

export default router;
