'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Network, BookOpen, FileText, User, Github, Linkedin, Globe, Mail,
  ChevronDown, ExternalLink, Terminal, Shield, Cpu, Database, Cloud,
  ArrowRight, Download, MapPin, GraduationCap, Briefcase, Star
} from 'lucide-react';

/* ─────────────── Data ─────────────── */
const NAV_LINKS = [
  { label: 'Trang chủ', href: '#home' },
  { label: 'Giới thiệu', href: '#about' },
  { label: 'Kỹ năng', href: '#skills' },
  { label: 'Khóa học', href: '#courses' },
  { label: 'Tài liệu', href: '#documents' },
  { label: 'Liên hệ', href: '#contact' },
];

const SKILLS = [
  {
    category: 'Mạng & Hạ tầng',
    icon: Network,
    color: 'text-cyan-400',
    bg: 'rgba(6,182,212,0.1)',
    border: 'rgba(6,182,212,0.25)',
    items: ['CCNA 200-301', 'TCP/IP', 'OSPF / EIGRP', 'BGP', 'VLAN / STP', 'VPN / NAT', 'Packet Tracer', 'GNS3'],
  },
  {
    category: 'Bảo mật',
    icon: Shield,
    color: 'text-purple-400',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.25)',
    items: ['ACL', 'Firewall', 'IDS / IPS', 'Network Security', 'AAA', 'SSH / SSL', 'WLAN Security'],
  },
  {
    category: 'Công cụ & Nền tảng',
    icon: Cpu,
    color: 'text-emerald-400',
    bg: 'rgba(52,211,153,0.1)',
    border: 'rgba(52,211,153,0.25)',
    items: ['Docker', 'Linux', 'Wireshark', 'Git / GitHub', 'Cisco IOS', 'AWS Networking', 'Python / Bash'],
  },
];

const COURSES = [
  {
    title: 'CCNA 200-301 – Nền tảng mạng',
    desc: 'Chương trình học toàn diện từ OSI model, IP addressing, subnetting đến cấu hình router & switch cơ bản.',
    tags: ['TCP/IP', 'Subnetting', 'Routing', 'Switching'],
    phase: 'Phase 1',
    phaseColor: 'badge-cyan',
    lessons: 24,
    href: '/courses',
  },
  {
    title: 'CCNA – VLAN & Routing nâng cao',
    desc: 'VLAN, STP, Inter-VLAN routing, OSPF, EIGRP và các giao thức định tuyến động.',
    tags: ['VLAN', 'STP', 'OSPF', 'EIGRP'],
    phase: 'Phase 2',
    phaseColor: 'badge-purple',
    lessons: 20,
    href: '/courses',
  },
  {
    title: 'CCNA – Security & WAN',
    desc: 'ACL, NAT, VPN, bảo mật mạng không dây và công nghệ WAN hiện đại.',
    tags: ['ACL', 'NAT', 'VPN', 'WLAN'],
    phase: 'Phase 3',
    phaseColor: 'badge-red',
    lessons: 18,
    href: '/courses',
  },
];

const STATS = [
  { value: '4', label: 'Giai đoạn học', icon: GraduationCap },
  { value: '60+', label: 'Bài học', icon: BookOpen },
  { value: '200+', label: 'Câu hỏi Quiz', icon: Terminal },
  { value: 'AI', label: 'AI Generate', icon: Cpu },
];

/* ─────────────── Components ─────────────── */
function TypedText({ words }: { words: string[] }) {
  const [idx, setIdx] = useState(0);
  const [display, setDisplay] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[idx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (display.length < word.length) {
          setDisplay(word.slice(0, display.length + 1));
        } else {
          setTimeout(() => setDeleting(true), 1800);
        }
      } else {
        if (display.length > 0) {
          setDisplay(display.slice(0, -1));
        } else {
          setDeleting(false);
          setIdx((idx + 1) % words.length);
        }
      }
    }, deleting ? 50 : 100);
    return () => clearTimeout(timeout);
  }, [display, deleting, idx, words]);

  return <span className="gradient-text typing-cursor">{display}</span>;
}

