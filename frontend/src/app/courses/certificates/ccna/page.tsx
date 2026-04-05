'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { BookOpen, CheckCircle, Lock, ChevronRight, GraduationCap, Filter, Network, ArrowLeft } from 'lucide-react';

const PHASE_COLORS: Record<number, { badge: string; border: string; dot: string; label: string }> = {
  1: { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',     border: 'border-t-blue-500',   dot: 'bg-blue-500',   label: 'Nền tảng mạng' },
  2: { badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', border: 'border-t-purple-500', dot: 'bg-purple-500', label: 'VLAN & Routing' },
  3: { badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',         border: 'border-t-red-500',    dot: 'bg-red-500',    label: 'Security & WAN' },
  4: { badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', border: 'border-t-green-500',  dot: 'bg-green-500',  label: 'Ôn thi CCNA' },
};

function CourseCard({ m }: { m: any }) {
  const pct = m.lessonCount > 0 ? Math.round((m.completedCount / m.lessonCount) * 100) : 0;
  const colors = PHASE_COLORS[m.phase] ?? PHASE_COLORS[1];
  return (
    <Link href={`/learn/${m.slug}`}
      className={`card border-t-4 ${colors.border} p-5 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 block group`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          <span className={`badge ${colors.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} mr-1`} />
            Phase {m.phase}
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
      <h3 className="font-bold text-base leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition mb-2">
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
          <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition">
        <span>Vào học ngay</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
}

export default function CCNACoursesPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const [activePhase, setActivePhase] = useState<number | null>(null);

  useEffect(() => { if (!user) router.push('/login'); }, [user, router]);

  const { data: modules = [], isLoading } = useQuery<any[]>({
    queryKey: ['modules', 'CCNA'],
    queryFn: () => api.get('/modules?courseType=CCNA').then(r => r.data),
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
            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)' }}>
            <div className="max-w-5xl mx-auto">
              <Link href="/courses" className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Tất cả khóa học
              </Link>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Network className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest">Chứng chỉ mạng</p>
                  <h1 className="text-2xl font-bold">CCNA 200-301</h1>
                </div>
              </div>
              <p className="text-blue-100 text-sm mb-6 max-w-xl">
                Chương trình CCNA 200-301 toàn diện: từ nền tảng mạng, VLAN & Routing đến Security & WAN.
                Học theo 4 giai đoạn bài bản với AI hỗ trợ.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-xs">
                <div className="bg-white/15 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold">{modules.length}</div>
                  <div className="text-xs text-blue-100">Module</div>
                </div>
                <div className="bg-white/15 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold">{enrolled}</div>
                  <div className="text-xs text-blue-100">Đã đăng ký</div>
                </div>
                <div className="bg-white/15 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold">{completed}</div>
                  <div className="text-xs text-blue-100">Hoàn thành</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="max-w-5xl mx-auto">
              {/* Phase filter */}
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <span className="text-sm text-gray-500 flex items-center gap-1.5 mr-1">
                  <Filter className="w-3.5 h-3.5" /> Giai đoạn:
                </span>
                <button onClick={() => setActivePhase(null)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    activePhase === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}>
                  Tất cả ({modules.length})
                </button>
                {[1, 2, 3, 4].map(p => {
                  const c = PHASE_COLORS[p];
                  const count = modules.filter(m => m.phase === p).length;
                  return (
                    <button key={p}
                      onClick={() => setActivePhase(p === activePhase ? null : p)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                        activePhase === p
                          ? `${c.badge} ring-2 ring-current`
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}>
                      Phase {p} · {c.label} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Course grid */}
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="card h-52 animate-pulse bg-gray-200 dark:bg-gray-700" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Chưa có module nào</p>
                </div>
              ) : (
                activePhase === null ? (
                  [1, 2, 3, 4].map(phase => {
                    const phaseModules = modules.filter(m => m.phase === phase);
                    if (!phaseModules.length) return null;
                    const colors = PHASE_COLORS[phase];
                    return (
                      <div key={phase} className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                          <h2 className="font-semibold text-gray-700 dark:text-gray-300">
                            Phase {phase}: {colors.label}
                          </h2>
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
