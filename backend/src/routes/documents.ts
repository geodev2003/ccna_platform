import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const FILE_TYPES = ['pdf', 'video', 'image', 'doc', 'spreadsheet', 'other'] as const;

router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { folder, type, q } = req.query as Record<string, string>;
    const docs = await prisma.document.findMany({
      where: {
        userId: req.user!.id,
        ...(folder ? { folder } : {}),
        ...(type   ? { fileType: type } : {}),
        ...(q      ? { title: { contains: q, mode: 'insensitive' } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(docs);
  } catch (e) { next(e); }
});

router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      title:       z.string().min(1).max(200),
      description: z.string().max(500).optional(),
      fileName:    z.string().min(1),
      fileUrl:     z.string().url(),
      fileType:    z.enum(FILE_TYPES),
      fileSize:    z.number().int().positive().optional(),
      folder:      z.string().max(100).optional(),
      tags:        z.array(z.string().max(50)).max(10).default([]),
      isPublic:    z.boolean().default(false),
    }).parse(req.body);

    const doc = await prisma.document.create({
      data: { ...data, userId: req.user!.id },
    });
    res.status(201).json(doc);
  } catch (e) { next(e); }
});

router.patch('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.user!.id)
      return res.status(404).json({ message: 'Not found' });

    const data = z.object({
      title:       z.string().min(1).max(200).optional(),
      description: z.string().max(500).nullable().optional(),
      folder:      z.string().max(100).nullable().optional(),
      tags:        z.array(z.string().max(50)).max(10).optional(),
      isPublic:    z.boolean().optional(),
    }).parse(req.body);

    const doc = await prisma.document.update({ where: { id: req.params.id }, data });
    res.json(doc);
  } catch (e) { next(e); }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.user!.id)
      return res.status(404).json({ message: 'Not found' });
    await prisma.document.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
});

export default router;
