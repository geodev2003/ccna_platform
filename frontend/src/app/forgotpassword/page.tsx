'use client';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Network, ArrowLeft, Mail, CheckCircle, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}>

      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-8 blur-3xl"
        style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.15), transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/main" className="inline-flex items-center gap-2.5 mb-8">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', boxShadow: '0 0 28px rgba(6,182,212,0.45)' }}>
              <Network className="w-5.5 h-5.5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">My Platform</span>
          </Link>

          {!sent && (
            <>
              <h1 className="text-3xl font-bold text-white mb-2">Quên mật khẩu?</h1>
              <p className="text-gray-400 text-sm">
                Nhập email để nhận liên kết đặt lại mật khẩu
              </p>
            </>
          )}
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center space-y-5 py-4">
              {/* Success icon */}
              <div className="relative inline-flex items-center justify-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)' }}>
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ background: 'rgba(34,197,94,0.4)' }} />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Kiểm tra email của bạn</h2>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Nếu <span className="text-white font-medium">{email}</span> tồn tại,
                  chúng tôi đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra cả thư mục spam.
                </p>
              </div>

              <div className="glow-line" />

              <div className="space-y-2.5">
                <p className="text-xs text-gray-600">Không nhận được email?</p>
                <button onClick={() => { setSent(false); setEmail(''); }}
                  className="btn-secondary w-full justify-center py-2.5 text-sm">
                  Thử email khác
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="label">Địa chỉ email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <input
                    className="input pl-10"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <button type="submit"
                className="btn-primary w-full justify-center py-3 text-sm"
                disabled={loading}>
                {loading
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang gửi...</span>
                  : <span className="flex items-center gap-2"><Mail className="w-4 h-4" />Gửi liên kết đặt lại <ArrowRight className="w-4 h-4" /></span>}
              </button>
            </form>
          )}

          <div className={sent ? '' : 'mt-5'}>
            <Link href="/login"
              className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mt-4">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
