'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { BookOpen, Trophy, Clock, Flame, TrendingUp, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}><Icon className="w-5 h-5 text-white" /></div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);

  useEffect(() => { if (!user) router.push('/login'); }, [user, router]);

  const { data: analytics } = useQuery({
    queryKey: ['analytics-me'],
    queryFn: () => api.get('/analytics/me').then(r => r.data),
    enabled: !!user,
  });

  const { data: modules } = useQuery({
    queryKey: ['modules'],
    queryFn: () => api.get('/modules').then(r => r.data),
    enabled: !!user,
  });

  if (!user) return null;
  const s = analytics?.summary;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* Greeting */}
            <div>
              <h1 className="text-2xl font-bold">Xin chào, {user.name}! 👋</h1>
              <p className="text-gray-500 mt-1">Hãy tiếp tục hành trình CCNA của bạn hôm nay.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={BookOpen} label="Bài đã hoàn thành" value={s?.completedLessons ?? '—'} color="bg-blue-500" />
              <StatCard icon={Trophy} label="Điểm quiz TB" value={s ? `${s.avgScore}%` : '—'} color="bg-yellow-500" />
              <StatCard icon={Clock} label="Thời gian học" value={s ? `${s.totalTimeHours}h` : '—'} color="bg-purple-500" />
              <StatCard icon={Flame} label="Streak hiện tại" value={s ? `${s.streak} ngày` : '—'} color="bg-orange-500" />
            </div>

            {/* Weekly Activity Chart */}
            {analytics?.weeklyActivity && (
              <div className="card p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Hoạt động 7 ngày qua</h2>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={analytics.weeklyActivity}>
                    <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString('vi', { weekday: 'short' })} tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString('vi')} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Module Progress */}
              <div className="card p-6">
                <h2 className="font-semibold mb-4">Tiến độ theo module</h2>
                <div className="space-y-3">
                  {(analytics?.moduleProgress ?? []).map((m: any) => (
                    <div key={m.moduleId}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="truncate">{m.title}</span>
                        <span className="text-gray-500 shrink-0 ml-2">{m.completed}/{m.total}</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${m.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weak Areas */}
              <div className="card p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" /> Điểm yếu cần ôn
                </h2>
                {(analytics?.weakAreas ?? []).length === 0 ? (
                  <p className="text-gray-500 text-sm">Chưa có dữ liệu. Hãy làm quiz để xem phân tích!</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.weakAreas.map((w: any) => (
                      <div key={w.topic} className="flex items-center justify-between">
                        <span className="text-sm truncate">{w.topic}</span>
                        <span className={`badge shrink-0 ml-2 ${w.avgScore < 50 ? 'badge-red' : 'badge-amber'}`}>
                          {w.avgScore}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modules List */}
            <div>
              <h2 className="font-semibold mb-4">Chương trình học</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(modules ?? []).map((m: any) => (
                  <a key={m.id} href={`/learn/${m.slug}`}
                    className="card p-5 hover:shadow-md transition-shadow cursor-pointer block">
                    <div className="flex items-start justify-between mb-3">
                      <span className="badge badge-blue">Phase {m.phase}</span>
                      {m.enrolled && <span className="badge badge-green">Đã đăng ký</span>}
                    </div>
                    <h3 className="font-semibold">{m.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{m.description}</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{m.completedCount}/{m.lessonCount} bài</span>
                        <span>{m.lessonCount > 0 ? Math.round(m.completedCount/m.lessonCount*100) : 0}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${m.lessonCount > 0 ? m.completedCount/m.lessonCount*100 : 0}%` }} />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
