import React from 'react';
import { PopularStory } from '@/types/story';

interface PopularStoryCardProps {
  story: PopularStory;
  onViewStory?: (storyId: string) => void;
}

export default function PopularStoryCard({ story, onViewStory }: PopularStoryCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case '投票中':
        return (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-yellow-600 text-sm font-medium">投票中</span>
          </div>
        );
      case '撰寫中':
        return (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-blue-600 text-sm font-medium">撰寫中</span>
          </div>
        );
      case '已完結':
        return (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-600 text-sm font-medium">已完結</span>
          </div>
        );
      default:
        return null;
    }
  };

  const handleClick = () => {
    if (onViewStory) {
      onViewStory(story.story_id);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
          {story.title}
        </h3>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          {getStatusIcon(story.status)}
          <span className="text-gray-500">
            {story.total_chapters} 章
          </span>
        </div>
        
        <div className="text-xs text-gray-400">
          {new Date(story.created_at).toLocaleDateString('zh-TW')}
        </div>
      </div>
    </div>
  );
}
