import { Router } from 'express';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

const router = Router();
const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are an expert CCNA instructor. Generate accurate, structured content for Cisco CCNA 200-301 certification. All content must be technically correct per Cisco documentation and exam objectives at cisco.com/go/ccna. Always respond with valid JSON only — no markdown, no explanation outside the JSON.`;

function parseJSON(text: string) {
  const m = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!m) throw new AppError('AI returned invalid JSON', 500);
  return JSON.parse(m[0]);
}

// POST /api/v1/ai/generate-lesson
router.post('/generate-lesson', authenticate, requireRole('ADMIN','INSTRUCTOR'), async (req, res, next) => {
  try {
    const { topic, phase, type, difficulty } = z.object({
      topic: z.string().min(3).max(200),
      phase: z.number().int().min(1).max(4),
      type: z.enum(['THEORY','LAB','MIXED']),
      difficulty: z.enum(['beginner','intermediate','advanced']).default('intermediate'),
    }).parse(req.body);

    const msg = await ai.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 4096, system: SYSTEM,
      messages: [{ role: 'user', content: `Generate a complete CCNA lesson.
Topic: "${topic}"
Phase: ${phase} | Type: ${type} | Difficulty: ${difficulty}

Return this exact JSON structure:
{
  "title": "string",
  "summary": "2-3 sentence overview",
  "objectives": ["learning objective 1", ...],
  "duration_min": number,
  "tags": ["tag1", ...],
  "ccna_exam_topics": ["exam topic string", ...],
  "content": [
    {"type":"heading","data":{"text":"string","level":1}},
    {"type":"paragraph","data":{"text":"string"}},
    {"type":"keypoints","data":{"points":["point1","point2"]}},
    {"type":"code","data":{"language":"cisco-ios","label":"Example","code":"commands here"}},
    {"type":"table","data":{"headers":["Col1","Col2"],"rows":[["r1c1","r1c2"]]}},
    {"type":"tip","data":{"text":"exam tip"}},
    {"type":"warning","data":{"text":"common mistake"}}
  ]
}
Include 10-15 content blocks covering theory, Cisco IOS commands, exam tips, and real-world context.` }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    res.json({ lesson: parseJSON(text), tokens: msg.usage });
  } catch (e) { next(e); }
});

// POST /api/v1/ai/generate-quiz
router.post('/generate-quiz', authenticate, requireRole('ADMIN','INSTRUCTOR'), async (req, res, next) => {
  try {
    const { lessonId, topic, questionCount, difficulty } = z.object({
      lessonId: z.string(),
      topic: z.string().min(3),
      questionCount: z.number().int().min(5).max(30).default(10),
      difficulty: z.enum(['easy','medium','hard','mixed']).default('mixed'),
    }).parse(req.body);

    const msg = await ai.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 3000, system: SYSTEM,
      messages: [{ role: 'user', content: `Generate ${questionCount} CCNA quiz questions.
Topic: "${topic}" | Difficulty: ${difficulty}

Return JSON array:
[{
  "text": "question text",
  "type": "SINGLE_CHOICE|MULTIPLE_CHOICE|TRUE_FALSE",
  "explanation": "detailed explanation of correct answer",
  "points": 1,
  "options": [{"text":"option text","isCorrect":true|false}]
}]

Rules:
- SINGLE_CHOICE: exactly 1 correct, 4 options total
- MULTIPLE_CHOICE: 2+ correct, 4-5 options total
- TRUE_FALSE: exactly 2 options (True/False)
- Mix: command-based, scenario-based, subnetting, troubleshoot questions
- Match actual CCNA 200-301 exam style
- Explanations must be educational and reference Cisco docs` }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const questions = parseJSON(text) as any[];

    const quiz = await prisma.quiz.create({
      data: {
        lessonId, title: `Quiz: ${topic}`, passingScore: 70, isAiGenerated: true,
        questions: {
          create: questions.map((q: any, i: number) => ({
            text: q.text, type: q.type, explanation: q.explanation,
            points: q.points ?? 1, orderIndex: i,
            options: { create: q.options.map((o: any, j: number) => ({ text: o.text, isCorrect: o.isCorrect, orderIndex: j })) },
          })),
        },
      },
      include: { questions: { include: { options: true } } },
    });

    res.json({ quiz });
  } catch (e) { next(e); }
});

// POST /api/v1/ai/generate-lab
router.post('/generate-lab', authenticate, requireRole('ADMIN','INSTRUCTOR'), async (req, res, next) => {
  try {
    const { lessonId, topic, tool } = z.object({
      lessonId: z.string(), topic: z.string().min(3),
      tool: z.enum(['Packet Tracer','GNS3','CLI only']).default('Packet Tracer'),
    }).parse(req.body);

    const msg = await ai.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 3000, system: SYSTEM,
      messages: [{ role: 'user', content: `Generate a hands-on CCNA lab.
