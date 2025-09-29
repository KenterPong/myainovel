import { useState, useCallback, useEffect } from 'react';

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  threshold?: number; // 滑動閾值，預設 50px
}

export const useSwipe = (options: SwipeOptions = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onTap,
    threshold = 50
  } = options;

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isClient) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, [isClient]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isClient) return;
    setTouchEnd(e.targetTouches[0].clientX);
  }, [isClient]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isClient || !touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe && onSwipeLeft) {
      e.preventDefault();
      e.stopPropagation();
      onSwipeLeft();
    } else if (isRightSwipe && onSwipeRight) {
      e.preventDefault();
      e.stopPropagation();
      onSwipeRight();
    } else if (onTap) {
      // 如果沒有滑動，觸發點擊動作
      e.preventDefault();
      e.stopPropagation();
      onTap();
    }
  }, [isClient, touchStart, touchEnd, threshold, onSwipeLeft, onSwipeRight, onTap]);

  return {
    touchStart: handleTouchStart,
    touchMove: handleTouchMove,
    touchEnd: handleTouchEnd
  };
};

// 頁面切換專用的滑動 hook
export const usePageSwipe = () => {
  const { touchStart, touchMove, touchEnd } = useSwipe({
    onSwipeLeft: () => {
      // 向左滑動，下一個頁面
      window.location.href = '/collection';
    },
    onSwipeRight: () => {
      // 向右滑動，上一個頁面
      window.location.href = '/';
    }
  });

  return { touchStart, touchMove, touchEnd };
};

// 步驟切換專用的滑動 hook
export const useStepSwipe = (
  currentStep: number,
  setCurrentStep: (step: number | ((prev: number) => number)) => void,
  maxSteps: number = 3
) => {
  const { touchStart, touchMove, touchEnd } = useSwipe({
    onSwipeLeft: () => {
      setCurrentStep(prev => Math.min(prev + 1, maxSteps));
    },
    onSwipeRight: () => {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    }
  });

  return { touchStart, touchMove, touchEnd };
};

// 選項卡片專用的滑動 hook
export const useCardSwipe = (
  onSelect: () => void,
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void
) => {
  const { touchStart, touchMove, touchEnd } = useSwipe({
    onSwipeLeft,
    onSwipeRight,
    onTap: onSelect
  });

  return { touchStart, touchMove, touchEnd };
};
