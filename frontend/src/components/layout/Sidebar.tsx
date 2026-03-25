'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import {
  LayoutDashboard, BookOpen, BarChart2, Shield, User,
  GraduationCap, FolderOpen, Network, ChevronRight
} from 'lucide-react';

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

const PHASES = [
  { phase: 1, label: 'Nền tảng',    color: '#06b6d4' },
  { phase: 2, label: 'VLAN & Routing', color: '#8b5cf6' },
  { phase: 3, label: 'Security',    color: '#ef4444' },
  { phase: 4, label: 'Ôn thi',      color: '#22c55e' },
];

function NavLink({ href, label, icon: Icon, active }: {
  href: string; label: string; icon: any; active: boolean;
}) {
  return (
    <Link href={href}
      className={`sidebar-link ${active ? 'sidebar-link-active' : ''} group`}>
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1">{label}</span>
      {active && <ChevronRight className="w-3 h-3 opacity-60" />}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore(s => s.user);

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className="w-56 shrink-0 flex flex-col"
      style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>

      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-5"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-7 h-7 rounded-lg bg-accent-500 flex items-center justify-center shrink-0"
          style={{ boxShadow: '0 0 12px rgba(6,182,212,0.4)' }}>
          <Network className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-bold text-white text-sm">My Platform</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label ?? 'main'}>
            {group.label && (
              <p className="px-3 py-1 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5 mt-1">
              {group.items.map(({ href, label, icon }) => (
                <NavLink key={href} href={href} label={label} icon={icon} active={isActive(href)} />
              ))}
            </div>
          </div>
        ))}

        {(user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') && (
          <div>
            <p className="px-3 py-1 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
              Quản lý
            </p>
            <div className="space-y-0.5 mt-1">
              {adminItems.map(({ href, label, icon }) => (
                <NavLink key={href} href={href} label={label} icon={icon} active={isActive(href)} />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Phase guide */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-3 px-1">
          Giai đoạn CCNA
        </p>
        <div className="space-y-1.5">
          {PHASES.map(p => (
            <div key={p.phase} className="flex items-center gap-2.5 px-1">
              <div className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: p.color, boxShadow: `0 0 6px ${p.color}80` }} />
              <span className="text-xs text-gray-500 truncate">
                GĐ{p.phase}: <span className="text-gray-400">{p.label}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
