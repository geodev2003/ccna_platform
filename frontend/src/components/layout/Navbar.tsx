'use client';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Moon, Sun, LogOut, ChevronDown, Network } from 'lucide-react';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất');
    router.push('/auth/login');
  };

  return (
    <header className="h-14 flex items-center justify-between px-5 shrink-0 glass"
      style={{ borderBottom: '1px solid var(--border)' }}>

      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-accent-500 flex items-center justify-center"
          style={{ boxShadow: '0 0 10px rgba(6,182,212,0.4)' }}>
          <Network className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-gray-200">My Platform</span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-all">
          {theme === 'dark'
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />}
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', boxShadow: '0 0 8px rgba(6,182,212,0.4)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-300">{user?.name}</span>
            {user?.role !== 'STUDENT' && (
              <span className="badge-cyan text-[10px] hidden sm:inline-flex">{user?.role}</span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 z-20 card py-1 shadow-card-dark"
                style={{ border: '1px solid var(--border)' }}>
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all">
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
