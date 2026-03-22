# CCNA Learning Platform

Nền tảng học CCNA 200-301 với AI-generated content, progress tracking, quiz engine, và lab management.

## Tính năng

- **AI Content Generation** — Claude API tự động tạo bài học, quiz, lab theo chuẩn CCNA 200-301
- **Quiz Engine** — Hỗ trợ single/multiple choice, timer, chấm điểm tự động, review chi tiết
- **Lab Management** — Hướng dẫn lab từng bước, track tiến độ, notes
- **Progress Analytics** — Dashboard cá nhân, learning streak, phân tích điểm yếu
- **Admin Panel** — CRUD bài học, quản lý user, publish/unpublish, generate AI content
- **CI/CD** — GitHub Actions tự động test + build + deploy

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, React Query, Recharts |
| Backend | Node.js, Express, TypeScript, Zod |
| Database | PostgreSQL 16, Prisma ORM |
| Auth | JWT (access + refresh token rotation) |
| AI | Anthropic Claude API |
| Proxy | Nginx (SSL, rate limiting, reverse proxy) |
| Deploy | Docker Compose, Windows Server |
| CI/CD | GitHub Actions |

## Cấu trúc project

```
ccna-platform/
├── backend/
│   ├── src/
│   │   ├── routes/       # auth, modules, lessons, quizzes, labs, analytics, ai, admin
│   │   ├── middleware/   # auth (JWT), errorHandler
│   │   └── utils/        # prisma client, logger, AppError
│   └── prisma/
│       ├── schema.prisma # Database schema
│       └── seed.ts       # Dữ liệu mẫu
├── frontend/
│   └── src/
│       ├── app/          # Next.js App Router pages
│       ├── components/   # Navbar, Sidebar, QuizModal, etc.
│       └── lib/          # API client, Zustand store
├── nginx/
│   └── nginx.conf        # Reverse proxy + SSL
├── docs/
│   ├── DEPLOY.md         # Hướng dẫn deploy Windows chi tiết
│   └── API.md            # API reference đầy đủ
├── docker-compose.yml
└── .env.example
```

## Quick Start (Development)

```bash
# 1. Clone
git clone https://github.com/yourname/ccna-platform
cd ccna-platform

# 2. Cài dependencies
cd backend && npm install && cd ../frontend && npm install && cd ..

# 3. Setup .env
cp .env.example .env
# Sửa .env với thông tin của bạn

# 4. Chạy database
docker compose up -d postgres

# 5. Migrate + seed
cd backend
npx prisma migrate dev
npx tsx prisma/seed.ts

# 6. Start development
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

Mở http://localhost:3000

## Deploy Production

Xem hướng dẫn chi tiết tại **[docs/DEPLOY.md](docs/DEPLOY.md)**

## API

Xem tài liệu API đầy đủ tại **[docs/API.md](docs/API.md)**

## Tài khoản mặc định (sau seed)

| Role | Email | Password |
|------|-------|---------|
| Admin | admin@ccna.local | Admin@123456 |
| Student (demo) | demo@ccna.local | Demo@123 |
