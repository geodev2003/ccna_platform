'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import toast from 'react-hot-toast';
import {
  User, Mail, Calendar, Edit3, Github, Linkedin, Globe, Download,
  Plus, X, Save, Camera, ExternalLink, Award, Briefcase
} from 'lucide-react';

interface Skill { name: string; level: number; category?: string }
interface Profile {
  id: string; name: string; email: string; role: string;
  avatarUrl?: string; bio?: string; skills?: Skill[];
  linkedinUrl?: string; githubUrl?: string; websiteUrl?: string;
  cvUrl?: string; createdAt: string;
}

const SKILL_CATEGORIES = ['Networking', 'Security', 'Cloud', 'Programming', 'DevOps', 'Khác'];
const ROLE_LABELS: Record<string, string> = { ADMIN: 'Admin', INSTRUCTOR: 'Giảng viên', STUDENT: 'Học viên' };

function SkillBar({ skill }: { skill: Skill }) {
  const color = skill.level >= 80 ? 'bg-green-500' : skill.level >= 60 ? 'bg-blue-500' : skill.level >= 40 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{skill.name}</span>
        <span className="text-gray-500 text-xs">{skill.level}%</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${skill.level}%` }} />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Profile>>({});
  const [newSkill, setNewSkill] = useState<Skill>({ name: '', level: 50, category: 'Networking' });

  useEffect(() => { if (!user) router.push('/auth/login'); }, [user, router]);

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () => api.get('/profile/me').then(r => r.data),
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) setForm({ ...profile });
  }, [profile]);

  const mutation = useMutation({
    mutationFn: (data: Partial<Profile>) => api.patch('/profile/me', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      setEditing(false);
      toast.success('Đã lưu hồ sơ');
    },
    onError: () => toast.error('Lưu thất bại'),
  });

  const handleSave = () => mutation.mutate(form);

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    setForm(f => ({ ...f, skills: [...(f.skills ?? []), { ...newSkill }] }));
    setNewSkill({ name: '', level: 50, category: 'Networking' });
  };

  const removeSkill = (idx: number) =>
    setForm(f => ({ ...f, skills: f.skills?.filter((_, i) => i !== idx) }));

  if (!user) return null;

  const skills = (editing ? form.skills : profile?.skills) ?? [];
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    const cat = s.category ?? 'Khác';
    (acc[cat] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
                <p className="text-gray-500 mt-1 text-sm">Thông tin, kỹ năng và CV của bạn</p>
              </div>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="btn btn-primary gap-2">
                  <Edit3 className="w-4 h-4" /> Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(false); setForm({ ...profile }); }} className="btn btn-secondary">
                    Hủy
                  </button>
                  <button onClick={handleSave} disabled={mutation.isPending} className="btn btn-primary gap-2">
                    <Save className="w-4 h-4" /> {mutation.isPending ? 'Đang lưu...' : 'Lưu hồ sơ'}
                  </button>
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* ── Left column ── */}
              <div className="space-y-5">

                {/* Avatar & basic info */}
                <div className="card p-6 text-center">
                  {isLoading ? (
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto animate-pulse" />
                  ) : (
                    <div className="relative inline-block">
                      {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.name}
                          className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-blue-500/20" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto text-white text-3xl font-bold ring-4 ring-blue-500/20">
                          {profile?.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      {editing && (
                        <div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition">
                          <Camera className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                  )}

                  {editing ? (
                    <input className="input mt-4 text-center font-semibold text-lg" value={form.name ?? ''} placeholder="Tên của bạn"
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  ) : (
                    <h2 className="text-xl font-bold mt-4">{profile?.name}</h2>
                  )}

                  <div className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mt-2">
                    <Award className="w-3 h-3" />
                    {ROLE_LABELS[profile?.role ?? 'STUDENT']}
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{profile?.email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Tham gia {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi') : '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Social links */}
                <div className="card p-5">
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-blue-500" /> Liên kết
                  </h3>
                  {editing ? (
                    <div className="space-y-3">
                      {[
                        { key: 'linkedinUrl', icon: Linkedin, placeholder: 'LinkedIn URL', color: 'text-blue-600' },
                        { key: 'githubUrl',   icon: Github,   placeholder: 'GitHub URL',   color: 'text-gray-700 dark:text-gray-300' },
                        { key: 'websiteUrl',  icon: Globe,    placeholder: 'Website URL',  color: 'text-green-600' },
                        { key: 'cvUrl',       icon: Download, placeholder: 'CV / Resume URL', color: 'text-purple-600' },
                      ].map(({ key, icon: Icon, placeholder, color }) => (
                        <div key={key} className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                          <input className="input text-xs" placeholder={placeholder}
                            value={(form as any)[key] ?? ''}
                            onChange={e => setForm(f => ({ ...f, [key]: e.target.value || null }))} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {[
                        { url: profile?.linkedinUrl, icon: Linkedin, label: 'LinkedIn', color: 'text-blue-600' },
                        { url: profile?.githubUrl,   icon: Github,   label: 'GitHub',   color: 'text-gray-700 dark:text-gray-300' },
                        { url: profile?.websiteUrl,  icon: Globe,    label: 'Website',  color: 'text-green-600' },
                      ].filter(l => l.url).map(({ url, icon: Icon, label, color }) => (
                        <a key={label} href={url!} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition group">
                          <Icon className={`w-4 h-4 ${color}`} />
                          <span>{label}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                        </a>
                      ))}
                      {profile?.cvUrl && (
                        <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline">
                          <Download className="w-4 h-4" /> Tải CV / Resume
                        </a>
                      )}
                      {!profile?.linkedinUrl && !profile?.githubUrl && !profile?.websiteUrl && !profile?.cvUrl && (
                        <p className="text-xs text-gray-400">Chưa có liên kết nào. Chỉnh sửa để thêm.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Right column ── */}
              <div className="lg:col-span-2 space-y-5">

                {/* Bio */}
                <div className="card p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-500" /> Giới thiệu bản thân
                  </h3>
                  {editing ? (
                    <textarea
                      className="input resize-none h-32"
                      placeholder="Viết vài dòng giới thiệu về bạn, kinh nghiệm, mục tiêu..."
                      value={form.bio ?? ''}
                      onChange={e => setForm(f => ({ ...f, bio: e.target.value || null }))}
                    />
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {profile?.bio ?? <span className="text-gray-400 italic">Chưa có giới thiệu. Nhấn Chỉnh sửa để thêm.</span>}
                    </p>
                  )}
                </div>

                {/* CV URL field (in edit: already in left panel; show download here when not editing) */}
                {!editing && profile?.cvUrl && (
                  <div className="card p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">CV / Resume</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Tải về CV của bạn</p>
                    </div>
                    <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer"
                      className="btn btn-primary gap-2">
                      <Download className="w-4 h-4" /> Tải xuống
                    </a>
                  </div>
                )}

                {/* Skills */}
                <div className="card p-6">
                  <h3 className="font-semibold mb-5 flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-500" /> Kỹ năng
                  </h3>

                  {editing && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-5 space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Thêm kỹ năng mới</p>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <input className="input" placeholder="Tên kỹ năng (vd: OSPF)" value={newSkill.name}
                          onChange={e => setNewSkill(s => ({ ...s, name: e.target.value }))} />
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Mức độ</span><span>{newSkill.level}%</span>
                          </div>
                          <input type="range" min={0} max={100} value={newSkill.level}
                            className="w-full accent-blue-600"
                            onChange={e => setNewSkill(s => ({ ...s, level: +e.target.value }))} />
                        </div>
                        <select className="input" value={newSkill.category}
                          onChange={e => setNewSkill(s => ({ ...s, category: e.target.value }))}>
                          {SKILL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <button onClick={addSkill} className="btn btn-secondary gap-2 text-xs">
                        <Plus className="w-3.5 h-3.5" /> Thêm kỹ năng
                      </button>
                    </div>
                  )}

                  {skills.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Chưa có kỹ năng nào. {editing ? 'Hãy thêm ở trên.' : 'Nhấn Chỉnh sửa để thêm.'}</p>
                  ) : editing ? (
                    <div className="space-y-2">
                      {skills.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">{s.name}</span>
                              <span className="text-gray-400 text-xs">{s.category} · {s.level}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.level}%` }} />
                            </div>
                          </div>
                          <button onClick={() => removeSkill(i)} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(grouped).map(([cat, catSkills]) => (
                        <div key={cat}>
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{cat}</h4>
                          <div className="grid sm:grid-cols-2 gap-4">
                            {catSkills.map((s, i) => <SkillBar key={i} skill={s} />)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
