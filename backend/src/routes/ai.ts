import { Router } from "express";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authenticate, requireRole } from "../middleware/auth";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/AppError";

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM = `You are an expert CCNA instructor. Generate accurate content for Cisco CCNA 200-301. Always respond with valid JSON only.`;

function parseJSON(text: string) {
  const clean = text.replace(/```json|```/g, "").trim();
  const m = clean.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!m) throw new AppError("AI returned invalid JSON", 500);
  return JSON.parse(m[0]);
}

router.post("/generate-lesson", authenticate, requireRole("ADMIN","INSTRUCTOR"), async (req, res, next) => {
  try {
    const { topic, phase, type, difficulty } = z.object({
      topic: z.string().min(3), phase: z.number().int().min(1).max(4),
      type: z.enum(["THEORY","LAB","MIXED"]), difficulty: z.enum(["beginner","intermediate","advanced"]).default("intermediate"),
    }).parse(req.body);

    const prompt = `${SYSTEM}\n\nGenerate a complete CCNA lesson.\nTopic: "${topic}"\nPhase: ${phase} | Type: ${type} | Difficulty: ${difficulty}\n\nReturn this exact JSON:\n{\n  "title": "string",\n  "summary": "2-3 sentence overview",\n  "objectives": ["learning objective"],\n  "duration_min": 45,\n  "tags": ["tag1"],\n  "content": [\n    {"type":"heading","data":{"text":"string","level":1}},\n    {"type":"paragraph","data":{"text":"string"}},\n    {"type":"keypoints","data":{"points":["point1"]}},\n    {"type":"code","data":{"language":"cisco-ios","label":"Example","code":"commands"}},\n    {"type":"table","data":{"headers":["Col1","Col2"],"rows":[["r1c1","r1c2"]]}},\n    {"type":"tip","data":{"text":"exam tip"}},\n    {"type":"warning","data":{"text":"common mistake"}}\n  ]\n}\nInclude 10-15 content blocks with theory, Cisco IOS commands, exam tips.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ lesson: parseJSON(text) });
  } catch (e) { next(e); }
});

router.post("/generate-quiz", authenticate, requireRole("ADMIN","INSTRUCTOR"), async (req, res, next) => {
  try {
    const { lessonId, topic, questionCount, difficulty } = z.object({
      lessonId: z.string(), topic: z.string().min(3),
      questionCount: z.number().int().min(5).max(30).default(10),
      difficulty: z.enum(["easy","medium","hard","mixed"]).default("mixed"),
    }).parse(req.body);

    const prompt = `${SYSTEM}\n\nGenerate ${questionCount} CCNA quiz questions.\nTopic: "${topic}" | Difficulty: ${difficulty}\n\nReturn JSON array:\n[{"text":"question","type":"SINGLE_CHOICE|MULTIPLE_CHOICE|TRUE_FALSE","explanation":"detailed explanation","points":1,"options":[{"text":"option","isCorrect":true}]}]\n\nRules:\n- SINGLE_CHOICE: exactly 1 correct, 4 options\n- MULTIPLE_CHOICE: 2+ correct, 4-5 options\n- TRUE_FALSE: 2 options only\n- Mix command-based, scenario, subnetting questions`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const questions = parseJSON(text) as any[];

    const quiz = await prisma.quiz.create({
      data: {
        lessonId, title: `Quiz: ${topic}`, passingScore: 70, isAiGenerated: true,
        questions: { create: questions.map((q: any, i: number) => ({
          text: q.text, type: q.type, explanation: q.explanation,
          points: q.points ?? 1, orderIndex: i,
          options: { create: q.options.map((o: any, j: number) => ({ text: o.text, isCorrect: o.isCorrect, orderIndex: j })) },
        })) },
      },
      include: { questions: { include: { options: true } } },
    });
    res.json({ quiz });
  } catch (e) { next(e); }
});

router.post("/generate-lab", authenticate, requireRole("ADMIN","INSTRUCTOR"), async (req, res, next) => {
  try {
    const { lessonId, topic, tool } = z.object({
      lessonId: z.string(), topic: z.string().min(3),
      tool: z.enum(["Packet Tracer","GNS3","CLI only"]).default("Packet Tracer"),
    }).parse(req.body);

    const prompt = `${SYSTEM}\n\nGenerate a CCNA lab.\nTopic: "${topic}" | Tool: ${tool}\n\nReturn JSON:\n{"title":"string","description":"string","objectives":["obj1"],"duration_min":60,"topology":{"devices":[{"name":"R1","type":"router","ios":"IOS 15.x"}],"links":[{"from":"R1","fromInterface":"G0/0","to":"SW1","toInterface":"F0/1"}]},"instructions":[{"step":1,"title":"Step","description":"What to do","commands":["R1(config)# command"],"verification":"show command"}],"troubleshooting_tips":["tip1"]}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
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

router.post("/explain", authenticate, async (req, res, next) => {
  try {
    const { concept, context } = z.object({
      concept: z.string().min(2).max(200), context: z.string().optional(),
    }).parse(req.body);

    const prompt = `${SYSTEM}\nExplain "${concept}" for CCNA students.${context ? ` Context: ${context}` : ""}\nBe concise (max 150 words). Include: what it is, why it matters, one example, exam tip. Plain text response.`;

    const result = await model.generateContent(prompt);
    res.json({ explanation: result.response.text() });
  } catch (e) { next(e); }
});

router.post("/generate-extended", authenticate, requireRole("ADMIN","INSTRUCTOR"), async (req, res, next) => {
  try {
    const { lessonId, topic } = z.object({ lessonId: z.string(), topic: z.string() }).parse(req.body);

    const prompt = `${SYSTEM}\n\nGenerate extended knowledge for CCNA topic: "${topic}".\n\nReturn JSON:\n{"title":"string","content":[{"type":"heading","data":{"text":"string","level":2}},{"type":"paragraph","data":{"text":"string"}}],"realworld_scenario":"hospital/enterprise scenario","further_reading":["resource1"],"next_topics":["topic1"]}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const extended = parseJSON(text);

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new AppError("Lesson not found", 404);

    const updatedContent = [
      ...(lesson.content as any[]),
      { type: "heading", data: { text: "Mở rộng kiến thức", level: 2 } },
      ...extended.content,
      { type: "tip", data: { text: `Thực tế: ${extended.realworld_scenario}` } },
    ];

    const updated = await prisma.lesson.update({ where: { id: lessonId }, data: { content: updatedContent } });
    res.json({ lesson: updated, extended });
  } catch (e) { next(e); }
});

export default router;