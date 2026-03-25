import Link from 'next/link';
import { BookOpen, FileText, User, Cpu, Network, Shield, TrendingUp, ChevronRight, Github, Linkedin, Globe } from 'lucide-react';

const features = [
  {
    icon: User,
    title: 'Hồ sơ cá nhân',
    description: 'Lưu trữ thông tin, kỹ năng, CV và mạng xã hội của bạn trong một nơi.',
    color: 'bg-violet-500',
    href: '/profile',
  },
  {
    icon: BookOpen,
    title: 'Khóa học',
    description: 'Các khóa học tự tạo với nội dung phong phú, quiz và lab thực hành.',
    color: 'bg-blue-500',
    href: '/courses',
  },
  {
    icon: FileText,
    title: 'Tài liệu',
    description: 'Kho tài liệu được tổ chức theo thư mục và loại file — PDF, video, hình ảnh.',
    color: 'bg-emerald-500',
    href: '/documents',
  },
  {
    icon: Cpu,
    title: 'AI tạo nội dung',
    description: 'Tự động tạo bài học, câu hỏi quiz và bài lab với Google Gemini AI.',
    color: 'bg-orange-500',
    href: '/admin',
  },
];

const stats = [
  { value: '4', label: 'Giai đoạn học', icon: TrendingUp },
  { value: '200+', label: 'Câu hỏi Quiz', icon: Shield },
  { value: 'AI', label: 'Tạo nội dung', icon: Cpu },
  { value: '∞', label: 'Tài liệu', icon: FileText },
];

const phases = [
  { num: 1, title: 'Nền tảng mạng', desc: 'OSI, TCP/IP, IP addressing, subnetting', color: 'border-blue-500 bg-blue-500/10 text-blue-400' },
  { num: 2, title: 'VLAN & Routing', desc: 'STP, OSPF, EIGRP, inter-VLAN routing', color: 'border-purple-500 bg-purple-500/10 text-purple-400' },
  { num: 3, title: 'Security & WAN', desc: 'ACL, NAT, VPN, WLAN, network security', color: 'border-red-500 bg-red-500/10 text-red-400' },
  { num: 4, title: 'Ôn thi CCNA', desc: 'Luyện đề, mock test, phân tích điểm yếu', color: 'border-green-500 bg-green-500/10 text-green-400' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Network className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">My Platform</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <Link href="/courses" className="hover:text-white transition">Khóa học</Link>
            <Link href="/documents" className="hover:text-white transition">Tài liệu</Link>
            <Link href="/profile" className="hover:text-white transition">Hồ sơ</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login"
              className="text-sm text-gray-300 hover:text-white transition px-4 py-2 rounded-lg hover:bg-white/10">
              Đăng nhập
            </Link>
            <Link href="/auth/register"
              className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition font-medium">
              Bắt đầu
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-gray-950 to-gray-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              CCNA 200-301 · AI-Powered Learning Platform
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
              Nền tảng học tập &{' '}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                chia sẻ kiến thức
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Khám phá hành trình học CCNA với AI, theo dõi tiến độ, quản lý tài liệu và
              xây dựng hồ sơ chuyên nghiệp trong một nơi duy nhất.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/auth/register"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition text-base">
                Bắt đầu miễn phí
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/courses"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition text-base">
                <BookOpen className="w-4 h-4" />
                Xem khóa học
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20 max-w-3xl mx-auto">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:bg-white/8 transition">
                <Icon className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{value}</div>
                <div className="text-xs text-gray-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">Tất cả trong một nền tảng</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Từ hồ sơ cá nhân đến khóa học và tài liệu — mọi thứ được tổ chức gọn gàng.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description, color, href }) => (
              <Link key={title} href={href}
                className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 hover:bg-gray-800/80 transition-all duration-200 cursor-pointer block">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-5`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-white transition">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
                <div className="mt-4 flex items-center gap-1 text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition">
                  Khám phá <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CCNA Phases ── */}
      <section className="py-24 bg-gray-900/50 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Khóa học CCNA 200-301
            </div>
            <h2 className="text-3xl font-bold mb-4">Chương trình học 4 giai đoạn</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Lộ trình học được thiết kế từ cơ bản đến nâng cao, phù hợp cho kỳ thi CCNA 200-301.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {phases.map(({ num, title, desc, color }) => (
              <div key={num} className={`border rounded-2xl p-6 ${color}`}>
                <div className="text-4xl font-black mb-3 opacity-30">0{num}</div>
                <h3 className="font-bold text-lg text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/courses"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium px-6 py-3 rounded-xl transition">
              Xem chi tiết khóa học <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Documents preview ── */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
                <FileText className="w-3.5 h-3.5" />
                Kho tài liệu
              </div>
              <h2 className="text-3xl font-bold mb-5">Quản lý tài liệu thông minh</h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Upload và tổ chức tài liệu theo thư mục, phân loại theo loại file —
                PDF, video, hình ảnh. Tìm kiếm nhanh và chia sẻ dễ dàng.
              </p>
              <ul className="space-y-3">
                {['Phân loại theo thư mục tùy chỉnh', 'Lọc theo loại file (PDF, Video, Ảnh...)', 'Tìm kiếm toàn văn bản nhanh chóng', 'Gắn tags và mô tả chi tiết'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-300 text-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/documents"
                className="inline-flex items-center gap-2 mt-8 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-3 rounded-xl transition">
                Xem tài liệu <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-semibold text-gray-200">Tài liệu gần đây</h4>
                <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">Tất cả loại</span>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'CCNA Study Guide 2024.pdf', type: 'PDF', size: '12.4 MB', folder: 'CCNA', color: 'bg-red-500' },
                  { name: 'Packet Tracer Tutorial.mp4', type: 'Video', size: '245 MB', folder: 'Lab', color: 'bg-purple-500' },
                  { name: 'Network Topology Diagram.png', type: 'Ảnh', size: '2.1 MB', folder: 'Diagrams', color: 'bg-blue-500' },
                  { name: 'Subnetting Cheat Sheet.pdf', type: 'PDF', size: '0.8 MB', folder: 'CCNA', color: 'bg-red-500' },
                  { name: 'Router Config Notes.docx', type: 'Tài liệu', size: '1.2 MB', folder: 'Notes', color: 'bg-indigo-500' },
                ].map(f => (
                  <div key={f.name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/60 hover:bg-gray-800 transition">
                    <div className={`w-8 h-8 rounded-lg ${f.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {f.type[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{f.name}</p>
                      <p className="text-xs text-gray-500">{f.folder} · {f.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950 to-violet-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-5">Sẵn sàng bắt đầu chưa?</h2>
          <p className="text-gray-300 text-lg mb-10">
            Tham gia ngay để khám phá khóa học CCNA, tài liệu học tập và hồ sơ cá nhân của bạn.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/auth/register"
              className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-3.5 rounded-xl transition text-base">
              Đăng ký miễn phí
            </Link>
            <Link href="/auth/login"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl transition text-base">
              Đăng nhập
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800 bg-gray-950 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Network className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-gray-300">My Platform</span>
          </div>
          <p className="text-sm text-gray-500">Nền tảng học CCNA · AI-Powered</p>
          <div className="flex items-center gap-3">
            <a href="#" className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition">
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
