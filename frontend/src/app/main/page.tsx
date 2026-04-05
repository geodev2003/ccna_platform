'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Network, BookOpen, Mail, Github, Linkedin, Globe,
  ChevronDown, Terminal, Cpu, Database, Cloud, Shield,
  ArrowRight, GraduationCap, Languages, Headphones,
  FileText, PenLine, MessageSquare, Zap, BarChart3, Star
} from 'lucide-react';

/* ─── data ─── */
const NAV = [
  { label: 'Trang chủ', href: '#home' },
  { label: 'Giới thiệu', href: '#about' },
  { label: 'Khóa học',  href: '#courses' },
  { label: 'Tính năng', href: '#features' },
  { label: 'Liên hệ',  href: '#contact' },
];

const STATS = [
  { value: '2', label: 'Khóa học', icon: GraduationCap, color: '#06b6d4' },
  { value: '60+', label: 'Bài học', icon: BookOpen, color: '#8b5cf6' },
  { value: '200+', label: 'Câu hỏi', icon: Terminal, color: '#22c55e' },
  { value: 'AI', label: 'Powered', icon: Cpu, color: '#f59e0b' },
];

const COURSES = [
  {
    href: '/courses/certificates/ccna',
    badge: 'CCNA 200-301',
    badgeBg: 'rgba(6,182,212,0.12)',
    badgeBorder: 'rgba(6,182,212,0.3)',
    badgeColor: '#22d3ee',
    icon: Network,
    iconGradient: 'linear-gradient(135deg, #06b6d4, #0284c7)',
    iconGlow: 'rgba(6,182,212,0.4)',
    title: 'Chứng chỉ Mạng CCNA',
    desc: 'Chương trình CCNA 200-301 toàn diện: IP addressing, routing, switching, security và WAN — học theo 4 giai đoạn bài bản.',
    tags: ['TCP/IP', 'OSPF', 'VLAN', 'ACL', 'VPN'],
    skills: [
      { icon: Network, label: 'Networking' },
      { icon: Shield,  label: 'Security' },
      { icon: Database, label: 'Infrastructure' },
    ],
    accent: '#06b6d4',
    borderHover: 'rgba(6,182,212,0.4)',
  },
  {
    href: '/courses/english/ielts',
    badge: 'IELTS',
    badgeBg: 'rgba(34,197,94,0.10)',
    badgeBorder: 'rgba(34,197,94,0.3)',
    badgeColor: '#4ade80',
    icon: Languages,
    iconGradient: 'linear-gradient(135deg, #10b981, #059669)',
    iconGlow: 'rgba(16,185,129,0.4)',
    title: 'IELTS Preparation',
    desc: 'Luyện thi IELTS toàn diện 4 kỹ năng: Listening, Reading, Writing, Speaking với bài tập thực chiến và AI feedback.',
    tags: ['Listening', 'Reading', 'Writing', 'Speaking'],
    skills: [
      { icon: Headphones,    label: 'Listening' },
      { icon: PenLine,       label: 'Writing' },
      { icon: MessageSquare, label: 'Speaking' },
    ],
    accent: '#10b981',
    borderHover: 'rgba(16,185,129,0.4)',
  },
];