function SectionHeader({ tag, title, subtitle }: { tag: string; title: React.ReactNode; subtitle?: string }) {
  return (
    <div className="text-center mb-16">
      <div className="section-tag">{tag}</div>
      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{title}</h2>
      {subtitle && <p className="text-gray-400 max-w-xl mx-auto">{subtitle}</p>}
    </div>
  );
}

/* ─────────────── Page ─────────────── */
export default function HomePage() {
  const [activeNav, setActiveNav] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = ['home', 'about', 'skills', 'courses', 'documents', 'contact'];
      for (const s of [...sections].reverse()) {
        const el = document.getElementById(s);
        if (el && window.scrollY >= el.offsetTop - 100) { setActiveNav(s); break; }
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* ══════════ NAVBAR ══════════ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center" style={{ boxShadow: '0 0 15px rgba(6,182,212,0.4)' }}>
              <Network className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">My Platform</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, href }) => {
              const id = href.slice(1);
              return (
                <a key={href} href={href}
                  className={`nav-link ${activeNav === id ? 'nav-link-active' : ''}`}>
                  {label}
                </a>
              );
            })}
          </nav>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost text-sm px-4 py-2">Đăng nhập</Link>
            <Link href="/auth/register" className="btn-primary text-sm px-5 py-2">Bắt đầu</Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-400 hover:text-white">
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-current transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-current transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-current transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden glass border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="max-w-6xl mx-auto px-6 py-4 space-y-2">
              {NAV_LINKS.map(({ label, href }) => (
                <a key={href} href={href} onClick={() => setMobileOpen(false)}
                  className="block py-2 text-gray-400 hover:text-white transition-colors">{label}</a>
              ))}
              <div className="flex gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <Link href="/auth/login" className="btn-secondary text-sm flex-1 justify-center">Đăng nhập</Link>
                <Link href="/auth/register" className="btn-primary text-sm flex-1 justify-center">Bắt đầu</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ══════════ HERO ══════════ */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />

        {/* Gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 animate-blob"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 animate-blob animation-delay-2000"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />

        {/* Radial vignette */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-dark-900/80 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-20">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 glass"
            style={{ color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Nền tảng học CCNA · AI-Powered
          </div>

          {/* Name */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight tracking-tight">
            Học CCNA<br />
            <TypedText words={['thông minh hơn', 'hiệu quả hơn', 'với AI', 'từ hôm nay']} />
          </h1>

          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Nền tảng học CCNA 200-301 với AI tạo nội dung tự động, quiz thực chiến, lab mô phỏng
            và phân tích điểm yếu — theo dõi tiến độ dễ dàng.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <Link href="/auth/register" className="btn-primary px-8 py-3.5 text-base font-semibold gap-2">
              Bắt đầu miễn phí <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#courses" className="btn-secondary px-8 py-3.5 text-base font-semibold gap-2">
              <BookOpen className="w-4 h-4" /> Xem khóa học
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="card p-4 text-center hover:border-accent-500/30 transition-all duration-300 group">
                <Icon className="w-5 h-5 text-accent-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <a href="#about" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600 hover:text-accent-400 transition-colors animate-float">
          <ChevronDown className="w-6 h-6" />
        </a>
      </section>

      {/* ══════════ ABOUT ══════════ */}
      <section id="about" className="py-28" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader tag="Giới thiệu" title={<>Về <span className="gradient-text">nền tảng</span></>}
            subtitle="Nơi học tập CCNA được cá nhân hóa với sức mạnh của AI" />

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <div className="space-y-6">
              <p className="text-gray-400 leading-relaxed text-lg">
                Nền tảng được xây dựng để giúp bạn chinh phục kỳ thi <span className="text-white font-semibold">CCNA 200-301</span> một
                cách hiệu quả nhất. Kết hợp giữa nội dung học thuật chất lượng cao và{' '}
                <span className="text-accent-400 font-semibold">trí tuệ nhân tạo Google Gemini</span>,
                chúng tôi tạo ra trải nghiệm học tập được cá nhân hóa cho từng người.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Từ lý thuyết mạng cơ bản đến lab thực hành phức tạp, quiz phân tích điểm yếu —
                mọi thứ đều được tổ chức theo <span className="text-white">4 giai đoạn học</span> rõ ràng,
                giúp bạn có lộ trình học tập bài bản từ beginner đến sẵn sàng thi chứng chỉ.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                {['CCNA 200-301', 'AI Learning', 'Lab Simulation', 'Quiz Analytics'].map(tag => (
                  <span key={tag} className="badge-cyan">{tag}</span>
                ))}
              </div>
              <div className="flex gap-4 pt-2">
                <Link href="/auth/register" className="btn-primary gap-2">
                  <ArrowRight className="w-4 h-4" /> Tham gia ngay
                </Link>
                <a href="#courses" className="btn-secondary gap-2">
                  <BookOpen className="w-4 h-4" /> Xem khóa học
                </a>
              </div>
            </div>

            {/* Right: info cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: GraduationCap, label: 'Chương trình học', value: '4 Giai đoạn', color: 'text-cyan-400', bg: 'rgba(6,182,212,0.1)' },
                { icon: BookOpen,      label: 'Tổng bài học',     value: '60+ Bài',    color: 'text-purple-400', bg: 'rgba(139,92,246,0.1)' },
                { icon: Terminal,      label: 'Câu hỏi Quiz',     value: '200+',       color: 'text-emerald-400', bg: 'rgba(52,211,153,0.1)' },
                { icon: Cpu,           label: 'AI Generate',      value: 'Gemini AI',  color: 'text-orange-400',  bg: 'rgba(251,146,60,0.1)' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="card p-5 hover:border-white/15 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="text-xl font-bold text-white">{value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ SKILLS ══════════ */}
      <section id="skills" className="py-28" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader tag="Kỹ năng" title={<>Chủ đề <span className="gradient-text">học tập</span></>}
            subtitle="Các lĩnh vực kiến thức được đề cập trong chương trình CCNA" />

          <div className="grid md:grid-cols-3 gap-6">
            {SKILLS.map(({ category, icon: Icon, color, bg, border, items }) => (
              <div key={category} className="card p-6 hover:border-white/15 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: bg, border: `1px solid ${border}` }}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <h3 className={`font-bold ${color}`}>{category}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map(item => (
                    <span key={item} className="skill-chip text-xs">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ COURSES ══════════ */}
      <section id="courses" className="py-28" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader tag="Khóa học" title={<>Chương trình <span className="gradient-text">CCNA</span></>}
            subtitle="4 giai đoạn học bài bản, từ nền tảng đến sẵn sàng thi chứng chỉ" />

          <div className="grid md:grid-cols-3 gap-6">
            {COURSES.map((c) => (
              <div key={c.title} className="card p-6 flex flex-col hover:border-accent-500/30 transition-all duration-300 group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <span className={`${c.phaseColor}`}>{c.phase}</span>
                  <span className="text-xs text-gray-500">{c.lessons} bài</span>
                </div>
                <h3 className="font-bold text-white text-base mb-3 group-hover:text-accent-400 transition-colors leading-snug">
                  {c.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed flex-1 mb-4">{c.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {c.tags.map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {t}
                    </span>
                  ))}
                </div>
                <Link href={c.href}
                  className="flex items-center gap-2 text-sm font-semibold text-accent-400 hover:text-accent-300 transition-colors mt-auto">
                  Vào học <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/courses" className="btn-secondary gap-2 px-8 py-3">
              Xem tất cả khóa học <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ DOCUMENTS ══════════ */}
      <section id="documents" className="py-28 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="relative max-w-6xl mx-auto px-6">
          <SectionHeader tag="Tài liệu" title={<>Kho tài liệu <span className="gradient-text">học tập</span></>}
            subtitle="Quản lý và chia sẻ tài liệu CCNA theo thư mục, loại file" />

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Features list */}
            <div className="space-y-4">
              {[
                { icon: FileText, title: 'Phân loại theo thư mục', desc: 'Tổ chức tài liệu theo chủ đề, giai đoạn học tập tùy ý.' },
                { icon: Database, title: 'Hỗ trợ nhiều loại file', desc: 'PDF, Video, Hình ảnh, Bảng tính và nhiều định dạng khác.' },
                { icon: Shield,   title: 'Kiểm soát quyền truy cập', desc: 'Chọn tài liệu công khai hoặc giữ riêng tư cho bản thân.' },
                { icon: Cloud,    title: 'Tìm kiếm nhanh chóng', desc: 'Tìm kiếm toàn văn bản, lọc theo tags và thư mục.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 p-4 rounded-xl transition-all duration-200 hover:bg-white/3 group">
                  <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
                    style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                    <Icon className="w-5 h-5 text-accent-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1 group-hover:text-accent-400 transition-colors">{title}</h4>
                    <p className="text-sm text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <Link href="/documents" className="btn-primary gap-2">
                  <FileText className="w-4 h-4" /> Xem tài liệu
                </Link>
              </div>
            </div>

            {/* Mock document UI */}
            <div className="card p-5" style={{ background: 'var(--bg-card)' }}>
              <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 h-6 rounded-md px-3 flex items-center text-xs text-gray-600"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                  /documents
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'CCNA Study Guide 2024.pdf', type: 'PDF', folder: 'CCNA', color: '#ef4444', size: '12.4 MB' },
                  { name: 'Packet Tracer Tutorial.mp4', type: 'Video', folder: 'Lab', color: '#a855f7', size: '245 MB' },
                  { name: 'Network Topology.png', type: 'Ảnh', folder: 'Diagrams', color: '#06b6d4', size: '2.1 MB' },
                  { name: 'Subnetting Cheat Sheet.pdf', type: 'PDF', folder: 'CCNA', color: '#ef4444', size: '0.8 MB' },
                  { name: 'Router Config Notes.docx', type: 'Docs', folder: 'Notes', color: '#6366f1', size: '1.2 MB' },
                ].map(f => (
                  <div key={f.name} className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(6,182,212,0.05)', e.currentTarget.style.borderColor = 'rgba(6,182,212,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)', e.currentTarget.style.borderColor = 'transparent')}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: f.color + '25', border: `1px solid ${f.color}40` }}>
                      <span style={{ color: f.color }}>{f.type[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{f.name}</p>
                      <p className="text-xs text-gray-600">{f.folder} · {f.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CONTACT ══════════ */}
      <section id="contact" className="py-28" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <SectionHeader tag="Liên hệ" title={<>Kết nối <span className="gradient-text">với tôi</span></>}
            subtitle="Có câu hỏi về khóa học hoặc nền tảng? Hãy liên hệ!" />

          <div className="card p-10 space-y-8">
            {/* Email */}
            <a href="mailto:contact@platform.vn"
              className="flex items-center justify-center gap-3 text-gray-300 hover:text-accent-400 transition-colors group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <Mail className="w-5 h-5 text-accent-400" />
              </div>
              <span className="text-lg group-hover:underline">contact@platform.vn</span>
            </a>

            <div className="glow-line" />

            {/* Social links */}
            <div className="flex items-center justify-center gap-6">
              {[
                { icon: Github,   label: 'GitHub',   href: '#', color: '#94a3b8' },
                { icon: Linkedin, label: 'LinkedIn',  href: '#', color: '#06b6d4' },
                { icon: Globe,    label: 'Website',   href: '#', color: '#4ade80' },
              ].map(({ icon: Icon, label, href, color }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = color + '20'; e.currentTarget.style.borderColor = color + '50'; e.currentTarget.style.boxShadow = `0 0 15px ${color}40`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">{label}</span>
                </a>
              ))}
            </div>

            <div className="glow-line" />

            {/* CTA */}
            <div className="space-y-4">
              <p className="text-gray-400">Sẵn sàng bắt đầu hành trình chinh phục CCNA?</p>
              <Link href="/auth/register" className="btn-primary px-10 py-3.5 text-base font-semibold gap-2 inline-flex">
                Đăng ký miễn phí <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="py-8" style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent-500 flex items-center justify-center">
              <Network className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-300">My Platform</span>
          </div>
          <p className="text-xs text-gray-600">
            Built with Next.js · Tailwind CSS · AI by Google Gemini
          </p>
          <div className="flex items-center gap-3">
            {[Github, Linkedin, Globe].map((Icon, i) => (
              <a key={i} href="#" className="p-2 rounded-lg text-gray-600 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
