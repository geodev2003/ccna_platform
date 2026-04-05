'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';
import { Eye, EyeOff, Network, ArrowRight, Shield, Zap, BookOpen, Languages } from 'lucide-react';

const FEATURES = [
  { icon: Network,   text: 'Khóa học CCNA 200-301 theo 4 giai đoạn' },
  { icon: Languages, text: 'Luyện thi IELTS Listening, Reading, Writing, Speaking' },
  { icon: Zap,       text: 'AI tạo nội dung & phân tích điểm yếu' },
  { icon: Shield,    text: 'Quiz, lab mô phỏng và theo dõi tiến độ' },
];

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore(s => s.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Đăng nhập thành công!');
      router.push('/dashboard');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Email hoặc mật khẩu không đúng');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Left panel – branding ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #070b13 0%, #0c1428 50%, #070e1f 100%)' }}>

        {/* Background grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />

        {/* Gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-15 animate-blob"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-10 animate-blob animation-delay-2000"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <Link href="/main" className="flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', boxShadow: '0 0 24px rgba(6,182,212,0.5)' }}>
              <Network className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">My Platform</span>
          </Link>

          {/* Headline */}
          <div className="my-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(6,182,212,0.12)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.25)' }}>
              <span className="status-dot-green" />
              Nền tảng học tập AI-Powered
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
              Chinh phục<br />
              <span className="gradient-text">CCNA & IELTS</span><br />
              cùng AI
            </h1>

            <p className="text-gray-400 text-base leading-relaxed max-w-sm">
              Học thông minh hơn với AI tạo nội dung tự động, quiz thực chiến
              và phân tích điểm yếu cá nhân hoá.
            </p>

            {/* Feature list */}
            <div className="space-y-3 pt-2">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)' }}>
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <span className="text-sm text-gray-300">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <div className="mt-auto pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-gray-600">
              © 2025 My Platform · Powered by Google Gemini AI
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel – form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">

        {/* Mobile logo */}
        <Link href="/main" className="flex items-center gap-2.5 mb-10 lg:hidden">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', boxShadow: '0 0 20px rgba(6,182,212,0.4)' }}>
            <Network className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-white text-lg">My Platform</span>
        </Link>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Đăng nhập</h2>
            <p className="text-gray-400">Chào mừng trở lại! Tiếp tục hành trình của bạn.</p>
          </div>

          {/* Form card */}
          <div className="card p-7 space-y-5">
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="label">Địa chỉ email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Mật khẩu</label>
                  <Link href="/forgotpassword"
                    className="text-xs font-medium transition-colors duration-200"
                    style={{ color: '#22d3ee' }}>
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    className="input pr-11"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit"
                className="btn-primary w-full justify-center py-3 text-sm"
                disabled={loading}>
                {loading
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang đăng nhập...</span>
                  : <span className="flex items-center gap-2">Đăng nhập <ArrowRight className="w-4 h-4" /></span>}
              </button>
            </form>

            <div className="glow-line" />

            <p className="text-center text-sm text-gray-500">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="font-semibold transition-colors duration-200 hover:opacity-80" style={{ color: '#22d3ee' }}>
                Đăng ký miễn phí
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-600 mt-5">
            Demo: <span className="text-gray-500">demo@ccna.local / Demo@123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
