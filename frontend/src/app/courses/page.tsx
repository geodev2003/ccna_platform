'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import {
  Network, Languages, ArrowRight, BookOpen, GraduationCap,
  Headphones, FileText, PenLine, MessageSquare, Shield, Cpu
} from 'lucide-react';

const COURSE_CATEGORIES = [
  {
    href: '/courses/certificates/ccna',
    badge: 'CCNA 200-301',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    icon: Network,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    borderColor: 'border-t-blue-500',
    title: 'Chứng chỉ Mạng CCNA',
    desc: 'Chương trình CCNA 200-301 toàn diện từ nền tảng mạng, routing & switching đến security và WAN. 4 giai đoạn học bài bản với AI tạo nội dung và quiz tự động.',
    tags: ['TCP/IP', 'Routing', 'VLAN', 'Security', 'WAN', 'Lab Simulation'],
    skills: [
      { icon: Network,  label: 'Networking' },
      { icon: Shield,   label: 'Security' },
      { icon: Cpu,      label: 'Infrastructure' },
    ],
    stats: { modules: '4 Giai đoạn', lessons: '60+ Bài học', quizzes: '200+ Quiz' },
    cta: 'Vào học CCNA',
  },
  {
    href: '/courses/english/ielts',
    badge: 'IELTS',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    icon: Languages,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    borderColor: 'border-t-emerald-500',
    title: 'IELTS Preparation',
    desc: 'Luyện thi IELTS toàn diện: Listening, Reading, Writing, Speaking. Bài tập thực chiến theo dạng đề thi chính thức, phân tích điểm yếu và AI feedback.',
    tags: ['Listening', 'Reading', 'Writing', 'Speaking', 'Band Score', 'Practice Tests'],
    skills: [
      { icon: Headphones,    label: 'Listening' },
      { icon: FileText,      label: 'Reading' },
      { icon: PenLine,       label: 'Writing' },
      { icon: MessageSquare, label: 'Speaking' },
    ],
    stats: { modules: '4 Kỹ năng', lessons: 'Bài tập đa dạng', quizzes: 'AI Feedback' },
    cta: 'Vào học IELTS',
  },
];

export default function CoursesHubPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);

  useEffect(() => { if (!user) router.push('/login'); }, [user, router]);
  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">

          {/* Page header */}
          <div className="px-8 py-10 text-white"
            style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #1d4ed8 100%)' }}>
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-bold">Khóa học</h1>
              </div>
              <p className="text-purple-100 text-sm">
                Chọn khóa học phù hợp với mục tiêu của bạn. Chúng tôi cung cấp chương trình CCNA và IELTS
                với AI hỗ trợ học tập thông minh.
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-6">
                {COURSE_CATEGORIES.map((cat) => (
                  <div key={cat.href}
                    className={`card border-t-4 ${cat.borderColor} p-7 flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group`}>

                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className={`w-14 h-14 rounded-2xl ${cat.iconBg} flex items-center justify-center`}>
                        <cat.icon className={`w-7 h-7 ${cat.iconColor}`} />
                      </div>
                      <span className={`badge ${cat.badgeClass} text-xs font-bold px-3 py-1.5`}>{cat.badge}</span>
                    </div>

                    {/* Title & desc */}
                    <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {cat.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5 flex-1">
                      {cat.desc}
                    </p>

                    {/* Skills */}
                    <div className="flex items-center gap-4 mb-5 pb-5 border-b dark:border-gray-700">
                      {cat.skills.map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Icon className={`w-3.5 h-3.5 ${cat.iconColor}`} />
                          {label}
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {cat.tags.map(t => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {Object.entries(cat.stats).map(([key, val]) => (
                        <div key={key} className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{val}</div>
                          <div className="text-xs text-gray-400 capitalize mt-0.5">{key}</div>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link href={cat.href}
                      className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-semibold text-sm transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-lg">
                      <BookOpen className="w-4 h-4" />
                      {cat.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>

              {/* Quick links */}
              <div className="mt-8 p-5 card">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm">Đường dẫn nhanh</h3>
                <div className="flex flex-wrap gap-3">
                  <Link href="/courses/certificates/ccna" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    <Network className="w-3.5 h-3.5" /> CCNA 200-301
                  </Link>
                  <span className="text-gray-300 dark:text-gray-700">·</span>
                  <Link href="/courses/english/ielts" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5" /> IELTS Preparation
                  </Link>
                  <span className="text-gray-300 dark:text-gray-700">·</span>
                  <Link href="/learn" className="text-sm text-gray-600 dark:text-gray-400 hover:underline flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Tất cả bài học
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
