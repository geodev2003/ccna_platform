'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

export default function LearnPage() {
  const user = useAuthStore(s => s.user);
  const router = useRouter();

  const { data: modules, isLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: () => api.get('/modules').then(r => r.data),
    enabled: !!user,
  });

  const phases = [1,2,3,4];
  const phaseNames = ['Nền tảng','VLAN & Routing','Security & Services','Ôn thi'];
  const phaseColors = ['bg-blue-500','bg-purple-500','bg-red-500','bg-green-500'];
  const phaseBg = ['bg-blue-50 dark:bg-blue-900/10 border-blue-200','bg-purple-50 dark:bg-purple-900/10 border-purple-200','bg-red-50 dark:bg-red-900/10 border-red-200','bg-green-50 dark:bg-green-900/10 border-green-200'];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Chương trình học CCNA 200-301</h1>
              <p className="text-gray-500 mt-1">20 tuần · 4 giai đoạn · AI-powered content</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-8">
                {phases.map((phase, pi) => {
                  const phaseMods = (modules ?? []).filter((m: any) => m.phase === phase);
                  if (!phaseMods.length) return null;
                  return (
                    <div key={phase}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-xl ${phaseColors[pi]} flex items-center justify-center text-white font-bold text-sm`}>{phase}</div>
                        <div>
                          <h2 className="font-bold">{phaseNames[pi]}</h2>
                          <p className="text-xs text-gray-500">{phaseMods.length} module</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {phaseMods.map((m: any) => (
                          <button key={m.id} onClick={() => router.push(`/learn/${m.slug}`)}
                            className={`card p-5 text-left hover:shadow-md transition-all border ${phaseBg[pi]}`}>
                            <div className="flex justify-between items-start mb-3">
                              <BookOpen className={`w-5 h-5 ${['text-blue-500','text-purple-500','text-red-500','text-green-500'][pi]}`} />
                              {m.enrolled && <span className="badge badge-green text-xs">Đã đăng ký</span>}
                            </div>
                            <h3 className="font-semibold mb-1">{m.title}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{m.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{m.lessonCount} bài</span>
                              <span>{m.lessonCount > 0 ? Math.round(m.completedCount/m.lessonCount*100) : 0}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className={`h-full ${phaseColors[pi]} rounded-full`} style={{ width: `${m.lessonCount > 0 ? m.completedCount/m.lessonCount*100 : 0}%` }} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