const FEATURES = [
  { icon: Zap,      title: 'AI Content Generation', desc: 'Google Gemini tự động tạo bài học, quiz và lab theo chủ đề bạn chọn.', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  { icon: BarChart3, title: 'Phân tích điểm yếu', desc: 'Hệ thống theo dõi điểm số, xác định chủ đề yếu và gợi ý ôn tập.', color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)' },
  { icon: Terminal, title: 'Quiz thực chiến', desc: '200+ câu hỏi với giải thích chi tiết và phân tích sai/đúng từng câu.', color: '#06b6d4', bg: 'rgba(6,182,212,0.10)' },
  { icon: Database, title: 'Lab mô phỏng', desc: 'Bài lab Packet Tracer tích hợp với hướng dẫn từng bước rõ ràng.', color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
  { icon: Cloud,    title: 'Kho tài liệu', desc: 'Quản lý PDF, video, hình ảnh theo thư mục với tìm kiếm toàn văn.', color: '#ec4899', bg: 'rgba(236,72,153,0.10)' },
  { icon: Star,     title: 'Tiến độ cá nhân', desc: 'Dashboard theo dõi streak, thời gian học và hoàn thành theo giai đoạn.', color: '#f97316', bg: 'rgba(249,115,22,0.10)' },
];

/* ─── components ─── */
function TypedText({ words }: { words: string[] }) {
  const [idx, setIdx] = useState(0);
  const [display, setDisplay] = useState('');
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[idx];
    const t = setTimeout(() => {
      if (!deleting) {
        if (display.length < word.length) setDisplay(word.slice(0, display.length + 1));
        else setTimeout(() => setDeleting(true), 2000);
      } else {
        if (display.length > 0) setDisplay(display.slice(0, -1));
        else { setDeleting(false); setIdx((idx + 1) % words.length); }
      }
    }, deleting ? 45 : 95);
    return () => clearTimeout(t);
  }, [display, deleting, idx, words]);
  return <span className="gradient-text typing-cursor">{display}</span>;
}

function SectionHeader({ tag, title, subtitle }: { tag: string; title: React.ReactNode; subtitle?: string }) {
  return (
    <div className="text-center mb-16">
      <div className="section-tag">{tag}</div>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">{title}</h2>
      {subtitle && <p className="text-gray-400 max-w-lg mx-auto text-base leading-relaxed">{subtitle}</p>}
    </div>
  );
}

