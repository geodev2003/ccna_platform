'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore(s => s.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Đăng nhập thành công!');
      router.push('/dashboard');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Đăng nhập thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Đăng nhập</h1>
          <p className="text-gray-500 mt-1 text-sm">CCNA Learning Platform</p>
        </div>
        <div className="card p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Mật khẩu</label>
              <input className="input" type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <button className="btn-primary w-full justify-center py-2.5" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:underline">Đăng ký</Link>
          </p>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Demo: demo@ccna.local / Demo@123
        </p>
      </div>
    </div>
  );
}
