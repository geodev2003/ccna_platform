'use client';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Plus, Trash2, Edit, Users, BookOpen, Trophy, BarChart2, RefreshCw,
         Eye, GripVertical, X, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';
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

// ── Content Block Renderer (for preview) ───────────────────────────────────────
function ContentBlock({ block }: { block: any }) {
  const { type, data } = block;
  switch (type) {
    case 'heading': {
      const Tag = `h${data.level}` as any;
      const sizes: Record<number, string> = { 1: 'text-xl', 2: 'text-lg', 3: 'text-base' };
      return <Tag className={`font-bold ${sizes[data.level] ?? 'text-base'} mt-4 mb-2 text-gray-100`}>{data.text}</Tag>;
    }
    case 'paragraph':
      return <p className="text-gray-300 leading-relaxed mb-3 text-sm">{data.text}</p>;
    case 'code':
      return (
        <div className="mb-3">
          {data.label && <div className="text-xs text-gray-500 mb-1">{data.label}</div>}
          <pre className="bg-black text-green-400 text-xs rounded-lg p-3 overflow-x-auto"><code>{data.code}</code></pre>
        </div>
      );
    case 'tip':
      return (
        <div className="flex gap-2 bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 mb-3">
          <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-200">{data.text}</p>
        </div>
      );
    case 'warning':
      return (
        <div className="flex gap-2 bg-amber-900/30 border border-amber-700/50 rounded-lg p-3 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200">{data.text}</p>
        </div>
      );
    case 'keypoints':
      return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 mb-3">
          <div className="text-xs font-semibold text-gray-400 mb-2">Điểm chính</div>
          <ul className="space-y-1">
            {(data.points ?? []).map((p: string, i: number) => (
              <li key={i} className="flex gap-2 text-xs text-gray-300">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />{p}
              </li>
            ))}
          </ul>
        </div>
      );
    case 'table':
      return (
        <div className="overflow-x-auto mb-3 rounded-lg border border-gray-700">
          <table className="w-full text-xs">
            <thead className="bg-gray-800">
              <tr>{(data.headers ?? []).map((h: string, i: number) => (
                <th key={i} className="px-3 py-2 text-left font-semibold text-gray-400">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {(data.rows ?? []).map((row: string[], ri: number) => (
                <tr key={ri}>
                  {row.map((cell, ci) => <td key={ci} className="px-3 py-2 text-gray-300">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default: return null;
  }
}

// ── Lesson Preview Modal ────────────────────────────────────────────────────────
function PreviewModal({ lesson, onClose }: { lesson: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
           onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-700 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`badge text-xs ${lesson.isPublished ? 'badge-green' : 'bg-gray-700 text-gray-300'}`}>
                {lesson.isPublished ? 'Published' : 'Draft'}
              </span>
              {lesson.isAiGenerated && <span className="badge bg-purple-900/50 text-purple-300 text-xs">AI Generated</span>}
              <span className="text-xs text-gray-500">{lesson.type} · {lesson.durationMin}min</span>
            </div>
            <h2 className="text-lg font-bold text-white">{lesson.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Content */}
        <div className="overflow-y-auto p-5 flex-1">
          {(lesson.content ?? []).length > 0
            ? (lesson.content as any[]).map((block: any, i: number) => <ContentBlock key={i} block={block} />)
            : <p className="text-gray-500 text-sm text-center py-8">Không có nội dung</p>
          }
        </div>
      </div>
    </div>
  );
}

// ── Lessons Management ────────────────────────────────────────────────────────
function LessonsPanel({ modules }: { modules: any[] }) {
  const qc = useQueryClient();
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [previewLesson, setPreviewLesson] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOverId = useRef<string | null>(null);

  const { data: modDetail } = useQuery({
    queryKey: ['module-detail', selectedModule?.slug],
    queryFn: () => api.get(`/modules/${selectedModule.slug}`).then(r => r.data),
    enabled: !!selectedModule,
  });

  useEffect(() => {
    if (modDetail?.lessons) setLessons([...modDetail.lessons]);
  }, [modDetail]);

  const togglePublish = useMutation({
    mutationFn: ({ id, val }: { id: string; val: boolean }) => api.patch(`/lessons/${id}`, { isPublished: val }),
    onSuccess: () => { toast.success('Đã cập nhật!'); qc.invalidateQueries({ queryKey: ['module-detail', selectedModule?.slug] }); },
  });
  const deleteLesson = useMutation({
    mutationFn: (id: string) => api.delete(`/lessons/${id}`),
    onSuccess: () => { toast.success('Đã xóa!'); qc.invalidateQueries({ queryKey: ['module-detail', selectedModule?.slug] }); },
  });
  const reorder = useMutation({
    mutationFn: (ordered: any[]) => api.post('/lessons/reorder', {
      lessons: ordered.map((l, i) => ({ id: l.id, orderIndex: i + 1 })),
    }),
    onSuccess: () => { toast.success('Đã lưu thứ tự!'); qc.invalidateQueries({ queryKey: ['module-detail', selectedModule?.slug] }); },
    onError: () => toast.error('Lỗi lưu thứ tự'),
  });

  // ── Drag-and-drop handlers ──
  const handleDragStart = (id: string) => setDraggingId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    dragOverId.current = id;
    if (!draggingId || draggingId === id) return;
    setLessons(prev => {
      const from = prev.findIndex(l => l.id === draggingId);
      const to   = prev.findIndex(l => l.id === id);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };
  const handleDragEnd = () => {
    setDraggingId(null);
    dragOverId.current = null;
    reorder.mutate(lessons);
  };

  return (
    <>
      {previewLesson && <PreviewModal lesson={previewLesson} onClose={() => setPreviewLesson(null)} />}
      <div className="card p-6 flex flex-col" style={{ maxHeight: '520px' }}>
        <h2 className="font-bold text-lg mb-4 shrink-0">Quản lý bài học</h2>
        <div className="mb-3 shrink-0">
          <select className="input" onChange={e => setSelectedModule(modules.find(m => m.id === e.target.value))}>
            <option value="">Chọn module để xem bài học...</option>
            {modules.map((m: any) => <option key={m.id} value={m.id}>Phase {m.phase}: {m.title}</option>)}
          </select>
        </div>

        {selectedModule && (
          <div className="text-xs text-gray-500 mb-2 shrink-0">
            {lessons.length} bài học · Kéo <GripVertical className="inline w-3 h-3" /> để sắp xếp
          </div>
        )}

        {/* Scrollable lesson list */}
        <div className="overflow-y-auto flex-1 space-y-1.5 pr-1">
          {lessons.map((l: any) => (
            <div
              key={l.id}
              draggable
              onDragStart={() => handleDragStart(l.id)}
              onDragOver={e => handleDragOver(e, l.id)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-2 py-2.5 px-3 border rounded-xl transition-all select-none
                ${draggingId === l.id ? 'opacity-40 scale-[0.98]' : 'opacity-100'}
                border-gray-700 hover:border-gray-600 bg-gray-800/30`}
            >
              {/* Drag handle */}
              <GripVertical className="w-4 h-4 text-gray-600 hover:text-gray-400 cursor-grab shrink-0" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-sm text-gray-200 truncate max-w-[160px]">{l.title}</span>
                  {l.isPublished
                    ? <span className="badge badge-green text-xs">Published</span>
                    : <span className="badge bg-gray-700 text-gray-400 text-xs">Draft</span>}
                  {l.isAiGenerated && <span className="badge bg-purple-900/50 text-purple-300 text-xs">AI</span>}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{l.type} · {l.durationMin}min</div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setPreviewLesson(l)}
                  title="Xem trước"
                  className="p-1.5 text-gray-400 hover:text-cyan-400 hover:bg-cyan-900/20 rounded-lg transition">
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => togglePublish.mutate({ id: l.id, val: !l.isPublished })}
                  title={l.isPublished ? 'Ẩn bài học' : 'Xuất bản'}
                  className={`p-1.5 rounded-lg transition ${l.isPublished
                    ? 'text-green-400 hover:text-gray-400 hover:bg-gray-700'
                    : 'text-gray-400 hover:text-green-400 hover:bg-green-900/20'}`}>
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button onClick={() => { if (confirm('Xóa bài học này?')) deleteLesson.mutate(l.id); }}
                  title="Xóa"
                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {selectedModule && lessons.length === 0 && (
            <p className="text-center text-gray-500 py-8 text-sm">Chưa có bài học. Hãy tạo bằng AI!</p>
          )}
          {!selectedModule && (
            <p className="text-center text-gray-600 py-8 text-sm">Chọn module để quản lý bài học</p>
          )}
        </div>
      </div>
    </>
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
