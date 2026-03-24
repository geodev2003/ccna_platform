'use client';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất');
    router.push('/auth/login');
  };

  return (
    <header className="h-14 border-b bg-white dark:bg-gray-800 flex items-center justify-between px-6 shrink-0">
      <span className="text-sm text-gray-500">CCNA Platform</span>
      <div className="flex items-center gap-3">
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="hidden sm:block font-medium">{user?.name}</span>
          {user?.role !== 'STUDENT' && (
            <span className="badge badge-blue">{user?.role}</span>
          )}
        </div>
        <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
