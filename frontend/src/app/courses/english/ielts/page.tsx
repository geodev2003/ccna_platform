'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { BookOpen, CheckCircle, Lock, ChevronRight, GraduationCap, Filter, Languages, ArrowLeft, Headphones, FileText, PenLine, MessageSquare } from 'lucide-react';

const PHASE_COLORS: Record<number, { badge: string; border: string; dot: string; label: string; icon: any }> = {
  1: { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',     border: 'border-t-blue-500',   dot: 'bg-blue-500',   label: 'Listening',  icon: Headphones },
  2: { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', border: 'border-t-emerald-500', dot: 'bg-emerald-500', label: 'Reading', icon: FileText },
  3: { badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', border: 'border-t-purple-500', dot: 'bg-purple-500', label: 'Writing', icon: PenLine },
  4: { badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', border: 'border-t-orange-500', dot: 'bg-orange-500', label: 'Speaking', icon: MessageSquare },
};

function CourseCard({ m }: { m: any }) {
  const pct = m.lessonCount > 0 ? Math.round((m.completedCount / m.lessonCount) * 100) : 0;
  const colors = PHASE_COLORS[m.phase] ?? PHASE_COLORS[1];
  const PhaseIcon = colors.icon;
  return (
    <Link href={`/learn/${m.slug}`}
      className={`card border-t-4 ${colors.border} p-5 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 block group`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          <span className={`badge ${colors.badge}`}>
            <PhaseIcon className="w-3 h-3 mr-1" />
            {colors.label}
          </span>
          {m.enrolled && (
            <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              <CheckCircle className="w-3 h-3 mr-1" /> Đã đăng ký
            </span>
          )}
          {!m.isPublished && (
            <span className="badge bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              <Lock className="w-3 h-3 mr-1" /> Chưa mở
            </span>
          )}
        </div>
      </div>
      <h3 className="font-bold text-base leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition mb-2">
        {m.title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
        {m.description}
      </p>
      <div className="space-y-2 mt-auto">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{m.lessonCount} bài học</span>
          <span className={`font-semibold ${pct === 100 ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'}`}>{pct}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-emerald-500'}`}
            style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition">
        <span>Vào học ngay</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
}

const IELTS_SKILLS = [
  { phase: 1, icon: Headphones, label: 'Listening', desc: 'Luyện nghe với các dạng bài thi IELTS thực tế', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { phase: 2, icon: FileText,   label: 'Reading',   desc: 'Kỹ thuật đọc hiểu, skimming & scanning',       color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { phase: 3, icon: PenLine,    label: 'Writing',   desc: 'Task 1 (biểu đồ) và Task 2 (luận văn)',         color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { phase: 4, icon: MessageSquare, label: 'Speaking', desc: 'Luyện nói Part 1, 2, 3 với chủ đề thực tế',  color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

export default function IELTSCoursesPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const [activePhase, setActivePhase] = useState<number | null>(null);

  useEffect(() => { if (!user) router.push('/login'); }, [user, router]);

  const { data: modules = [], isLoading } = useQuery<any[]>({
    queryKey: ['modules', 'IELTS'],
    queryFn: () => api.get('/modules?courseType=IELTS').then(r => r.data),
    enabled: !!user,
  });

  if (!user) return null;

  const filtered = activePhase ? modules.filter(m => m.phase === activePhase) : modules;
  const enrolled = modules.filter(m => m.enrolled).length;
  const completed = modules.filter(m => m.lessonCount > 0 && m.completedCount === m.lessonCount).length;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {/* Page header */}
          <div className="px-8 py-10 text-white"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)' }}>
            <div className="max-w-5xl mx-auto">
              <Link href="/courses" className="inline-flex items-center gap-1.5 text-emerald-200 hover:text-white text-sm mb-4 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Tất cả khóa học
              </Link>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Languages className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-emerald-200 text-xs font-semibold uppercase tracking-widest">Tiếng Anh</p>
                  <h1 className="text-2xl font-bold">IELTS Preparation</h1>
                </div>
              </div>
              <p className="text-emerald-100 text-sm mb-6 max-w-xl">
                Luyện thi IELTS toàn diện với 4 kỹ năng: Listening, Reading, Writing, Speaking.
                Bài tập thực chiến, phân tích điểm yếu với AI.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-xs">
                <div className="bg-white/15 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold">{modules.length}</div>
                  <div className="text-xs text-emerald-100">Module</div>
                </div>
                <div className="bg-white/15 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold">{enrolled}</div>
                  <div className="text-xs text-emerald-100">Đã đăng ký</div>
                </div>
                <div className="bg-white/15 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold">{completed}</div>
                  <div className="text-xs text-emerald-100">Hoàn thành</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="max-w-5xl mx-auto">

              {/* Skills overview (shown when no modules yet) */}
              {!isLoading && modules.length === 0 && (
                <div className="mb-10">
                  <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">4 Kỹ năng IELTS</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {IELTS_SKILLS.map(({ phase, icon: Icon, label, desc, color, bg }) => (
                      <div key={phase} className={`card p-5 text-center hover:border-emerald-500/30 transition-all duration-200`}>
                        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mx-auto mb-3`}>
                          <Icon className={`w-6 h-6 ${color}`} />
                        </div>
                        <h3 className="font-bold text-white mb-1">{label}</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="text-center py-10 text-gray-400">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium mb-1">Nội dung đang được chuẩn bị</p>
                    <p className="text-sm">Khóa học IELTS sẽ sớm ra mắt. Hãy theo dõi!</p>
                  </div>
                </div>
              )}

              {modules.length > 0 && (
                <>
                  {/* Phase filter */}
                  <div className="flex items-center gap-2 mb-6 flex-wrap">
                    <span className="text-sm text-gray-500 flex items-center gap-1.5 mr-1">
                      <Filter className="w-3.5 h-3.5" /> Kỹ năng:
                    </span>
                    <button onClick={() => setActivePhase(null)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                        activePhase === null
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}>
                      Tất cả ({modules.length})
                    </button>
                    {IELTS_SKILLS.map(({ phase, label }) => {
                      const count = modules.filter(m => m.phase === phase).length;
                      const colors = PHASE_COLORS[phase];
                      return (
                        <button key={phase}
                          onClick={() => setActivePhase(phase === activePhase ? null : phase)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                            activePhase === phase
                              ? `${colors.badge} ring-2 ring-current`
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}>
                          {label} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Course grid */}
                  {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="card h-52 animate-pulse bg-gray-200 dark:bg-gray-700" />
                      ))}
                    </div>
                  ) : (
                    activePhase === null ? (
                      IELTS_SKILLS.map(({ phase, label }) => {
                        const phaseModules = modules.filter(m => m.phase === phase);
                        if (!phaseModules.length) return null;
                        const colors = PHASE_COLORS[phase];
                        return (
                          <div key={phase} className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                              <h2 className="font-semibold text-gray-700 dark:text-gray-300">{label}</h2>
                              <span className="text-xs text-gray-400">{phaseModules.length} module</span>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                              {phaseModules.map(m => <CourseCard key={m.id} m={m} />)}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map(m => <CourseCard key={m.id} m={m} />)}
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
