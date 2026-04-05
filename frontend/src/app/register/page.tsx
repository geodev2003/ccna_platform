'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';
import { Eye, EyeOff, Network, ArrowRight, Check } from 'lucide-react';

const PERKS = [
  'Truy cập toàn bộ khóa học CCNA & IELTS',
  'AI tạo quiz và nội dung học tập tự động',
  'Theo dõi tiến độ & phân tích điểm yếu',
  'Lab mô phỏng Packet Tracer tích hợp',
];

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore(s => s.register);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Mật khẩu xác nhận không khớp');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Tạo tài khoản thành công!');
      router.push('/dashboard');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Đăng ký thất bại');
    } finally { setLoading(false); }
  };

  const strength = form.password.length >= 8 ? (
    /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 'strong' : 'medium'
  ) : form.password.length > 0 ? 'weak' : null;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #070b13 0%, #0e1528 50%, #070e1f 100%)' }}>
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full opacity-12 animate-blob"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full opacity-10 animate-blob animation-delay-4000"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col h-full p-12">
          <Link href="/main" className="flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 0 24px rgba(139,92,246,0.5)' }}>
              <Network className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">My Platform</span>
          </Link>

          <div className="my-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              Tham gia miễn phí hôm nay
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
              Bắt đầu<br />
              <span className="gradient-text">hành trình</span><br />
              học tập
            </h1>

            <p className="text-gray-400 text-base leading-relaxed max-w-sm">
              Tạo tài khoản và truy cập ngay vào toàn bộ kho học liệu CCNA và IELTS.
            </p>

            <div className="space-y-3 pt-2">
              {PERKS.map(perk => (
                <div key={perk} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)' }}>
                    <Check className="w-3 h-3 text-violet-400" />
                  </div>
                  <span className="text-sm text-gray-300">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-gray-600">© 2025 My Platform · Hoàn toàn miễn phí</p>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative overflow-y-auto">
        <Link href="/main" className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}>
            <Network className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg">My Platform</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Tạo tài khoản</h2>
            <p className="text-gray-400">Miễn phí · Không cần thẻ tín dụng</p>
          </div>

          <div className="card p-7">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Họ và tên</label>
                <input className="input" placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required minLength={2} autoComplete="name" />
              </div>

              <div>
                <label className="label">Địa chỉ email</label>
                <input className="input" type="email" placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required autoComplete="email" />
              </div>

              <div>
                <label className="label">
                  Mật khẩu <span className="text-gray-600 font-normal">(tối thiểu 8 ký tự)</span>
                </label>
                <div className="relative">
                  <input className="input pr-11"
                    type={showPass ? 'text' : 'password'} placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required minLength={8} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {strength && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex gap-1 flex-1">
                      {['weak', 'medium', 'strong'].map((s, i) => (
                        <div key={s} className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ background: ['weak','medium','strong'].indexOf(strength) >= i
                            ? strength === 'strong' ? '#4ade80' : strength === 'medium' ? '#fbbf24' : '#f87171'
                            : 'rgba(255,255,255,0.1)' }} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {strength === 'strong' ? '💪 Mạnh' : strength === 'medium' ? '⚡ Vừa' : '⚠️ Yếu'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Xác nhận mật khẩu</label>
                <input className="input" type="password" placeholder="••••••••"
                  value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  required autoComplete="new-password" />
                {form.confirm && form.password !== form.confirm && (
                  <p className="text-xs text-red-400 mt-1.5">Mật khẩu không khớp</p>
                )}
              </div>

              <button type="submit"
                className="btn-primary w-full justify-center py-3 text-sm mt-2"
                disabled={loading}>
                {loading
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang tạo...</span>
                  : <span className="flex items-center gap-2">Tạo tài khoản <ArrowRight className="w-4 h-4" /></span>}
              </button>
            </form>

            <div className="glow-line mt-5" />
            <p className="text-center text-sm text-gray-500 mt-4">
              Đã có tài khoản?{' '}
              <Link href="/login" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: '#22d3ee' }}>
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
