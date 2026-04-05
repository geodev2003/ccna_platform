import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/errorHandler';
import { logger } from './utils/logger';
import authRoutes      from './routes/auth';
import usersRoutes     from './routes/users';
import modulesRoutes   from './routes/modules';
import lessonsRoutes   from './routes/lessons';
import quizzesRoutes   from './routes/quizzes';
import labsRoutes      from './routes/labs';
import progressRoutes  from './routes/progress';
import analyticsRoutes from './routes/analytics';
import aiRoutes        from './routes/ai';
import adminRoutes     from './routes/admin';
import profileRoutes   from './routes/profile';
import documentsRoutes from './routes/documents';

const app = express();
const API = '/api/v1';

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined', { stream: { write: m => logger.info(m.trim()) } }));

app.use('/api', rateLimit({ windowMs: 15*60*1000, max: 200 }));
app.use(`${API}/auth/login`,          rateLimit({ windowMs: 15*60*1000, max: 10 }));
app.use(`${API}/auth/register`,       rateLimit({ windowMs: 15*60*1000, max: 5 }));
app.use(`${API}/auth/forgot-password`, rateLimit({ windowMs: 15*60*1000, max: 5 }));
app.use(`${API}/auth/reset-password`,  rateLimit({ windowMs: 15*60*1000, max: 5 }));

app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

app.use(`${API}/auth`,      authRoutes);
app.use(`${API}/users`,     usersRoutes);
app.use(`${API}/modules`,   modulesRoutes);
app.use(`${API}/lessons`,   lessonsRoutes);
app.use(`${API}/quizzes`,   quizzesRoutes);
app.use(`${API}/labs`,      labsRoutes);
app.use(`${API}/progress`,  progressRoutes);
app.use(`${API}/analytics`, analyticsRoutes);
app.use(`${API}/ai`,        aiRoutes);
app.use(`${API}/admin`,     adminRoutes);
app.use(`${API}/profile`,   profileRoutes);
app.use(`${API}/documents`, documentsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => logger.info(`API running on :${PORT}`));
export default app;
