/**
 * 管理頁面連結組件
 */

import React from 'react';
import Link from 'next/link';

interface AdminLinkProps {
  className?: string;
}

export function AdminLink({ className = '' }: AdminLinkProps) {
  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Link
        href="/admin/ai-generation"
        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg shadow-lg hover:bg-purple-700 transition-colors duration-200"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        AI 生成歷史
      </Link>
    </div>
  );
}
