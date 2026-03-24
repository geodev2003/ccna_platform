'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { CheckCircle, ChevronLeft, Clock, FlaskConical, HelpCircle, Lightbulb, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import QuizModal from '@/components/quiz/QuizModal';
import toast from 'react-hot-toast';

// ── Content Block Renderer ─────────────────────────────────────────────────────
function ContentBlock({ block }: { block: any }) {
  const { type, data } = block;
  switch (type) {
    case 'heading':
      const Tag = `h${data.level}` as any;
      const sizes: Record<number, string> = { 1: 'text-2xl', 2: 'text-xl', 3: 'text-lg' };
      return <Tag className={`font-bold ${sizes[data.level] ?? 'text-base'} mt-6 mb-3 text-gray-900 dark:text-gray-100`}>{data.text}</Tag>;

    case 'paragraph':
      return <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{data.text}</p>;

    case 'code':
      return (
        <div className="mb-4">
          {data.label && <div className="text-xs font-medium text-gray-500 mb-1 px-1">{data.label}</div>}
          <pre className="bg-gray-900 dark:bg-black text-green-400 text-sm rounded-xl p-4 overflow-x-auto leading-relaxed">
            <code>{data.code}</code>
          </pre>
        </div>
      );

    case 'tip':
      return (
        <div className="flex gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
          <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-200">{data.text}</p>
        </div>
      );

    case 'warning':
      return (
        <div className="flex gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200">{data.text}</p>
        </div>
      );

    case 'keypoints':
      return (
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Điểm chính</div>
          <ul className="space-y-2">
            {(data.points ?? []).map((p: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-blue-500 shrink-0 mt-0.5">•</span>{p}
              </li>
            ))}
          </ul>
        </div>
      );

    case 'table':
      return (
        <div className="overflow-x-auto mb-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>{(data.headers ?? []).map((h: string, i: number) => (
                <th key={i} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {(data.rows ?? []).map((row: string[], ri: number) => (
                <tr key={ri} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-gray-700 dark:text-gray-300">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}

// ── Lab Steps ─────────────────────────────────────────────────────────────────
function LabSection({ lab }: { lab: any }) {
  const [open, setOpen] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const startLab = useMutation({
    mutationFn: () => api.post(`/labs/${lab.id}/start`),
    onSuccess: (res) => { setAttemptId(res.data.id); setOpen(true); toast.success('Lab đã bắt đầu!'); },
  });
  const completeLab = useMutation({
    mutationFn: () => api.patch(`/labs/${lab.id}/attempts/${attemptId}`, { status: 'COMPLETED' }),
    onSuccess: () => toast.success('Lab hoàn thành! 🎉'),
  });

  return (
    <div className="border border-green-200 dark:border-green-800 rounded-xl overflow-hidden mb-6">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 text-left">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-5 h-5 text-green-600" />
          <div>
            <div className="font-semibold text-green-800 dark:text-green-200">{lab.title}</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              {lab.toolRequired} · {lab.durationMin} phút
            </div>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-green-600" /> : <ChevronDown className="w-4 h-4 text-green-600" />}
      </button>

      {open && (
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{lab.description}</p>

          <div>
            <div className="text-sm font-semibold mb-2">Mục tiêu</div>
            <ul className="space-y-1">
              {(lab.objectives ?? []).map((o: string, i: number) => (
                <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
                  <span className="text-green-500">✓</span>{o}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2">Các bước thực hiện</div>
            <div className="space-y-3">
              {(lab.instructions ?? []).map((step: any) => (
                <div key={step.step} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs flex items-center justify-center font-bold">{step.step}</span>
                    <span className="font-medium text-sm">{step.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{step.description}</p>
                  {step.commands?.length > 0 && (
                    <pre className="bg-gray-900 text-green-400 text-xs rounded-lg p-3 overflow-x-auto">
                      {step.commands.join('\n')}
                    </pre>
                  )}
                  {step.verification && (
                    <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Kiểm tra: {step.verification}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {!attemptId ? (
              <button onClick={() => startLab.mutate()} className="btn-primary" disabled={startLab.isPending}>
                {startLab.isPending ? 'Đang khởi động...' : 'Bắt đầu Lab'}
              </button>
            ) : (
              <button onClick={() => completeLab.mutate()} className="btn bg-green-600 text-white hover:bg-green-700" disabled={completeLab.isPending}>
                {completeLab.isPending ? 'Đang lưu...' : '✓ Hoàn thành Lab'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Lesson Page ──────────────────────────────────────────────────────────
export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const [quizOpen, setQuizOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const startTime = useRef(Date.now());
  const timeInterval = useRef<any>(null);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', id],
    queryFn: () => api.get(`/lessons/${id}`).then(r => r.data),
    enabled: !!user,
  });

  // Ping time every 60s
  useEffect(() => {
    timeInterval.current = setInterval(() => {
      api.patch(`/lessons/${id}/time`, { seconds: 60 }).catch(() => {});
    }, 60_000);
    return () => clearInterval(timeInterval.current);
  }, [id]);

  const complete = useMutation({
    mutationFn: () => {
      const secs = Math.round((Date.now() - startTime.current) / 1000);
      return api.post(`/lessons/${id}/complete`, { timeSpentSec: secs });
    },
    onSuccess: () => toast.success('Bài học hoàn thành! 🎉'),
  });

  if (isLoading) return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar /><div className="flex-1 flex flex-col"><Navbar />
        <div className="flex-1 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" /></div>
      </div>
    </div>
  );

  const content = (lesson?.content ?? []) as any[];
  const isCompleted = lesson?.progress?.[0]?.status === 'COMPLETED';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {/* Breadcrumb */}
            <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
              <ChevronLeft className="w-4 h-4" /> Quay lại module
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="badge badge-blue">{lesson?.module?.title}</span>
                <span className="badge badge-amber">{lesson?.type}</span>
                {lesson?.isFree && <span className="badge badge-green">Miễn phí</span>}
                {isCompleted && <span className="badge badge-green flex items-center gap-1"><CheckCircle className="w-3 h-3" />Đã hoàn thành</span>}
              </div>
              <h1 className="text-3xl font-bold mb-2">{lesson?.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{lesson?.durationMin} phút</span>
                {lesson?.quizzes?.length > 0 && <span className="flex items-center gap-1"><HelpCircle className="w-4 h-4" />{lesson.quizzes.length} quiz</span>}
                {lesson?.labs?.length > 0 && <span className="flex items-center gap-1"><FlaskConical className="w-4 h-4" />{lesson.labs.length} lab</span>}
              </div>
            </div>

            {/* Content */}
            <div className="prose-content">
              {content.map((block, i) => <ContentBlock key={i} block={block} />)}
            </div>

            {/* Labs */}
            {lesson?.labs?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FlaskConical className="w-5 h-5 text-green-500" />Lab thực hành</h2>
                {lesson.labs.map((lab: any) => <LabSection key={lab.id} lab={lab} />)}
              </div>
            )}

            {/* Quizzes */}
            {lesson?.quizzes?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-purple-500" />Bài kiểm tra</h2>
                <div className="space-y-3">
                  {lesson.quizzes.map((quiz: any) => {
                    const lastAttempt = quiz.attempts?.[0];
                    return (
                      <div key={quiz.id} className="card p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{quiz.title}</div>
                          <div className="text-sm text-gray-500 mt-0.5">
                            {quiz._count.questions} câu · Đạt: {quiz.passingScore}%
                            {quiz.timeLimit && ` · ${quiz.timeLimit} phút`}
                          </div>
                          {lastAttempt && (
                            <div className={`text-xs mt-1 font-medium ${lastAttempt.passed ? 'text-green-500' : 'text-red-500'}`}>
                              Lần cuối: {lastAttempt.score}% — {lastAttempt.passed ? '✓ Đạt' : '✗ Chưa đạt'}
                            </div>
                          )}
                        </div>
                        <button onClick={() => { setSelectedQuiz(quiz); setQuizOpen(true); }}
                          className="btn-primary shrink-0">
                          {lastAttempt ? 'Làm lại' : 'Bắt đầu'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Complete Button */}
            <div className="mt-10 pt-6 border-t flex justify-end">
              <button
                onClick={() => complete.mutate()}
                disabled={complete.isPending || isCompleted}
                className={isCompleted ? 'btn bg-green-100 text-green-700 cursor-default' : 'btn-primary px-8'}>
                {isCompleted ? '✓ Đã hoàn thành' : complete.isPending ? 'Đang lưu...' : 'Đánh dấu hoàn thành'}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Quiz Modal */}
      {quizOpen && selectedQuiz && (
        <QuizModal quizId={selectedQuiz.id} onClose={() => setQuizOpen(false)} />
      )}
    </div>
  );
}
