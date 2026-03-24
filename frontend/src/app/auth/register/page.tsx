'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore(s => s.register);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Mật khẩu không khớp');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Đăng ký thành công!');
      router.push('/dashboard');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Đăng ký thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
          <p className="text-gray-500 mt-1 text-sm">Bắt đầu hành trình CCNA của bạn</p>
        </div>
        <div className="card p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Họ tên</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Mật khẩu <span className="text-gray-400">(tối thiểu 8 ký tự)</span></label>
              <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} />
            </div>
            <div>
              <label className="label">Xác nhận mật khẩu</label>
              <input className="input" type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />
            </div>
            <button className="btn-primary w-full justify-center py-2.5" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Đã có tài khoản?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
