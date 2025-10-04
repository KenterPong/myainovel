/**
 * 投票選項組件
 */

import React from 'react';
import { VotingOption } from '@/types/voting';

interface VoteOptionProps {
  option: VotingOption;
  voteCount: number;
  percentage: number;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  totalVotes: number;
}

export function VoteOption({
  option,
  voteCount,
  percentage,
  isSelected,
  onSelect,
  disabled = false,
  totalVotes
}: VoteOptionProps) {
  return (
    <div
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'border-purple-500 bg-purple-50 shadow-md' 
          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={disabled ? undefined : onSelect}
    >
      {/* 選項 ID 標籤 */}
      <div className="flex items-center justify-between mb-2">
        <span className={`
          inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
          ${isSelected ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'}
        `}>
          {option.id}
        </span>
        {totalVotes > 0 && (
          <span className="text-sm text-gray-500">
            {voteCount} 票 ({percentage.toFixed(1)}%)
          </span>
        )}
      </div>

      {/* 選項內容 - 簡化顯示 */}
      <div className="mb-2">
        <h4 className="font-medium text-gray-900">
          {option.content}
        </h4>
      </div>

      {/* 進度條 */}
      {totalVotes > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`
              h-2 rounded-full transition-all duration-300
              ${isSelected ? 'bg-purple-500' : 'bg-gray-400'}
            `}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {/* 選中狀態指示器 */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
