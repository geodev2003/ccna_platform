'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import {
  LayoutDashboard, BookOpen, BarChart2, Shield, User,
  GraduationCap, FolderOpen, Network, ChevronRight, Languages,
  LogOut, Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const navGroups = [
  {
    label: null,
    items: [
      { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
      { href: '/profile',   label: 'Hồ sơ',      icon: User },
    ],
  },
  {
    label: 'Nội dung',
    items: [
      { href: '/courses',   label: 'Khóa học',   icon: GraduationCap },
      { href: '/learn',     label: 'Học tập',    icon: BookOpen },
      { href: '/documents', label: 'Tài liệu',   icon: FolderOpen },
    ],
  },
  {
    label: 'Phân tích',
    items: [
      { href: '/progress',  label: 'Tiến độ',    icon: BarChart2 },
    ],
  },
];

const adminItems = [
  { href: '/admin', label: 'Admin Panel', icon: Shield },
];

const COURSE_SHORTCUTS = [
  { href: '/courses/certificates/ccna', label: 'CCNA',  icon: Network,    color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.25)' },
  { href: '/courses/english/ielts',     label: 'IELTS', icon: Languages,  color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  INSTRUCTOR: 'Instructor',
  STUDENT: 'Student',
};
const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'rgba(239,68,68,0.12)',
  INSTRUCTOR: 'rgba(139,92,246,0.12)',
  STUDENT: 'rgba(6,182,212,0.12)',
};
const ROLE_TEXT: Record<string, string> = {
  ADMIN: '#f87171',
  INSTRUCTOR: '#a78bfa',
  STUDENT: '#22d3ee',
};

function NavLink({ href, label, icon: Icon, active }: {
  href: string; label: string; icon: any; active: boolean;
}) {
  return (
    <Link href={href}
      className={`sidebar-link ${active ? 'sidebar-link-active' : ''} group`}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
        style={active ? {
          background: 'rgba(6,182,212,0.2)',
          boxShadow: '0 0 10px rgba(6,182,212,0.15)',
        } : { background: 'rgba(255,255,255,0.04)' }}>
        <Icon className="w-3.5 h-3.5" style={active ? { color: '#22d3ee' } : {}} />
      </div>
      <span className="flex-1 text-sm">{label}</span>
      {active && <ChevronRight className="w-3 h-3 opacity-50" />}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const router = useRouter();

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/');

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất');
    router.push('/login');
  };

  const avatarLetter = user?.name?.[0]?.toUpperCase() ?? '?';
  const role = user?.role ?? 'STUDENT';

  return (
    <aside className="w-60 shrink-0 flex flex-col"
      style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>

      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-5 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', boxShadow: '0 0 14px rgba(6,182,212,0.45)' }}>
          <Network className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-bold text-white text-sm leading-none">My Platform</span>
          <p className="text-[10px] text-gray-600 mt-0.5">AI Learning</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label ?? 'main'}>
            {group.label && (
              <p className="px-3 pb-1 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon }) => (
                <NavLink key={href} href={href} label={label} icon={icon} active={isActive(href)} />
              ))}
            </div>
          </div>
        ))}

        {(user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') && (
          <div>
            <p className="px-3 pb-1 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
              Quản lý
            </p>
            <div className="space-y-0.5">
              {adminItems.map(({ href, label, icon }) => (
                <NavLink key={href} href={href} label={label} icon={icon} active={isActive(href)} />
              ))}
            </div>
          </div>
        )}

        {/* Course shortcuts */}
        <div>
          <p className="px-3 pb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            Khóa học nhanh
          </p>
          <div className="space-y-1.5">
            {COURSE_SHORTCUTS.map(({ href, label, icon: Icon, color, bg, border }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                  style={active
                    ? { background: bg, border: `1px solid ${border}`, color }
                    : { color: '#64748b' }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#e2e8f0'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#64748b'; }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: bg, border: `1px solid ${border}` }}>
                    <Icon className="w-3 h-3" style={{ color }} />
                  </div>
                  <span className="truncate">{label}</span>
                  {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User section */}
      <div className="p-3 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        {/* User card */}
        <Link href={`/profile/${user?.id}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 group"
          style={{ background: 'rgba(255,255,255,0.02)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}>
          {/* Avatar */}
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', boxShadow: '0 0 10px rgba(6,182,212,0.35)' }}>
            {avatarLetter}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-none">{user?.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: ROLE_COLORS[role], color: ROLE_TEXT[role] }}>
                {ROLE_LABELS[role]}
              </span>
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0" />
        </Link>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-500 transition-all duration-200"
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
            (e.currentTarget as HTMLElement).style.color = '#f87171';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = '#64748b';
          }}>
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