/* ─── page ─── */
export default function MainPage() {
  const [activeNav, setActiveNav] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const sections = NAV.map(n => n.href.slice(1));
      for (const s of [...sections].reverse()) {
        const el = document.getElementById(s);
        if (el && window.scrollY >= el.offsetTop - 120) { setActiveNav(s); break; }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* ══ NAVBAR ══ */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass shadow-2xl' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', boxShadow: '0 0 16px rgba(6,182,212,0.5)' }}>
              <Network className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">My Platform</span>
          </a>

          <nav className="hidden md:flex items-center gap-7">
            {NAV.map(({ label, href }) => {
              const id = href.slice(1);
              return (
                <a key={href} href={href}
                  className={`nav-link ${activeNav === id ? 'nav-link-active' : ''}`}>
                  {label}
                </a>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm px-4 py-2">Đăng nhập</Link>
            <Link href="/register" className="btn-primary text-sm px-5 py-2">Bắt đầu miễn phí</Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-5 space-y-1.5">
              <span className={`block h-0.5 bg-current transition-all origin-center ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all origin-center ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden glass border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="max-w-6xl mx-auto px-6 py-5 space-y-1">
              {NAV.map(({ label, href }) => (
                <a key={href} href={href} onClick={() => setMobileOpen(false)}
                  className="block py-2.5 px-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm">
                  {label}
                </a>
              ))}
              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <Link href="/login" className="btn-secondary text-sm flex-1 justify-center">Đăng nhập</Link>
                <Link href="/register" className="btn-primary text-sm flex-1 justify-center">Bắt đầu</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ══ HERO ══ */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Layers */}
        <div className="absolute inset-0 bg-grid-pattern opacity-35" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6,182,212,0.07) 0%, transparent 70%)' }} />

        <div className="absolute top-[20%] left-[15%] w-72 h-72 rounded-full opacity-12 animate-blob"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-[20%] right-[15%] w-64 h-64 rounded-full opacity-10 animate-blob animation-delay-2000"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] opacity-5"
          style={{ background: 'radial-gradient(ellipse, #06b6d4, transparent 70%)', filter: 'blur(80px)' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-24 pb-16">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold mb-8 glass"
            style={{ border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80' }}>
            <span className="status-dot-green" />
            Nền tảng học tập AI-Powered · CCNA & IELTS
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-black text-white mb-5 leading-[1.05] tracking-tight">
            Học tập<br className="hidden sm:block" />{' '}
            <TypedText words={['thông minh hơn', 'hiệu quả hơn', 'cùng AI Gemini', 'đạt chứng chỉ']} />
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Nền tảng học <span className="text-cyan-400 font-medium">CCNA 200-301</span> và{' '}
            <span className="text-emerald-400 font-medium">IELTS</span> với AI tạo nội dung tự động,
            quiz thực chiến, lab mô phỏng và phân tích điểm yếu cá nhân hoá.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-16">
            <Link href="/register" className="btn-primary px-8 py-3.5 text-base gap-2">
              Bắt đầu miễn phí <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#courses" className="btn-secondary px-8 py-3.5 text-base gap-2">
              <BookOpen className="w-4 h-4" /> Xem khóa học
            </a>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
            {STATS.map(({ value, label, icon: Icon, color }) => (
              <div key={label} className="card p-4 text-center group hover:scale-105 transition-transform duration-300"
                style={{ '--accent-color': color } as any}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all duration-300"
                  style={{ background: color + '18', border: `1px solid ${color}30` }}>
                  <Icon className="w-4.5 h-4.5" style={{ color }} />
                </div>
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <a href="#about" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600 hover:text-cyan-400 transition-colors animate-float">
          <ChevronDown className="w-6 h-6" />
        </a>
      </section>

      {/* ══ ABOUT ══ */}
      <section id="about" className="py-28 relative overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        <div className="absolute inset-0 bg-grid-dense opacity-25" />
        <div className="relative max-w-6xl mx-auto px-6">
          <SectionHeader tag="Giới thiệu"
            title={<>Nền tảng học tập <span className="gradient-text">thế hệ mới</span></>}
            subtitle="Kết hợp nội dung chất lượng cao và sức mạnh AI để tạo trải nghiệm học tập được cá nhân hoá cho từng học viên." />

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <p className="text-gray-400 leading-relaxed text-lg">
                Được xây dựng để giúp bạn chinh phục <span className="text-white font-semibold">CCNA 200-301</span> và{' '}
                <span className="text-emerald-400 font-semibold">IELTS</span> một cách hiệu quả nhất.
                Tích hợp <span className="text-cyan-400 font-semibold">Google Gemini AI</span> tự động
                tạo bài học, quiz và lab theo chủ đề bạn cần.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Hệ thống theo dõi tiến độ thông minh xác định điểm yếu và gợi ý ôn tập,
                giúp bạn học đúng trọng tâm và tối ưu thời gian.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {['CCNA 200-301', 'IELTS', 'AI Learning', 'Lab Simulation', 'Analytics'].map(t => (
                  <span key={t} className="badge-cyan text-xs">{t}</span>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Link href="/register" className="btn-primary gap-2">
                  Tham gia ngay <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#courses" className="btn-secondary gap-2">
                  <BookOpen className="w-4 h-4" /> Khóa học
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: GraduationCap, label: 'Khóa học',    value: '2 Chương trình', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
                { icon: BookOpen,      label: 'Bài học',     value: '60+ Bài',        color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
                { icon: Terminal,      label: 'Câu hỏi Quiz', value: '200+',           color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
                { icon: Cpu,           label: 'AI Engine',   value: 'Gemini AI',      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="card p-5 hover:scale-105 transition-transform duration-300 group">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: bg, border: `1px solid ${color}30` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="text-2xl font-black text-white">{value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ COURSES ══ */}
      <section id="courses" className="py-28 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <div className="absolute inset-0 bg-grid-pattern opacity-25" />
        <div className="relative max-w-6xl mx-auto px-6">
          <SectionHeader tag="Khóa học"
            title={<>Chọn <span className="gradient-text">chương trình</span> học</>}
            subtitle="Chúng tôi cung cấp 2 chương trình học toàn diện: CCNA và IELTS, đều được hỗ trợ bởi AI." />

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {COURSES.map((c) => (
              <Link key={c.title} href={c.href}
                className="card group p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                style={{ '--hover-border': c.borderHover } as any}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = c.borderHover;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${c.accent}25, 0 12px 40px rgba(0,0,0,0.5)`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)';
                }}>

                {/* Icon + badge */}
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: c.iconGradient, boxShadow: `0 0 24px ${c.iconGlow}` }}>
                    <c.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ background: c.badgeBg, color: c.badgeColor, border: `1px solid ${c.badgeBorder}` }}>
                    {c.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 transition-colors duration-200"
                  style={{ '--hover-color': c.accent } as any}>
                  {c.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed flex-1 mb-5">{c.desc}</p>

                {/* Skills */}
                <div className="flex items-center gap-4 mb-5 pb-5"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {c.skills.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Icon className="w-3.5 h-3.5" style={{ color: c.accent }} />
                      {label}
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {c.tags.map(t => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)' }}>
                      {t}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between text-sm font-semibold transition-colors duration-200"
                  style={{ color: c.accent }}>
                  <span>Vào học ngay</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" className="py-28 relative overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        <div className="absolute inset-0 bg-grid-dense opacity-20" />
        <div className="relative max-w-6xl mx-auto px-6">
          <SectionHeader tag="Tính năng"
            title={<>Tất cả những gì bạn <span className="gradient-text">cần để học</span></>}
            subtitle="Bộ công cụ học tập toàn diện được thiết kế để giúp bạn học hiệu quả và đạt kết quả tốt nhất." />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="card p-6 group hover:-translate-y-1 transition-all duration-300"
                onMouseEnter={e => (e.currentTarget.style.borderColor = color + '40')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: bg, border: `1px solid ${color}30` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="font-bold text-white mb-2 text-base">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <section id="contact" className="py-28 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] opacity-6"
          style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.3), transparent 70%)', filter: 'blur(60px)' }} />

        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <SectionHeader tag="Liên hệ"
            title={<>Kết nối <span className="gradient-text">với chúng tôi</span></>}
            subtitle="Có câu hỏi về khóa học hoặc muốn đóng góp ý kiến? Chúng tôi luôn sẵn sàng lắng nghe." />

          <div className="card p-10 space-y-8">
            <a href="mailto:contact@platform.vn"
              className="flex items-center justify-center gap-3 text-gray-300 hover:text-cyan-400 transition-colors duration-200 group">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <Mail className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-lg group-hover:underline underline-offset-4">contact@platform.vn</span>
            </a>

            <div className="glow-line" />

            <div className="flex items-center justify-center gap-5">
              {[
                { icon: Github,   label: 'GitHub',   href: '#', color: '#94a3b8' },
                { icon: Linkedin, label: 'LinkedIn',  href: '#', color: '#06b6d4' },
                { icon: Globe,    label: 'Website',   href: '#', color: '#4ade80' },
              ].map(({ icon: Icon, label, href, color }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group">
                  <div className="w-13 h-13 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onMouseEnter={e => { const t = e.currentTarget as HTMLElement; t.style.background = color+'18'; t.style.borderColor = color+'50'; t.style.boxShadow = `0 0 20px ${color}40`; }}
                    onMouseLeave={e => { const t = e.currentTarget as HTMLElement; t.style.background = 'rgba(255,255,255,0.04)'; t.style.borderColor = 'rgba(255,255,255,0.08)'; t.style.boxShadow = 'none'; }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">{label}</span>
                </a>
              ))}
            </div>

            <div className="glow-line" />

            <div className="space-y-4">
              <p className="text-gray-400">Sẵn sàng bắt đầu hành trình học tập của bạn?</p>
              <Link href="/register" className="btn-primary px-10 py-3.5 text-base gap-2 inline-flex">
                Đăng ký miễn phí <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="py-8" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
              <Network className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-300">My Platform</span>
          </div>
          <p className="text-xs text-gray-600">
            © 2025 · Built with Next.js, Tailwind CSS · AI by Google Gemini
          </p>
          <div className="flex items-center gap-2">
            {[Github, Linkedin, Globe].map((Icon, i) => (
              <a key={i} href="#"
                className="p-2 rounded-lg text-gray-600 hover:text-white transition-all duration-200 hover:bg-white/5">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
