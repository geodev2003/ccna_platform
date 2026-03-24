import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, _n: NextFunction) => {
  logger.error(`${req.method} ${req.url} — ${err.message}`);
  if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
  if (err instanceof ZodError) return res.status(422).json({ error: 'Validation failed', details: err.errors });
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Already exists' });
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
  }
  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
};

export const notFound = (req: Request, res: Response) =>
  res.status(404).json({ error: `${req.method} ${req.path} not found` });
