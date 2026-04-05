'use client';
import { useAuthStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, ChevronDown, Network, User, Bell } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useState } from 'react';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/profile': 'Hồ sơ cá nhân',
  '/courses': 'Khóa học',
  '/courses/certificates/ccna': 'CCNA 200-301',
  '/courses/english/ielts': 'IELTS',
  '/learn': 'Học tập',
  '/documents': 'Tài liệu',
  '/progress': 'Tiến độ',
  '/admin': 'Admin Panel',
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/profile/')) return 'Hồ sơ cá nhân';
  if (pathname.startsWith('/courses/certificates/ccna')) return 'CCNA 200-301';
  if (pathname.startsWith('/courses/english/ielts')) return 'IELTS';
  if (pathname.startsWith('/courses')) return 'Khóa học';
  if (pathname.startsWith('/learn')) return 'Học tập';
  if (pathname.startsWith('/admin')) return 'Admin Panel';
  return 'My Platform';
}

const ROLE_LABELS: Record<string, string> = { ADMIN: 'Admin', INSTRUCTOR: 'Instructor', STUDENT: 'Student' };
const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'rgba(239,68,68,0.12)',
  INSTRUCTOR: 'rgba(139,92,246,0.12)',
  STUDENT: 'rgba(6,182,212,0.12)',
};
const ROLE_TEXT: Record<string, string> = { ADMIN: '#f87171', INSTRUCTOR: '#a78bfa', STUDENT: '#22d3ee' };

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    toast.success('Đã đăng xuất');
    router.push('/login');
  };

  const avatarLetter = user?.name?.[0]?.toUpperCase() ?? '?';
  const role = user?.role ?? 'STUDENT';
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="h-14 flex items-center justify-between px-5 shrink-0 glass"
      style={{ borderBottom: '1px solid var(--border)' }}>

      {/* Page title */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', boxShadow: '0 0 10px rgba(6,182,212,0.35)' }}>
          <Network className="w-3 h-3 text-white" />
        </div>
        <h1 className="text-sm font-semibold text-white">{pageTitle}</h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5">
        {/* Notification bell (cosmetic) */}
        <button className="relative p-2 rounded-lg text-gray-500 transition-all duration-200"
          style={{ background: 'transparent' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
            (e.currentTarget as HTMLElement).style.color = '#e2e8f0';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = '#64748b';
          }}>
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: '#06b6d4', boxShadow: '0 0 4px rgba(6,182,212,0.8)' }} />
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-200"
            style={{ background: dropdownOpen ? 'rgba(255,255,255,0.07)' : 'transparent' }}
            onMouseEnter={e => { if (!dropdownOpen) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { if (!dropdownOpen) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            {/* Avatar */}
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', boxShadow: '0 0 8px rgba(6,182,212,0.4)' }}>
              {avatarLetter}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-none">{user?.name}</p>
              <p className="text-[10px] mt-0.5 font-medium" style={{ color: ROLE_TEXT[role] }}>
                {ROLE_LABELS[role]}
              </p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 z-20 card py-1.5 overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>

                {/* User info header */}
                <div className="px-4 py-3 flex items-center gap-3"
                  style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', boxShadow: '0 0 10px rgba(6,182,212,0.35)' }}>
                    {avatarLetter}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                  </div>
                </div>

                {/* Role badge */}
                <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: ROLE_COLORS[role], color: ROLE_TEXT[role] }}>
                    {ROLE_LABELS[role]}
                  </span>
                </div>

                {/* Links */}
                <div className="py-1">
                  <Link href={`/profile/${user?.id}`}
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-400 transition-all duration-200"
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                      (e.currentTarget as HTMLElement).style.color = '#e2e8f0';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                    }}>
                    <User className="w-4 h-4 shrink-0" />
                    Hồ sơ cá nhân
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-400 transition-all duration-200"
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
                      (e.currentTarget as HTMLElement).style.color = '#f87171';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                    }}>
                    <LogOut className="w-4 h-4 shrink-0" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
