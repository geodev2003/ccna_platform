import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white px-4">
      <div className="max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          CCNA 200-301 · AI-Powered Learning
        </div>
        <h1 className="text-5xl font-bold mb-4 leading-tight">
          Học CCNA<br />
          <span className="text-blue-300">thông minh hơn</span>
        </h1>
        <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
          Nền tảng học CCNA với AI tạo nội dung, quiz, lab tự động — theo dõi tiến độ, phân tích điểm yếu, luyện thi thực chiến.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/auth/register" className="btn-primary text-base px-6 py-3">Bắt đầu miễn phí</Link>
          <Link href="/auth/login" className="btn bg-white/10 text-white border border-white/30 hover:bg-white/20 text-base px-6 py-3">Đăng nhập</Link>
        </div>
        <div className="grid grid-cols-3 gap-6 mt-16 text-center">
          {[['20 Tuần','Chương trình học'],['AI Generate','Nội dung tự động'],['Analytics','Báo cáo học tập']].map(([n,d]) => (
            <div key={n} className="bg-white/10 rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-blue-300">{n}</div>
              <div className="text-sm text-blue-100 mt-1">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
