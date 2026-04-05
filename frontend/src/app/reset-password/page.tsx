'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Network, Eye, EyeOff, CheckCircle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [form, setForm] = useState({ newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error('Mật khẩu xác nhận không khớp');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: form.newPassword });
      setDone(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Token không hợp lệ hoặc đã hết hạn');
    } finally { setLoading(false); }
  };

  if (!token) {
    return (
      <div className="text-center py-4 space-y-4">
        <p className="text-red-400">Liên kết không hợp lệ.</p>
        <Link href="/forgotpassword" className="text-accent-400 hover:underline text-sm">
          Yêu cầu liên kết mới
        </Link>
      </div>
    );
  }

  return done ? (
    <div className="text-center py-4 space-y-4">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-emerald-400" />
      </div>
      <h2 className="text-lg font-bold text-white">Đặt lại thành công!</h2>
      <p className="text-sm text-gray-400">Đang chuyển hướng đến trang đăng nhập...</p>
    </div>
  ) : (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Mật khẩu mới</label>
        <div className="relative">
          <input
            className="input w-full pr-10"
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.newPassword}
            onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
            required
            minLength={8}
          />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Xác nhận mật khẩu</label>
        <input
          className="input w-full"
          type="password"
          placeholder="••••••••"
          value={form.confirm}
          onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
          required
        />
      </div>
      <button
        type="submit"
        className="btn-primary w-full justify-center py-2.5 text-sm font-semibold"
        disabled={loading}>
        {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/main" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent-500 flex items-center justify-center"
              style={{ boxShadow: '0 0 20px rgba(6,182,212,0.4)' }}>
              <Network className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">My Platform</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Đặt lại mật khẩu</h1>
          <p className="text-gray-400 mt-1 text-sm">Nhập mật khẩu mới của bạn</p>
        </div>
        <div className="card p-7">
          <Suspense fallback={<p className="text-gray-400 text-sm text-center">Đang tải...</p>}>
            <ResetPasswordForm />
          </Suspense>
          <div className="mt-5 text-center">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