Topic: "${topic}" | Tool: ${tool}

Return JSON:
{
  "title": "string",
  "description": "string",
  "objectives": ["obj1","obj2"],
  "duration_min": number,
  "topology": {
    "devices": [{"name":"R1","type":"router","ios":"Cisco IOS 15.x"}],
    "links": [{"from":"R1","fromInterface":"G0/0","to":"SW1","toInterface":"F0/1"}]
  },
  "instructions": [{
    "step": 1, "title": "Step title", "description": "What to do",
    "commands": ["R1(config)# command here"],
    "verification": "Expected output / show command to verify",
    "screenshot_hint": "What to capture"
  }],
  "troubleshooting_tips": ["tip1","tip2"],
  "exam_relevance": "How this maps to CCNA exam"
}` }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const data = parseJSON(text);

    const lab = await prisma.lab.create({
      data: {
        lessonId, title: data.title, description: data.description,
        objectives: data.objectives ?? [], topology: data.topology,
        instructions: data.instructions, durationMin: data.duration_min ?? 60,
        toolRequired: tool, isAiGenerated: true,
      },
    });
    res.json({ lab });
  } catch (e) { next(e); }
});

// POST /api/v1/ai/explain — quick concept explanation
router.post('/explain', authenticate, async (req, res, next) => {
  try {
    const { concept, context } = z.object({
      concept: z.string().min(2).max(200),
      context: z.string().optional(),
    }).parse(req.body);

    const msg = await ai.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 800, system: SYSTEM,
      messages: [{ role: 'user', content: `Explain "${concept}" for CCNA students.${context ? ` Context: ${context}` : ''}
Be concise (max 150 words). Include: what it is, why it matters, one example, exam tip.
Respond as plain text, not JSON.` }],
    });

    const explanation = msg.content[0].type === 'text' ? msg.content[0].text : '';
    res.json({ explanation });
  } catch (e) { next(e); }
});

// POST /api/v1/ai/generate-extended — mở rộng kiến thức
router.post('/generate-extended', authenticate, requireRole('ADMIN','INSTRUCTOR'), async (req, res, next) => {
  try {
    const { lessonId, topic } = z.object({ lessonId: z.string(), topic: z.string() }).parse(req.body);

    const msg = await ai.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 2000, system: SYSTEM,
      messages: [{ role: 'user', content: `Generate "Extended Knowledge" section for CCNA topic: "${topic}".
This is supplementary content beyond core CCNA scope — for deeper understanding.

Return JSON:
{
  "title": "string",
  "content": [
    {"type":"heading","data":{"text":"string","level":2}},
    {"type":"paragraph","data":{"text":"string"}},
    {"type":"code","data":{"language":"cisco-ios","label":"string","code":"string"}},
    {"type":"tip","data":{"text":"string"}}
  ],
  "realworld_scenario": "Practical scenario in hospital/enterprise network",
  "further_reading": ["resource1","resource2"],
  "next_topics": ["related topic 1","related topic 2"]
}` }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const extended = parseJSON(text);

    // Append extended content to existing lesson
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new AppError('Lesson not found', 404);

    const existingContent = lesson.content as any[];
    const updatedContent = [
      ...existingContent,
      { type: 'heading', data: { text: 'Mở rộng kiến thức', level: 2 } },
      ...extended.content,
      { type: 'tip', data: { text: `Thực tế: ${extended.realworld_scenario}` } },
    ];

    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: { content: updatedContent },
    });

    res.json({ lesson: updated, extended });
  } catch (e) { next(e); }
});

export default router;
