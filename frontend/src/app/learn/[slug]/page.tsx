'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle, Clock, BookOpen, FlaskConical, HelpCircle, ChevronRight, Play } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import toast from 'react-hot-toast';

const typeIcon: Record<string, any> = {
  THEORY: BookOpen, LAB: FlaskConical, QUIZ_ONLY: HelpCircle, MIXED: Play,
};
const typeLabel: Record<string, string> = {
  THEORY: 'Lý thuyết', LAB: 'Lab', QUIZ_ONLY: 'Quiz', MIXED: 'Hỗn hợp',
};
const statusColor: Record<string, string> = {
  COMPLETED: 'text-green-500', IN_PROGRESS: 'text-blue-500', NOT_STARTED: 'text-gray-300',
};

export default function ModulePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const user = useAuthStore(s => s.user);

  const { data: mod, isLoading } = useQuery({
    queryKey: ['module', slug],
    queryFn: () => api.get(`/modules/${slug}`).then(r => r.data),
    enabled: !!user,
  });

  const enroll = useMutation({
    mutationFn: () => api.post(`/modules/${mod.id}/enroll`),
    onSuccess: () => toast.success('Đã đăng ký module!'),
  });

  if (isLoading) return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar /><div className="flex-1 flex flex-col"><Navbar />
        <div className="flex-1 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" /></div>
      </div>
    </div>
  );

  const lessons = mod?.lessons ?? [];
  const completed = lessons.filter((l: any) => l.progress?.[0]?.status === 'COMPLETED').length;
  const pct = lessons.length > 0 ? Math.round(completed / lessons.length * 100) : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="card p-6 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="badge badge-blue mb-2">Phase {mod?.phase}</span>
                  <h1 className="text-2xl font-bold mt-1">{mod?.title}</h1>
                  <p className="text-gray-500 mt-2">{mod?.description}</p>
                </div>
                <button onClick={() => enroll.mutate()} disabled={enroll.isPending}
                  className="btn-primary shrink-0">
                  {enroll.isPending ? 'Đang đăng ký...' : 'Đăng ký học'}
                </button>
              </div>
              {/* Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>{completed}/{lessons.length} bài hoàn thành</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>

            {/* Lesson List */}
            <div className="space-y-2">
              {lessons.map((lesson: any, idx: number) => {
                const status = lesson.progress?.[0]?.status ?? 'NOT_STARTED';
                const Icon = typeIcon[lesson.type] ?? BookOpen;
                return (
                  <button key={lesson.id} onClick={() => router.push(`/learn/lesson/${lesson.id}`)}
                    className="card p-4 w-full text-left hover:shadow-md transition-shadow flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-medium shrink-0">
                      {idx + 1}
                    </div>
                    <Icon className="w-5 h-5 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{lesson.title}</div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-400">{typeLabel[lesson.type]}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{lesson.durationMin} phút
                        </span>
                        {lesson._count.quizzes > 0 && <span className="text-xs text-gray-400">{lesson._count.quizzes} quiz</span>}
                        {lesson._count.labs > 0 && <span className="text-xs text-gray-400">{lesson._count.labs} lab</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {lesson.isFree && <span className="badge badge-green text-xs">Miễn phí</span>}
                      <CheckCircle className={`w-5 h-5 ${statusColor[status]}`} />
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
