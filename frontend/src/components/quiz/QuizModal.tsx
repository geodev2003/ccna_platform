'use client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, XCircle, Clock, Trophy } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

interface Props { quizId: string; onClose: () => void; }

export default function QuizModal({ quizId, onClose }: Props) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const startTime = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => api.get(`/quizzes/${quizId}`).then(r => r.data),
  });

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const submitMut = useMutation({
    mutationFn: () => {
      const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
      const formatted = Object.entries(answers).map(([questionId, selectedOptionIds]) => ({ questionId, selectedOptionIds }));
      return api.post(`/quizzes/${quizId}/attempt`, { answers: formatted, timeTaken });
    },
    onSuccess: (res) => { setResult(res.data); setSubmitted(true); },
    onError: () => toast.error('Lỗi khi nộp bài'),
  });

  const toggleOption = (qId: string, optId: string, type: string) => {
    if (submitted) return;
    setAnswers(prev => {
      const cur = prev[qId] ?? [];
      if (type === 'SINGLE_CHOICE' || type === 'TRUE_FALSE') {
        return { ...prev, [qId]: [optId] };
      }
      // MULTIPLE_CHOICE: toggle
      return { ...prev, [qId]: cur.includes(optId) ? cur.filter(x => x !== optId) : [...cur, optId] };
    });
  };

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  if (isLoading) return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  const questions = quiz?.questions ?? [];
  const q = questions[currentQ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && !submitted && onClose()}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">{quiz?.title}</h2>
            <div className="text-sm text-gray-500 mt-0.5">
              {questions.length} câu · Đạt: {quiz?.passingScore}%
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4" />{formatTime(elapsed)}
            </div>
            {!submitted && <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X className="w-5 h-5" /></button>}
          </div>
        </div>

        {/* Result Screen */}
        {submitted && result ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="text-center mb-6">
              <div className={`text-6xl font-bold mb-2 ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
                {result.score}%
              </div>
              <div className={`text-lg font-semibold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                {result.passed ? '🎉 Đạt yêu cầu!' : '❌ Chưa đạt — Ôn lại nhé!'}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Điểm đạt: {result.passingScore}% · Thời gian: {formatTime(result.timeTaken)}
              </div>
            </div>

            {/* Answer Review */}
            <div className="space-y-4">
              <div className="font-semibold text-sm text-gray-600 dark:text-gray-400">Chi tiết từng câu</div>
              {result.breakdown?.map((b: any, i: number) => (
                <div key={b.questionId} className={clsx('border rounded-xl p-4', b.isCorrect ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20')}>
                  <div className="flex items-start gap-2 mb-2">
                    {b.isCorrect ? <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />}
                    <div className="text-sm font-medium">Câu {i+1}: {b.questionText}</div>
                  </div>
                  {b.explanation && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 ml-6 mt-1 p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                      💡 {b.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="btn-primary flex-1 justify-center">Đóng</button>
            </div>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="px-5 pt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Câu {currentQ + 1} / {questions.length}</span>
                <span>{Object.keys(answers).length} đã trả lời</span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${((currentQ+1)/questions.length)*100}%` }} />
              </div>
            </div>

            {/* Question */}
            {q && (
              <div className="flex-1 overflow-y-auto p-5">
                <div className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  {q.type === 'MULTIPLE_CHOICE' ? 'Chọn tất cả đáp án đúng' : 'Chọn một đáp án'}
                </div>
                <h3 className="text-base font-semibold mb-5 leading-relaxed">{q.text}</h3>
                <div className="space-y-2.5">
                  {q.options?.map((opt: any) => {
                    const selected = (answers[q.id] ?? []).includes(opt.id);
                    return (
                      <button key={opt.id} onClick={() => toggleOption(q.id, opt.id, q.type)}
                        className={clsx(
                          'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all',
                          selected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                        )}>
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer nav */}
            <div className="p-5 border-t flex items-center justify-between">
              <button onClick={() => setCurrentQ(q => Math.max(0, q-1))} disabled={currentQ === 0}
                className="btn-secondary disabled:opacity-40">← Trước</button>

              <div className="flex gap-1.5">
                {questions.map((_: any, i: number) => (
                  <button key={i} onClick={() => setCurrentQ(i)}
                    className={clsx('w-7 h-7 rounded-full text-xs font-medium transition',
                      i === currentQ ? 'bg-blue-600 text-white' :
                      answers[questions[i].id] ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-500'
                    )}>
                    {i+1}
                  </button>
                ))}
              </div>

              {currentQ < questions.length - 1 ? (
                <button onClick={() => setCurrentQ(q => q+1)} className="btn-primary">Tiếp →</button>
              ) : (
                <button onClick={() => submitMut.mutate()} disabled={submitMut.isPending}
                  className="btn bg-green-600 text-white hover:bg-green-700">
                  {submitMut.isPending ? 'Đang nộp...' : '✓ Nộp bài'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
