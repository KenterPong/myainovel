import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">頁面不存在</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          抱歉，您要尋找的頁面可能已被移動、刪除或不存在。
        </p>
        <div className="space-x-4">
          <Link
            href="/"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回首頁
          </Link>
          <Link
            href="/about"
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            關於我們
          </Link>
        </div>
      </div>
    </div>
  )
}