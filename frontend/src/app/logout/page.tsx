'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Network } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();
  const logout = useAuthStore(s => s.logout);

  useEffect(() => {
    logout().finally(() => router.replace('/main'));
  }, [logout, router]);

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-xl bg-accent-500 flex items-center justify-center mx-auto animate-pulse"
          style={{ boxShadow: '0 0 20px rgba(6,182,212,0.4)' }}>
          <Network className="w-7 h-7 text-white" />
        </div>
        <p className="text-gray-400 text-sm">Đang đăng xuất...</p>
      </div>
    </div>
  );
}
