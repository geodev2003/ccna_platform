'use client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { CheckCircle, BookOpen, Clock, Trophy, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

const COLORS = ['#3b82f6','#8b5cf6','#ef4444','#10b981'];

export default function ProgressPage() {
  const user = useAuthStore(s => s.user);

  const { data: analytics } = useQuery({
    queryKey: ['analytics-me'],
    queryFn: () => api.get('/analytics/me').then(r => r.data),
    enabled: !!user,
  });
  const { data: progress } = useQuery({
    queryKey: ['progress-me'],
    queryFn: () => api.get('/progress/me').then(r => r.data),
    enabled: !!user,
  });

  const s = analytics?.summary;
  const pieData = (analytics?.moduleProgress ?? []).map((m: any, i: number) => ({
    name: m.title, value: m.completed, color: COLORS[i % COLORS.length],
  })).filter((d: any) => d.value > 0);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Tiến độ học tập</h1>

            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: BookOpen, label: 'Hoàn thành', value: `${s?.completedLessons ?? 0}/${s?.totalLessons ?? 0}`, color: 'bg-blue-500' },
                { icon: Trophy, label: 'Điểm quiz TB', value: `${s?.avgScore ?? 0}%`, color: 'bg-yellow-500' },
                { icon: Clock, label: 'Tổng thời gian', value: `${s?.totalTimeHours ?? 0}h`, color: 'bg-purple-500' },
                { icon: TrendingUp, label: 'Streak', value: `${s?.streak ?? 0} ngày`, color: 'bg-orange-500' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="card p-5 flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${color}`}><Icon className="w-5 h-5 text-white" /></div>
                  <div><div className="text-xl font-bold">{value}</div><div className="text-xs text-gray-500">{label}</div></div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Module progress bars */}
              <div className="card p-6">
                <h2 className="font-semibold mb-4">Tiến độ theo giai đoạn</h2>
                <div className="space-y-4">
                  {(analytics?.moduleProgress ?? []).map((m: any, i: number) => (
                    <div key={m.moduleId}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium truncate">{m.title}</span>
                        <span className="text-gray-400 ml-2 shrink-0">{m.pct}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${m.pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{m.completed}/{m.total} bài</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly chart */}
              <div className="card p-6">
                <h2 className="font-semibold mb-4">Hoạt động 7 ngày</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics?.weeklyActivity ?? []}>
                    <XAxis dataKey="date" tickFormatter={d => new Date(d).toLocaleDateString('vi', { weekday: 'short' })} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip labelFormatter={d => new Date(d).toLocaleDateString('vi')} />
                    <Bar dataKey="count" name="Hoạt động" fill="#3b82f6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent completed lessons */}
            <div className="card p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Bài học gần đây</h2>
              {(progress ?? []).filter((p: any) => p.status === 'COMPLETED').slice(0, 10).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-3 border-b last:border-0 dark:border-gray-700">
                  <div>
                    <div className="font-medium text-sm">{p.lesson.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{p.lesson.module.title} · {Math.round((p.timeSpentSec??0)/60)} phút</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-400">{p.completedAt ? new Date(p.completedAt).toLocaleDateString('vi') : ''}</span>
                  </div>
                </div>
              ))}
              {(!progress || progress.filter((p: any) => p.status === 'COMPLETED').length === 0) && (
                <p className="text-center text-gray-400 py-6 text-sm">Chưa hoàn thành bài học nào. Hãy bắt đầu học!</p>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
