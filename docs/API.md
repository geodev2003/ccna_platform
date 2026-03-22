# API Reference — CCNA Learning Platform

Base URL: `https://your-domain.com/api/v1`

All endpoints require `Authorization: Bearer <accessToken>` except auth endpoints.

---

## Authentication

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | `{name, email, password}` | Tạo tài khoản mới |
| POST | `/auth/login` | `{email, password}` | Đăng nhập, nhận tokens |
| POST | `/auth/refresh` | `{refreshToken}` | Làm mới access token |
| POST | `/auth/logout` | `{refreshToken}` | Đăng xuất |
| GET  | `/auth/me` | — | Thông tin user hiện tại |

**Response mẫu (login):**
```json
{
  "user": { "id": "...", "name": "Nguyen Van A", "email": "...", "role": "STUDENT" },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

## Modules

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/modules` | All | Danh sách modules + tiến độ |
| GET | `/modules/:slug` | All | Chi tiết module + lessons |
| POST | `/modules` | Admin/Instructor | Tạo module mới |
| PATCH | `/modules/:id` | Admin/Instructor | Cập nhật module |
| DELETE | `/modules/:id` | Admin | Xóa module |
| POST | `/modules/:id/enroll` | Student | Đăng ký học module |

---

## Lessons

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/lessons/:id` | All | Chi tiết bài học + quiz + lab |
| POST | `/lessons` | Admin/Instructor | Tạo bài học mới |
| PATCH | `/lessons/:id` | Admin/Instructor | Cập nhật bài học |
| DELETE | `/lessons/:id` | Admin | Xóa bài học |
| POST | `/lessons/:id/complete` | Student | Đánh dấu hoàn thành |
| PATCH | `/lessons/:id/time` | Student | Cập nhật thời gian học |

**Content block types:**
```json
[
  {"type": "heading", "data": {"text": "Title", "level": 1}},
  {"type": "paragraph", "data": {"text": "..."}},
  {"type": "code", "data": {"language": "cisco-ios", "label": "Example", "code": "..."}},
  {"type": "tip", "data": {"text": "Exam tip..."}},
  {"type": "warning", "data": {"text": "Common mistake..."}},
  {"type": "keypoints", "data": {"points": ["point 1", "point 2"]}},
  {"type": "table", "data": {"headers": ["Col1"], "rows": [["val1"]]}}
]
```

---

## Quizzes

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/quizzes/:id` | All | Quiz + câu hỏi (ẩn đáp án) |
| POST | `/quizzes/:id/attempt` | Student | Nộp bài quiz |
| GET | `/quizzes/:id/attempts` | Student | Lịch sử làm quiz |
| POST | `/quizzes` | Admin/Instructor | Tạo quiz thủ công |
| DELETE | `/quizzes/:id` | Admin | Xóa quiz |

**Submit attempt:**
```json
{
  "answers": [
    {"questionId": "clx...", "selectedOptionIds": ["opt1_id"]}
  ],
  "timeTaken": 480
}
```

---

## Labs

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/labs/:id` | All | Chi tiết lab + instructions |
| POST | `/labs/:id/start` | Student | Bắt đầu lab attempt |
| PATCH | `/labs/:id/attempts/:attemptId` | Student | Cập nhật trạng thái lab |
| POST | `/labs` | Admin/Instructor | Tạo lab |
| PATCH | `/labs/:id` | Admin/Instructor | Sửa lab |
| DELETE | `/labs/:id` | Admin | Xóa lab |

---

## AI Generation (Admin/Instructor only)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/ai/generate-lesson` | `{topic, phase, type, difficulty}` | Tạo bài học tự động |
| POST | `/ai/generate-quiz` | `{lessonId, topic, questionCount, difficulty}` | Tạo quiz tự động |
| POST | `/ai/generate-lab` | `{lessonId, topic, tool}` | Tạo lab tự động |
| POST | `/ai/explain` | `{concept, context?}` | Giải thích khái niệm |
| POST | `/ai/generate-extended` | `{lessonId, topic}` | Thêm kiến thức mở rộng |

---

## Analytics

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/analytics/me` | Student | Dashboard cá nhân + điểm yếu |
| GET | `/analytics/admin/overview` | Admin | Tổng quan toàn hệ thống |
| GET | `/analytics/admin/users` | Admin | Danh sách user + stats |

---

## Admin

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/admin/stats` | Admin | Số liệu tổng hợp |
| PATCH | `/admin/users/:id` | Admin | Thay đổi role / kích hoạt user |
| DELETE | `/admin/users/:id` | Admin | Vô hiệu hóa user |
| GET | `/admin/activity` | Admin | Activity log |

---

## Error Responses

```json
{ "error": "Message mô tả lỗi" }

// Validation errors (422):
{
  "error": "Validation failed",
  "details": [{"field": "email", "message": "Invalid email"}]
}
```

| HTTP Code | Ý nghĩa |
|-----------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (token sai/hết hạn) |
| 403 | Forbidden (không đủ quyền) |
| 404 | Not Found |
| 409 | Conflict (đã tồn tại) |
| 422 | Validation Failed |
| 429 | Rate Limited |
| 500 | Internal Server Error |
