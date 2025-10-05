import { useState, useEffect } from 'react';
import { PopularStory, ApiResponse } from '@/types/story';

export function usePopularStories() {
  const [popularStories, setPopularStories] = useState<PopularStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularStories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/stories/popular');
      const data: ApiResponse<PopularStory[]> = await response.json();

      if (data.success && data.data) {
        setPopularStories(data.data);
      } else {
        setError(data.error || '獲取熱門故事失敗');
      }
    } catch (err) {
      console.error('獲取熱門故事錯誤:', err);
      setError('網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchPopularStories();
  };

  useEffect(() => {
    fetchPopularStories();
  }, []);

  return {
    popularStories,
    loading,
    error,
    refetch
  };
}
