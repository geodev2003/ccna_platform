'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { LayoutDashboard, BookOpen, BarChart2, Settings, Shield } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/learn',     label: 'Học tập',   icon: BookOpen },
  { href: '/progress',  label: 'Tiến độ',   icon: BarChart2 },
];
const adminItems = [
  { href: '/admin', label: 'Admin Panel', icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore(s => s.user);

  return (
    <aside className="w-56 shrink-0 border-r bg-white dark:bg-gray-800 flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b">
        <span className="font-bold text-blue-600 text-lg">📡 CCNA</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}>
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}

        {(user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') && (
          <>
            <div className="pt-3 pb-1 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quản lý</div>
            {adminItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname.startsWith(href)
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Phase guide */}
      <div className="p-3 border-t">
        <div className="text-xs text-gray-400 font-medium mb-2 px-1">Giai đoạn học</div>
        {[
          { phase: 1, label: 'Nền tảng', color: 'bg-blue-500' },
          { phase: 2, label: 'VLAN & Routing', color: 'bg-purple-500' },
          { phase: 3, label: 'Security', color: 'bg-red-500' },
          { phase: 4, label: 'Ôn thi', color: 'bg-green-500' },
        ].map(p => (
          <div key={p.phase} className="flex items-center gap-2 px-1 py-0.5">
            <div className={`w-2 h-2 rounded-full ${p.color}`} />
            <span className="text-xs text-gray-500">GĐ{p.phase}: {p.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
