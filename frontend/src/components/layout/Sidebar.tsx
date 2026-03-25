'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { LayoutDashboard, BookOpen, BarChart2, Shield, User, GraduationCap, FolderOpen, Network } from 'lucide-react';
import { clsx } from 'clsx';

const navGroups = [
  {
    label: null,
    items: [
      { href: '/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
      { href: '/profile',   label: 'Hồ sơ',        icon: User },
    ],
  },
  {
    label: 'Nội dung',
    items: [
      { href: '/courses',   label: 'Khóa học',     icon: GraduationCap },
      { href: '/learn',     label: 'Học tập',      icon: BookOpen },
      { href: '/documents', label: 'Tài liệu',     icon: FolderOpen },
    ],
  },
  {
    label: 'Phân tích',
    items: [
      { href: '/progress',  label: 'Tiến độ',      icon: BarChart2 },
    ],
  },
];

const adminItems = [
  { href: '/admin', label: 'Admin Panel', icon: Shield },
];

function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: any; active: boolean }) {
  return (
    <Link href={href}
      className={clsx(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        active
          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
      )}>
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore(s => s.user);

  return (
    <aside className="w-56 shrink-0 border-r bg-white dark:bg-gray-800 flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-5 border-b">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <Network className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-base">My Platform</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label ?? 'main'}>
            {group.label && (
              <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon }) => (
                <NavLink key={href} href={href} label={label} icon={icon}
                  active={pathname === href || (href !== '/dashboard' && pathname.startsWith(href))} />
              ))}
            </div>
          </div>
        ))}

        {(user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') && (
          <div>
            <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quản lý</div>
            <div className="space-y-0.5">
              {adminItems.map(({ href, label, icon }) => (
                <NavLink key={href} href={href} label={label} icon={icon}
                  active={pathname.startsWith(href)} />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Phase guide */}
      <div className="p-3 border-t">
        <div className="text-xs text-gray-400 font-semibold mb-2 px-1 uppercase tracking-wider">Giai đoạn CCNA</div>
        {[
          { phase: 1, label: 'Nền tảng', color: 'bg-blue-500' },
          { phase: 2, label: 'VLAN & Routing', color: 'bg-purple-500' },
          { phase: 3, label: 'Security', color: 'bg-red-500' },
          { phase: 4, label: 'Ôn thi', color: 'bg-green-500' },
        ].map(p => (
          <div key={p.phase} className="flex items-center gap-2 px-1 py-1">
            <div className={`w-2 h-2 rounded-full shrink-0 ${p.color}`} />
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">GĐ{p.phase}: {p.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
