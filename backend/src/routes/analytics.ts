import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const uid = req.user!.id;
    const now = new Date();
    const d7  = new Date(now.getTime() - 7  * 864e5);
    const d30 = new Date(now.getTime() - 30 * 864e5);

    const [totalLessons, completedLessons, totalAttempts, passedAttempts] = await Promise.all([
      prisma.lesson.count({ where: { isPublished: true } }),
      prisma.lessonProgress.count({ where: { userId: uid, status: 'COMPLETED' } }),
      prisma.quizAttempt.count({ where: { userId: uid } }),
      prisma.quizAttempt.count({ where: { userId: uid, passed: true } }),
    ]);

    const timeAgg  = await prisma.lessonProgress.aggregate({ where: { userId: uid }, _sum: { timeSpentSec: true } });
    const scoreAgg = await prisma.quizAttempt.aggregate({ where: { userId: uid }, _avg: { score: true } });

    // Streak
    const logs = await prisma.activityLog.findMany({
      where: { userId: uid, createdAt: { gte: d30 } }, select: { createdAt: true },
    });
    const days = [...new Set(logs.map(l => l.createdAt.toISOString().slice(0,10)))].sort().reverse();
    let streak = 0, check = now;
    for (const d of days) {
      check.setHours(0,0,0,0);
      const diff = Math.floor((check.getTime() - new Date(d).getTime()) / 864e5);
      if (diff <= 1) { streak++; check = new Date(d); } else break;
    }

    // Weekly activity
    const weekLogs = await prisma.activityLog.findMany({ where: { userId: uid, createdAt: { gte: d7 } }, select: { createdAt: true } });
    const weekMap: Record<string,number> = {};
    for (let i = 6; i >= 0; i--) { const d = new Date(now); d.setDate(d.getDate()-i); weekMap[d.toISOString().slice(0,10)] = 0; }
    weekLogs.forEach(l => { const k = l.createdAt.toISOString().slice(0,10); if (k in weekMap) weekMap[k]++; });

    // Module progress
    const modules = await prisma.module.findMany({ where: { isPublished: true }, orderBy: { orderIndex: 'asc' }, include: { lessons: { where: { isPublished: true }, select: { id: true } } } });
    const moduleProgress = await Promise.all(modules.map(async m => {
      const ids = m.lessons.map(l => l.id);
      const done = await prisma.lessonProgress.count({ where: { userId: uid, lessonId: { in: ids }, status: 'COMPLETED' } });
      return { moduleId: m.id, title: m.title, phase: m.phase, total: ids.length, completed: done, pct: ids.length > 0 ? Math.round(done/ids.length*100) : 0 };
    }));

    // Weak areas
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId: uid }, orderBy: { completedAt: 'desc' }, take: 50,
      include: { quiz: { include: { lesson: { select: { title: true } } } } },
    });
    const topicMap: Record<string, number[]> = {};
    attempts.forEach(a => { const t = a.quiz.lesson.title; (topicMap[t] ??= []).push(a.score); });
    const weakAreas = Object.entries(topicMap)
      .map(([t, s]) => ({ topic: t, avgScore: Math.round(s.reduce((a,b) => a+b,0)/s.length), attempts: s.length }))
      .filter(t => t.avgScore < 70).sort((a,b) => a.avgScore - b.avgScore).slice(0,5);

    // Recent completed
    const recent = await prisma.lessonProgress.findMany({
      where: { userId: uid, status: 'COMPLETED' }, orderBy: { completedAt: 'desc' }, take: 5,
      include: { lesson: { select: { title: true, type: true, module: { select: { title: true } } } } },
    });

    res.json({
      summary: {
        totalLessons, completedLessons,
        completionPct: Math.round(completedLessons / Math.max(totalLessons,1) * 100),
        totalTimeHours: Math.round((timeAgg._sum.timeSpentSec ?? 0) / 3600 * 10) / 10,
        totalAttempts, passedAttempts,
        avgScore: Math.round(scoreAgg._avg.score ?? 0),
        streak,
      },
      moduleProgress,
      weeklyActivity: Object.entries(weekMap).map(([date,count]) => ({ date, count })),
      weakAreas,
      recentCompleted: recent.map(p => ({ lessonTitle: p.lesson.title, moduleTitle: p.lesson.module.title, type: p.lesson.type, completedAt: p.completedAt })),
    });
  } catch (e) { next(e); }
});

router.get('/admin/overview', authenticate, requireRole('ADMIN'), async (_req, res, next) => {
  try {
    const d30 = new Date(Date.now() - 30 * 864e5);
    const [totalUsers, activeUsers, totalAttempts, avgAgg] = await Promise.all([
      prisma.user.count(), prisma.user.count({ where: { isActive: true } }),
      prisma.quizAttempt.count(), prisma.quizAttempt.aggregate({ _avg: { score: true } }),
    ]);
    const newUsers = await prisma.user.findMany({ where: { createdAt: { gte: d30 } }, select: { createdAt: true } });
    const regTrend: Record<string,number> = {};
    newUsers.forEach(u => { const k = u.createdAt.toISOString().slice(0,10); regTrend[k] = (regTrend[k]??0)+1; });

    const topGroups = await prisma.lessonProgress.groupBy({
      by: ['lessonId'], where: { status: 'COMPLETED' }, _count: { lessonId: true },
      orderBy: { _count: { lessonId: 'desc' } }, take: 10,
    });
    const topLessons = await Promise.all(topGroups.map(async g => {
      const l = await prisma.lesson.findUnique({ where: { id: g.lessonId }, select: { title: true } });
      return { lessonId: g.lessonId, title: l?.title, completions: g._count.lessonId };
    }));

    res.json({
      users: { total: totalUsers, active: activeUsers, registrationTrend: regTrend },
      quizzes: { totalAttempts, avgScore: Math.round(avgAgg._avg.score ?? 0) },
      topLessons,
    });
  } catch (e) { next(e); }
});

router.get('/admin/users', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page-1)*limit, take: limit, orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, _count: { select: { progress: true, quizAttempts: true } } },
      }),
      prisma.user.count(),
    ]);
    res.json({ users, total, page, totalPages: Math.ceil(total/limit) });
  } catch (e) { next(e); }
});

export default router;
