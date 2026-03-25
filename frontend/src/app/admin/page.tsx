'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Plus, Trash2, Edit, Users, BookOpen, Trophy, BarChart2, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="card p-5 flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${color}`}><Icon className="w-5 h-5 text-white" /></div>
      <div><div className="text-xl font-bold">{value ?? '—'}</div><div className="text-xs text-gray-500">{label}</div></div>
    </div>
  );
}

// ── AI Generate Form ──────────────────────────────────────────────────────────
function AIGeneratePanel({ modules }: { modules: any[] }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ topic: '', moduleId: '', phase: 1, type: 'MIXED', difficulty: 'intermediate' });
  const [generating, setGenerating] = useState<string | null>(null);

  const generateLesson = useMutation({
    mutationFn: async () => {
      setGenerating('lesson');
      // 1. Generate content via AI
      const { data: aiData } = await api.post('/ai/generate-lesson', {
        topic: form.topic, phase: form.phase, type: form.type, difficulty: form.difficulty,
      });
      // 2. Save lesson to DB
      const mod = modules.find(m => m.id === form.moduleId);
      const lessonsRes = await api.get(`/modules/${mod?.slug}`);
      const nextOrder = (lessonsRes.data.lessons?.length ?? 0) + 1;
      await api.post('/lessons', {
        moduleId: form.moduleId,
        title: aiData.lesson.title,
        slug: aiData.lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) + '-' + Date.now(),
        type: form.type,
        orderIndex: nextOrder,
        durationMin: aiData.lesson.duration_min ?? 45,
        content: aiData.lesson.content,
        isPublished: true,
      });
      return aiData;
    },
    onSuccess: () => { toast.success('Đã tạo bài học bằng AI!'); qc.invalidateQueries({ queryKey: ['modules'] }); setGenerating(null); },
    onError: (e: any) => { toast.error(e.response?.data?.error ?? 'Lỗi AI'); setGenerating(null); },
  });

  return (
    <div className="card p-6">
      <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-500" /> Tạo nội dung bằng AI
      </h2>
      <div className="space-y-4">
        <div>
          <label className="label">Chủ đề bài học</label>
          <input className="input" placeholder="vd: VLAN Trunking & 802.1Q" value={form.topic}
            onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Module</label>
            <select className="input" value={form.moduleId} onChange={e => setForm(f => ({ ...f, moduleId: e.target.value }))}>
              <option value="">Chọn module...</option>
              {modules.map((m: any) => <option key={m.id} value={m.id}>Phase {m.phase}: {m.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Loại bài</label>
            <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="THEORY">Lý thuyết</option>
              <option value="LAB">Lab</option>
              <option value="MIXED">Hỗn hợp</option>
            </select>
          </div>
          <div>
            <label className="label">Giai đoạn</label>
            <select className="input" value={form.phase} onChange={e => setForm(f => ({ ...f, phase: Number(e.target.value) }))}>
              {[1,2,3,4].map(p => <option key={p} value={p}>Phase {p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Độ khó</label>
            <select className="input" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
              <option value="beginner">Cơ bản</option>
              <option value="intermediate">Trung bình</option>
              <option value="advanced">Nâng cao</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => generateLesson.mutate()}
          disabled={!form.topic || !form.moduleId || !!generating}
          className="btn-primary w-full justify-center py-2.5">
          {generating ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Đang tạo với Claude AI...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Tạo bài học tự động</>
          )}
        </button>
        <p className="text-xs text-gray-400 text-center">Claude AI sẽ tạo nội dung lý thuyết, commands, tips thi và mở rộng kiến thức tự động.</p>
      </div>
    </div>
  );
}

// ── Lessons Management ────────────────────────────────────────────────────────
function LessonsPanel({ modules }: { modules: any[] }) {
  const qc = useQueryClient();
  const [selectedModule, setSelectedModule] = useState<any>(null);

  const { data: modDetail } = useQuery({
    queryKey: ['module-detail', selectedModule?.slug],
    queryFn: () => api.get(`/modules/${selectedModule.slug}`).then(r => r.data),
    enabled: !!selectedModule,
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, val }: { id: string; val: boolean }) => api.patch(`/lessons/${id}`, { isPublished: val }),
    onSuccess: () => { toast.success('Đã cập nhật!'); qc.invalidateQueries({ queryKey: ['module-detail', selectedModule?.slug] }); },
  });
  const deleteLesson = useMutation({
    mutationFn: (id: string) => api.delete(`/lessons/${id}`),
    onSuccess: () => { toast.success('Đã xóa!'); qc.invalidateQueries({ queryKey: ['module-detail', selectedModule?.slug] }); },
  });

  return (
    <div className="card p-6">
      <h2 className="font-bold text-lg mb-4">Quản lý bài học</h2>
      <div className="mb-4">
        <select className="input" onChange={e => setSelectedModule(modules.find(m => m.id === e.target.value))}>
          <option value="">Chọn module để xem bài học...</option>
          {modules.map((m: any) => <option key={m.id} value={m.id}>Phase {m.phase}: {m.title}</option>)}
        </select>
      </div>
      {modDetail && (
        <div className="space-y-2">
          {(modDetail.lessons ?? []).map((l: any) => (
            <div key={l.id} className="flex items-center justify-between py-3 px-4 border border-gray-100 dark:border-gray-700 rounded-xl">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{l.title}</span>
                  {l.isPublished
                    ? <span className="badge badge-green">Published</span>
                    : <span className="badge bg-gray-100 text-gray-600">Draft</span>}
                  {l.isAiGenerated && <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">AI</span>}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{l.type} · {l.durationMin}min</div>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <button onClick={() => togglePublish.mutate({ id: l.id, val: !l.isPublished })}
                  className={`text-xs px-3 py-1 rounded-lg border font-medium transition ${l.isPublished ? 'border-gray-300 text-gray-600 hover:bg-gray-50' : 'border-green-300 text-green-600 hover:bg-green-50'}`}>
                  {l.isPublished ? 'Ẩn' : 'Xuất bản'}
                </button>
                <button onClick={() => { if (confirm('Xóa bài học này?')) deleteLesson.mutate(l.id); }}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {modDetail.lessons?.length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm">Chưa có bài học. Hãy tạo bằng AI!</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Admin Page ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const user = useAuthStore(s => s.user);
  const router = useRouter();
  const qc = useQueryClient();

  // All hooks must be called before any conditional returns (Rules of Hooks)
  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: () => api.get('/admin/stats').then(r => r.data), enabled: !!user && user.role !== 'STUDENT' });
  const { data: modules } = useQuery({ queryKey: ['modules'], queryFn: () => api.get('/modules').then(r => r.data) });
  const { data: userList } = useQuery({ queryKey: ['admin-users'], queryFn: () => api.get('/analytics/admin/users').then(r => r.data), enabled: !!user && user.role !== 'STUDENT' });

  const toggleUser = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => api.patch(`/admin/users/${id}`, { isActive: active }),
    onSuccess: () => { toast.success('Đã cập nhật!'); qc.invalidateQueries({ queryKey: ['admin-users'] }); },
  });

  if (user && user.role === 'STUDENT') { router.push('/dashboard'); return null; }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Admin Panel</h1>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Users}    label="Người dùng"  value={stats?.users}    color="bg-blue-500" />
              <StatCard icon={BookOpen} label="Bài học"     value={stats?.lessons}  color="bg-purple-500" />
              <StatCard icon={Trophy}   label="Lượt quiz"   value={stats?.attempts} color="bg-yellow-500" />
              <StatCard icon={BarChart2} label="Điểm TB"   value={stats ? `${stats.avgScore}%` : null} color="bg-green-500" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* AI Generate */}
              <AIGeneratePanel modules={modules ?? []} />

              {/* Lessons Manage */}
              <LessonsPanel modules={modules ?? []} />
            </div>

            {/* Users Table */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Users className="w-5 h-5" />Người dùng</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 uppercase tracking-wider">
                    <tr className="border-b">
                      {['Tên','Email','Vai trò','Bài học','Quiz','Trạng thái','Hành động'].map(h => (
                        <th key={h} className="text-left py-3 px-2 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {(userList?.users ?? []).map((u: any) => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-2 font-medium">{u.name}</td>
                        <td className="py-3 px-2 text-gray-500">{u.email}</td>
                        <td className="py-3 px-2">
                          <span className={`badge ${u.role === 'ADMIN' ? 'badge-red' : u.role === 'INSTRUCTOR' ? 'badge-blue' : 'badge-amber'}`}>{u.role}</span>
                        </td>
                        <td className="py-3 px-2 text-center">{u._count.progress}</td>
                        <td className="py-3 px-2 text-center">{u._count.quizAttempts}</td>
                        <td className="py-3 px-2">
                          <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td className="py-3 px-2">
                          <button onClick={() => toggleUser.mutate({ id: u.id, active: !u.isActive })}
                            className="text-xs text-blue-600 hover:underline">
                            {u.isActive ? 'Khóa' : 'Mở khóa'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
