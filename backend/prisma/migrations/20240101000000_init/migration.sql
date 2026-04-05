-- Idempotent init migration (safe to run on existing databases)

-- CreateEnums (only if they don't already exist)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "Role" AS ENUM ('STUDENT', 'INSTRUCTOR', 'ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LessonType') THEN
        CREATE TYPE "LessonType" AS ENUM ('THEORY', 'LAB', 'QUIZ_ONLY', 'MIXED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'QuestionType') THEN
        CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LabStatus') THEN
        CREATE TYPE "LabStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'SKIPPED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProgressStatus') THEN
        CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
    END IF;
END $$;

-- CreateTable users
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- CreateTable refresh_tokens
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_token_key" ON "refresh_tokens"("token");
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'refresh_tokens_userId_fkey') THEN
        ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable modules
CREATE TABLE IF NOT EXISTS "modules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "phase" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "modules_slug_key" ON "modules"("slug");

-- CreateTable lessons
CREATE TABLE IF NOT EXISTS "lessons" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "LessonType" NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 30,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "lessons_moduleId_slug_key" ON "lessons"("moduleId", "slug");
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lessons_moduleId_fkey') THEN
        ALTER TABLE "lessons" ADD CONSTRAINT "lessons_moduleId_fkey"
            FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable tags
CREATE TABLE IF NOT EXISTS "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "tags_name_key" ON "tags"("name");

-- CreateTable lesson_tags
CREATE TABLE IF NOT EXISTS "lesson_tags" (
    "lessonId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "lesson_tags_pkey" PRIMARY KEY ("lessonId", "tagId")
);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lesson_tags_lessonId_fkey') THEN
        ALTER TABLE "lesson_tags" ADD CONSTRAINT "lesson_tags_lessonId_fkey"
            FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lesson_tags_tagId_fkey') THEN
        ALTER TABLE "lesson_tags" ADD CONSTRAINT "lesson_tags_tagId_fkey"
            FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable quizzes
CREATE TABLE IF NOT EXISTS "quizzes" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "timeLimit" INTEGER,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quizzes_lessonId_fkey') THEN
        ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_lessonId_fkey"
            FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable questions
CREATE TABLE IF NOT EXISTS "questions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "explanation" TEXT,
    "type" "QuestionType" NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'questions_quizId_fkey') THEN
        ALTER TABLE "questions" ADD CONSTRAINT "questions_quizId_fkey"
            FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable question_options
CREATE TABLE IF NOT EXISTS "question_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL,
    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'question_options_questionId_fkey') THEN
        ALTER TABLE "question_options" ADD CONSTRAINT "question_options_questionId_fkey"
            FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable quiz_attempts
CREATE TABLE IF NOT EXISTS "quiz_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "timeTaken" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quiz_attempts_userId_fkey') THEN
        ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quiz_attempts_quizId_fkey') THEN
        ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_fkey"
            FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable attempt_answers
CREATE TABLE IF NOT EXISTS "attempt_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedIds" TEXT[],
    "isCorrect" BOOLEAN NOT NULL,
    CONSTRAINT "attempt_answers_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attempt_answers_attemptId_fkey') THEN
        ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attemptId_fkey"
            FOREIGN KEY ("attemptId") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attempt_answers_questionId_fkey') THEN
        ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_questionId_fkey"
            FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable labs
CREATE TABLE IF NOT EXISTS "labs" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "topology" JSONB,
    "instructions" JSONB NOT NULL,
    "objectives" TEXT[],
    "toolRequired" TEXT NOT NULL DEFAULT 'Packet Tracer',
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "labs_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'labs_lessonId_fkey') THEN
        ALTER TABLE "labs" ADD CONSTRAINT "labs_lessonId_fkey"
            FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable lab_attempts
CREATE TABLE IF NOT EXISTS "lab_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "labId" TEXT NOT NULL,
    "status" "LabStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "notes" TEXT,
    "timeTaken" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "lab_attempts_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lab_attempts_userId_fkey') THEN
        ALTER TABLE "lab_attempts" ADD CONSTRAINT "lab_attempts_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lab_attempts_labId_fkey') THEN
        ALTER TABLE "lab_attempts" ADD CONSTRAINT "lab_attempts_labId_fkey"
            FOREIGN KEY ("labId") REFERENCES "labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable enrollments
CREATE TABLE IF NOT EXISTS "enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "enrollments_userId_moduleId_key" ON "enrollments"("userId", "moduleId");
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'enrollments_userId_fkey') THEN
        ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'enrollments_moduleId_fkey') THEN
        ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_moduleId_fkey"
            FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable lesson_progress
CREATE TABLE IF NOT EXISTS "lesson_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "timeSpentSec" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "lastAccessAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "lesson_progress_userId_lessonId_key" ON "lesson_progress"("userId", "lessonId");
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lesson_progress_userId_fkey') THEN
        ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lesson_progress_lessonId_fkey') THEN
        ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lessonId_fkey"
            FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable activity_logs
CREATE TABLE IF NOT EXISTS "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityId" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "activity_logs_userId_createdAt_idx" ON "activity_logs"("userId", "createdAt");
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'activity_logs_userId_fkey') THEN
        ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
