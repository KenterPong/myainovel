import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import MobileNav from "@/components/MobileNav";

const inter = Inter({ subsets: ["latin"] });

// ✨ AI聚作平台 Metadata 設定
export const metadata: Metadata = {
  title: {
    template: '%s | AI聚作',
    default: 'AI聚作 - 互動式故事平台',
  },
  description: 'AI聚作是一個創新的互動式故事平台，讓讀者參與故事發展，創造屬於自己的故事結局。',
  keywords: ['互動故事', 'AI創作', '故事平台', '讀者參與', 'Next.js', 'React'],
  authors: [{ name: 'AI聚作團隊', url: 'https://ai-creation.com' }],
  creator: 'AI聚作團隊',
  publisher: 'AI聚作',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ai-creation.com'),
  alternates: {
    canonical: '/',
    languages: {
      'zh-TW': '/zh-TW',
      'en-US': '/en-US',
    },
  },
  openGraph: {
    title: 'AI聚作 - 互動式故事平台',
    description: '讓讀者參與故事發展，創造屬於自己的故事結局',
    url: 'https://ai-creation.com',
    siteName: 'AI聚作',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI聚作 - 互動式故事平台',
      },
    ],
    locale: 'zh_TW',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI聚作 - 互動式故事平台',
    description: '讓讀者參與故事發展，創造屬於自己的故事結局',
    images: ['/og-image.png'],
    creator: '@ai_creation',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        {/* 移動端導航 */}
        <MobileNav />
        
        <div className="min-h-screen bg-white flex">
          {/* 左側導航欄 - 固定 */}
          <div className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
            <Sidebar />
          </div>
          
          {/* 中央內容區域 - 可捲動 */}
          <main className="flex-1 min-w-0 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 py-6">
              {children}
            </div>
          </main>
          
          {/* 右側推薦欄 - 固定 */}
          <div className="hidden xl:block xl:w-80 flex-shrink-0">
            <RightSidebar />
          </div>
        </div>
      </body>
    </html>
  );
}
