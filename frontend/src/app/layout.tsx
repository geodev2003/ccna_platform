import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Providers from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'CCNA Learning Platform',
  description: 'Nền tảng học CCNA 200-301 với AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen`}>
        <Providers>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#f1f5f9' } }} />
        </Providers>
      </body>
    </html>
  );
}
