/**
 * 章節插圖組件
 * 顯示章節的 AI 生成插圖
 */

import Image from 'next/image';
import { useState } from 'react';

interface ChapterIllustrationProps {
  illustrationUrl?: string;
  illustrationPrompt?: string;
  illustrationStyle?: string;
  chapterTitle?: string;
  className?: string;
}

export default function ChapterIllustration({
  illustrationUrl,
  illustrationPrompt,
  illustrationStyle,
  chapterTitle,
  className = ''
}: ChapterIllustrationProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // 如果沒有插圖 URL，顯示預設插圖
  if (!illustrationUrl || imageError) {
    return (
      <div className={`relative w-full h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-2">🎨</div>
            <p className="text-gray-600 text-sm">插圖生成中...</p>
            {illustrationStyle && (
              <p className="text-gray-500 text-xs mt-1">風格: {illustrationStyle}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-lg">
        <Image
          src={illustrationUrl}
          alt={chapterTitle ? `${chapterTitle} 插圖` : '章節插圖'}
          fill
          className={`object-cover transition-opacity duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setImageLoading(false)}
          onError={() => setImageError(true)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        
        {/* 載入狀態 */}
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">載入插圖中...</p>
            </div>
          </div>
        )}
      </div>

      {/* 插圖資訊 */}
      {(illustrationStyle || illustrationPrompt) && (
        <div className="mt-2 text-xs text-gray-500">
          {illustrationStyle && (
            <p className="truncate">
              <span className="font-medium">風格:</span> {illustrationStyle}
            </p>
          )}
          {illustrationPrompt && (
            <details className="mt-1">
              <summary className="cursor-pointer hover:text-gray-700">
                查看生成提示詞
              </summary>
              <p className="mt-1 text-xs text-gray-400 break-words">
                {illustrationPrompt}
              </p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
