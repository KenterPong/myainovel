'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Origin() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState({
    outer: '',
    middle: '',
    inner: ''
  });
  const [voteCounts, setVoteCounts] = useState<{
    outer: Record<string, number>;
    middle: Record<string, number>;
    inner: Record<string, number>;
  }>({
    outer: {},
    middle: {},
    inner: {}
  });
  const [selectedResults, setSelectedResults] = useState({
    outer: '',
    middle: '',
    inner: ''
  });
  const [showVoteSuccess, setShowVoteSuccess] = useState(false);
  const [animatingVotes, setAnimatingVotes] = useState<{[key: string]: boolean}>({});
  const [voteAnimation, setVoteAnimation] = useState<{[key: string]: number}>({});
  const [showValidationError, setShowValidationError] = useState(false);
  const [missingSelections, setMissingSelections] = useState<string[]>([]);
  const [expandedCards, setExpandedCards] = useState<{[key: string]: boolean}>({});
  const [showTopRanking, setShowTopRanking] = useState(false);
  const [showRankingContent, setShowRankingContent] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    outer: true,  // 預設展開第一個分類
    middle: false,
    inner: false
  });

  // 滑動處理函數
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      // 向左滑動，下一個頁面
      router.push('/collection');
    } else if (isRightSwipe) {
      // 向右滑動，上一個頁面
      router.push('/');
    }
  };

  // 三圈選項
  const options = {
    outer: [
      { id: 'fantasy', label: '奇幻', description: '魔法、龍族、勇者的經典奇幻世界' },
      { id: 'sci-fi', label: '科幻', description: '太空探索、高科技、外星文明' },
      { id: 'mystery', label: '懸疑', description: '謎團重重、需要智慧解開的秘密' },
      { id: 'history', label: '歷史', description: '以歷史背景為基礎的故事' },
      { id: 'urban', label: '都市', description: '現代都市生活的故事' },
      { id: 'apocalypse', label: '末日', description: '災難後重建的世界' }
    ],
    middle: [
      { id: 'campus', label: '校園', description: '學校生活、青春校園故事' },
      { id: 'workplace', label: '職場', description: '辦公室、職場競爭的故事' },
      { id: 'ancient', label: '古代', description: '古代背景、傳統文化故事' },
      { id: 'adventure', label: '冒險', description: '探索未知、冒險旅程' },
      { id: 'superpower', label: '超能力', description: '擁有特殊能力的故事' },
      { id: 'deduction', label: '推理', description: '邏輯推理、解謎破案' }
    ],
    inner: [
      { id: 'bg', label: 'B/G', description: '男女主角的愛情故事' },
      { id: 'bl', label: 'BL', description: '男性間的愛情故事' },
      { id: 'gl', label: 'GL', description: '女性間的愛情故事' },
      { id: 'family', label: '親情', description: '家庭親情、血緣關係' },
      { id: 'friendship', label: '友情', description: '朋友間的情誼故事' },
      { id: 'master-disciple', label: '師徒', description: '師徒傳承、學習成長' }
    ]
  };

  // 假資料 - 模擬投票結果
  const mockVoteData = {
    outer: {
      'fantasy': 99,
      'sci-fi': 78,
      'mystery': 99,
      'history': 65,
      'urban': 88,
      'apocalypse': 72
    },
    middle: {
      'campus': 89,
      'workplace': 76,
      'ancient': 98,
      'adventure': 105,
      'superpower': 82,
      'deduction': 91
    },
    inner: {
      'bg': 92,
      'bl': 85,
      'gl': 79,
      'family': 88,
      'friendship': 96,
      'master-disciple': 103
    }
  };

  const handleOptionSelect = (category: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [category]: optionId
    }));
    
    // 自動展開下一個未完成的分類
    if (category === 'outer' && !selectedOptions.middle) {
      setExpandedCategories(prev => ({
        ...prev,
        outer: false,
        middle: true
      }));
    } else if (category === 'middle' && !selectedOptions.inner) {
      setExpandedCategories(prev => ({
        ...prev,
        middle: false,
        inner: true
      }));
    } else if (category === 'inner') {
      // 第三個選擇完成後，自動滾動到投票按鈕
      setTimeout(() => {
        const voteButton = document.querySelector('[data-vote-button]');
        if (voteButton) {
          voteButton.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 300);
    }
  };

  // 獲取每個類別中票數最高的選項
  const getHighestVoteOption = (category: 'outer' | 'middle' | 'inner') => {
    const allVotes = getCurrentVoteData(category);
    let highestOption = '';
    let highestVotes = 0;
    
    Object.entries(allVotes).forEach(([optionId, votes]) => {
      if (votes > highestVotes) {
        highestVotes = votes;
        highestOption = optionId;
      }
    });
    
    return { optionId: highestOption, votes: highestVotes };
  };

  // 獲取Top 3排名
  const getTopRanking = (category: 'outer' | 'middle' | 'inner') => {
    const allVotes = getCurrentVoteData(category);
    const categoryOptions = category === 'outer' ? options.outer : 
                          category === 'middle' ? options.middle : options.inner;
    
    return Object.entries(allVotes)
      .map(([optionId, votes]) => {
        const option = categoryOptions.find(opt => opt.id === optionId);
        return {
          id: optionId,
          label: option?.label || '',
          votes
        };
      })
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 3);
  };

  const handleVote = () => {
    // 檢查是否有遺漏的選擇
    const missing = [];
    if (!selectedOptions.outer) missing.push('故事類型');
    if (!selectedOptions.middle) missing.push('故事背景');
    if (!selectedOptions.inner) missing.push('故事主題');
    
    if (missing.length > 0) {
      setMissingSelections(missing);
      setShowValidationError(true);
      setTimeout(() => setShowValidationError(false), 3000);
      return;
    }

    if (selectedOptions.outer && selectedOptions.middle && selectedOptions.inner) {
      // 模擬投票
      const newVoteCounts = {
        outer: { ...voteCounts.outer },
        middle: { ...voteCounts.middle },
        inner: { ...voteCounts.inner }
      };
      newVoteCounts.outer[selectedOptions.outer] = (newVoteCounts.outer[selectedOptions.outer] || 0) + 1;
      newVoteCounts.middle[selectedOptions.middle] = (newVoteCounts.middle[selectedOptions.middle] || 0) + 1;
      newVoteCounts.inner[selectedOptions.inner] = (newVoteCounts.inner[selectedOptions.inner] || 0) + 1;
      
      // 觸發動畫效果
      const voteKeys = [
        `outer-${selectedOptions.outer}`,
        `middle-${selectedOptions.middle}`,
        `inner-${selectedOptions.inner}`
      ];
      
      setAnimatingVotes(prev => {
        const newAnimating = { ...prev };
        voteKeys.forEach(key => {
          newAnimating[key] = true;
        });
        return newAnimating;
      });
      
      // 票數動畫效果
      voteKeys.forEach((key, index) => {
        setTimeout(() => {
          setVoteAnimation(prev => ({
            ...prev,
            [key]: prev[key] ? prev[key] + 1 : 1
          }));
        }, index * 200);
      });
      
      // 清除動畫狀態
      setTimeout(() => {
        setAnimatingVotes(prev => {
          const newAnimating = { ...prev };
          voteKeys.forEach(key => {
            newAnimating[key] = false;
          });
          return newAnimating;
        });
      }, 1000);
      
      setVoteCounts(newVoteCounts);
      
      // 清空選擇
      setSelectedOptions({ outer: '', middle: '', inner: '' });
      
      // 顯示投票完成提醒
      setShowVoteSuccess(true);
      setTimeout(() => setShowVoteSuccess(false), 3000);
      
      // 顯示排名內容取代投票按鈕
      setTimeout(() => {
        setShowRankingContent(true);
      }, 1000);
      
      // 計算包含用戶投票後的總票數
      const calculateTotalVotes = (category: 'outer' | 'middle' | 'inner') => {
        const mockData = mockVoteData[category];
        const actualVotes = newVoteCounts[category];
        
        const result: Record<string, number> = { ...mockData };
        Object.keys(actualVotes).forEach(key => {
          result[key] = (result[key] || 0) + actualVotes[key];
        });
        
        return result;
      };
      
      // 獲取三大類別中票數最高的選項（包含用戶投票）
      const outerVotes = calculateTotalVotes('outer');
      const middleVotes = calculateTotalVotes('middle');
      const innerVotes = calculateTotalVotes('inner');
      
      const outerHighest = Object.entries(outerVotes).reduce((a, b) => a[1] > b[1] ? a : b);
      const middleHighest = Object.entries(middleVotes).reduce((a, b) => a[1] > b[1] ? a : b);
      const innerHighest = Object.entries(innerVotes).reduce((a, b) => a[1] > b[1] ? a : b);
      
      console.log('三大類別最高票選項（包含用戶投票）:', {
        outer: { optionId: outerHighest[0], votes: outerHighest[1] },
        middle: { optionId: middleHighest[0], votes: middleHighest[1] },
        inner: { optionId: innerHighest[0], votes: innerHighest[1] }
      });
      
      // 檢查三大類別是否都有選項達到100票
      if (outerHighest[1] >= 100 && middleHighest[1] >= 100 && innerHighest[1] >= 100) {
        // 獲取最高票選項的標籤
        const selectedLabels = {
          outer: options.outer.find(opt => opt.id === outerHighest[0])?.label || '',
          middle: options.middle.find(opt => opt.id === middleHighest[0])?.label || '',
          inner: options.inner.find(opt => opt.id === innerHighest[0])?.label || ''
        };
        
        console.log('觸發AI提示詞生成，選中組合:', selectedLabels);
        setSelectedResults(selectedLabels);
        setCurrentStep(2);
      } else {
        console.log('三大類別未全部達到100票，繼續投票');
      }
    }
  };


  const generatePrompt = () => {
    return `請根據以下設定創作一個故事起源：

故事類型：${selectedResults.outer}
故事背景：${selectedResults.middle}
故事主題：${selectedResults.inner}

請創作一個引人入勝的故事開頭，包含：
1. 世界觀的建立
2. 主角的介紹
3. 如何結合這三個元素創造獨特的故事設定
4. 留下懸念讓讀者想要繼續閱讀

字數約300-500字，使用繁體中文。`;
  };

  // 獲取當前投票數據（結合假資料和實際投票）
  const getCurrentVoteData = (category: 'outer' | 'middle' | 'inner') => {
    const mockData = mockVoteData[category];
    const actualVotes = voteCounts[category];
    
    const result: Record<string, number> = { ...mockData };
    Object.keys(actualVotes).forEach(key => {
      result[key] = (result[key] || 0) + actualVotes[key];
    });
    
    return result;
  };

  // 進度條組件
  const ProgressBar = ({ current, target = 100, className = "", isLeading = false, category = "outer" }: { current: number; target?: number; className?: string; isLeading?: boolean; category?: string }) => {
    const percentage = Math.min((current / target) * 100, 100);
    const isComplete = current >= target;
    
    // 根據分類選擇顏色類別 - 符合網站色彩計畫
    const getProgressBarClass = (cat: string) => {
      if (isComplete || isLeading) {
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      }
      switch (cat) {
        case 'outer': return 'progress-bar-primary';  // 薰衣草紫系
        case 'middle': return 'progress-bar-secondary';  // 珊瑚粉系
        case 'inner': return 'progress-bar-accent';  // 嫩綠系
        default: return 'bg-gradient-to-r from-primary-400 to-primary-600';
      }
    };
    
    return (
      <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
        <div 
          className={`h-2 rounded-full transition-all duration-500 ease-out ${getProgressBarClass(category)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  // 選項卡片組件
  const OptionCard = ({ 
    option, 
    category, 
    votes, 
    isSelected, 
    isLeading, 
    onSelect 
  }: {
    option: { id: string; label: string; description: string };
    category: string;
    votes: number;
    isSelected: boolean;
    isLeading: boolean;
    onSelect: () => void;
  }) => {
    const voteKey = `${category}-${option.id}`;
    const isAnimating = animatingVotes[voteKey];
    const progress = Math.min((votes / 100) * 100, 100);
    
    const getCategoryColor = (cat: string) => {
      switch (cat) {
        case 'outer': return 'primary';
        case 'middle': return 'secondary';
        case 'inner': return 'accent';
        default: return 'primary';
      }
    };
    
    const getCategoryChipClass = (cat: string) => {
      switch (cat) {
        case 'outer': return 'category-chip primary';  // 薰衣草紫系
        case 'middle': return 'category-chip secondary';  // 珊瑚粉系
        case 'inner': return 'category-chip accent';  // 嫩綠系
        default: return 'category-chip';
      }
    };
    
    const color = getCategoryColor(category);
    
    const getCardClassName = () => {
      let baseClass = 'relative p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform';
      
      if (isSelected) {
        switch (category) {
          case 'outer': return `${baseClass} border-primary-500 bg-primary-50 shadow-lg scale-105`;
          case 'middle': return `${baseClass} border-secondary-500 bg-secondary-50 shadow-lg scale-105`;
          case 'inner': return `${baseClass} border-accent-500 bg-accent-50 shadow-lg scale-105`;
          default: return `${baseClass} border-primary-500 bg-primary-50 shadow-lg scale-105`;
        }
      } else if (isLeading) {
        return `${baseClass} border-yellow-500 bg-yellow-50 shadow-md`;
      } else {
        switch (category) {
          case 'outer': return `${baseClass} border-gray-300 hover:border-primary-300 hover:bg-primary-50 hover:shadow-md hover:scale-102`;
          case 'middle': return `${baseClass} border-gray-300 hover:border-secondary-300 hover:bg-secondary-50 hover:shadow-md hover:scale-102`;
          case 'inner': return `${baseClass} border-gray-300 hover:border-accent-300 hover:bg-accent-50 hover:shadow-md hover:scale-102`;
          default: return `${baseClass} border-gray-300 hover:border-primary-300 hover:bg-primary-50 hover:shadow-md hover:scale-102`;
        }
      }
    };

    const getCheckboxClassName = () => {
      if (isSelected) {
        switch (category) {
          case 'outer': return 'w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center mr-2 md:mr-3 border-primary-500 bg-primary-500';
          case 'middle': return 'w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center mr-2 md:mr-3 border-secondary-500 bg-secondary-500';
          case 'inner': return 'w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center mr-2 md:mr-3 border-accent-500 bg-accent-500';
          default: return 'w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center mr-2 md:mr-3 border-primary-500 bg-primary-500';
        }
      }
      return 'w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center mr-2 md:mr-3 border-gray-300';
    };

    const getTextClassName = () => {
      if (isSelected) {
        switch (category) {
          case 'outer': return 'font-semibold text-base md:text-lg text-primary-800';
          case 'middle': return 'font-semibold text-base md:text-lg text-secondary-800';
          case 'inner': return 'font-semibold text-base md:text-lg text-accent-800';
          default: return 'font-semibold text-base md:text-lg text-primary-800';
        }
      } else if (isLeading) {
        return 'font-semibold text-base md:text-lg text-yellow-800';
      }
      return 'font-semibold text-base md:text-lg text-gray-900';
    };

    return (
      <div
        className={`${getCardClassName()} ${isAnimating ? 'animate-pulse' : ''}`}
        onClick={onSelect}
      >
        {/* 分類標籤 */}
        <div className={getCategoryChipClass(category)}>
          {category === 'outer' ? '故事類型' : category === 'middle' ? '故事背景' : '故事主題'}
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className={getCheckboxClassName()}>
              {isSelected && (
                <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className={getTextClassName()}>{option.label}</span>
          </div>
          <div className="text-right">
            <div className={`text-base md:text-lg font-bold ${isLeading ? 'text-yellow-600' : 'text-gray-600'}`}>
              {votes} 票
            </div>
            {isLeading && (
              <div className="text-xs text-yellow-600 font-medium">
                🏆 已達成
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between items-center text-xs md:text-sm text-gray-600 mb-1">
            <span>進度</span>
            <div className="flex items-center space-x-2">
              <span>{Math.round(progress)}%</span>
              {!isLeading && votes < 100 && (
                <span className="text-xs text-gray-500">
                  還差 {100 - votes} 票
                </span>
              )}
            </div>
          </div>
          <ProgressBar 
            current={votes} 
            target={100} 
            className="h-2"
            isLeading={isLeading}
            category={category}
          />
        </div>
        
        <div className="space-y-1">
          <p className={`text-xs md:text-sm ${
            isSelected 
              ? `text-${color}-700` 
              : isLeading 
              ? 'text-yellow-700' 
              : 'text-gray-600'
          }`}>
            {/* 行動版顯示縮短描述，桌機版顯示完整描述 */}
            <span className="block md:hidden">
              {option.description.length > 15 
                ? option.description.substring(0, 15) + '...' 
                : option.description
              }
            </span>
            <span className="hidden md:block">
              {option.description}
            </span>
          </p>
          
          {/* 行動版「更多資訊」按鈕 */}
          {option.description.length > 15 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const cardKey = `${category}-${option.id}`;
                setExpandedCards(prev => ({
                  ...prev,
                  [cardKey]: !prev[cardKey]
                }));
              }}
              className="md:hidden text-xs text-primary-600 hover:text-primary-800 underline"
            >
              {expandedCards[`${category}-${option.id}`] ? '收起' : '更多資訊'}
            </button>
          )}
          
          {/* 展開的完整描述 */}
          {expandedCards[`${category}-${option.id}`] && option.description.length > 15 && (
            <p className={`text-xs md:text-sm md:hidden ${
              isSelected 
                ? `text-${color}-700` 
                : isLeading 
                ? 'text-yellow-700' 
                : 'text-gray-600'
            }`}>
              {option.description}
            </p>
          )}
        </div>
        
        {isAnimating && (
          <div className="absolute inset-0 bg-primary-100 bg-opacity-50 rounded-xl flex items-center justify-center">
            <div className="text-primary-600 font-bold text-lg animate-bounce">
              +1 票
            </div>
          </div>
        )}
      </div>
    );
  };

    return (
      <div 
        className="space-y-6"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">為您喜歡的故事元素投票</h1>
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            選擇故事元素，AI將為您創作獨特故事
          </p>
        </div>

        {/* 驗證錯誤提示 */}
        {showValidationError && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-lg shadow-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">
                  請完成以下選擇：{missingSelections.join('、')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 投票成功提醒 */}
        {showVoteSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">投票完成！</h3>
              <p className="text-gray-600 mb-4">感謝您的參與，系統正在統計結果...</p>
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
                
                <div className="text-sm text-gray-600 space-y-2">
                  <p>📅 3 天後公布結果，屆時會通知你</p>
                  <p>🔗 你也可以分享連結邀請朋友一起投票</p>
                </div>
                
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('連結已複製到剪貼簿！');
                    }}
                    className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm"
                  >
                    📋 複製連結
                  </button>
                  <button
                    onClick={() => {
                      // 這裡可以添加分享到社群的邏輯
                      alert('分享功能開發中...');
                    }}
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                  >
                    📱 分享到社群
                  </button>
                </div>
                
                <p className="text-xs text-gray-500">
                  你的選擇可能影響小說的誕生！
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 步驟1：投票選擇 */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-md p-6">
          
          <div className="space-y-6">
            {/* 故事類型選項 */}
            <div className={`category-section ${expandedCategories.outer ? 'expanded' : 'collapsed'}`} style={{ backgroundColor: 'var(--category-primary-50)' }}>
              <div 
                className="category-header"
                onClick={() => setExpandedCategories(prev => ({ ...prev, outer: !prev.outer }))}
              >
                <div className="flex items-center">
                  <div className="category-title-card primary">
                    🧙 故事類型
                  </div>
                  <div className="category-status">
                    {selectedOptions.outer ? (
                      <span className="completed">
                        ✅ 已完成
                      </span>
                    ) : (
                      <span className="pending">
                        ⏳ 待選擇
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-gray-500">
                  <svg 
                    className={`w-6 h-6 chevron ${expandedCategories.outer ? 'rotated' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {expandedCategories.outer && (
                <div className="category-content space-y-3">
                  {options.outer.map((option) => {
                    const voteData = getCurrentVoteData('outer');
                    const votes = voteData[option.id as keyof typeof voteData] || 0;
                    const isLeading = votes >= 100;
                    
                    return (
                      <OptionCard
                        key={option.id}
                        option={option}
                        category="outer"
                        votes={votes}
                        isSelected={selectedOptions.outer === option.id}
                        isLeading={isLeading}
                        onSelect={() => handleOptionSelect('outer', option.id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* 故事背景選項 */}
            <div className={`category-section ${expandedCategories.middle ? 'expanded' : 'collapsed'}`} style={{ backgroundColor: 'var(--category-secondary-50)' }}>
              <div 
                className="category-header"
                onClick={() => setExpandedCategories(prev => ({ ...prev, middle: !prev.middle }))}
              >
                <div className="flex items-center">
                  <div className="category-title-card secondary">
                    🏞 故事背景
                  </div>
                  <div className="category-status">
                    {selectedOptions.middle ? (
                      <span className="completed">
                        ✅ 已完成
                      </span>
                    ) : (
                      <span className="pending">
                        ⏳ 待選擇
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-gray-500">
                  <svg 
                    className={`w-6 h-6 chevron ${expandedCategories.middle ? 'rotated' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {expandedCategories.middle && (
                <div className="category-content space-y-3">
                  {options.middle.map((option) => {
                    const voteData = getCurrentVoteData('middle');
                    const votes = voteData[option.id as keyof typeof voteData] || 0;
                    const isLeading = votes >= 100;
                    
                    return (
                      <OptionCard
                        key={option.id}
                        option={option}
                        category="middle"
                        votes={votes}
                        isSelected={selectedOptions.middle === option.id}
                        isLeading={isLeading}
                        onSelect={() => handleOptionSelect('middle', option.id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* 故事主題選項 */}
            <div className={`category-section ${expandedCategories.inner ? 'expanded' : 'collapsed'}`} style={{ backgroundColor: 'var(--category-accent-50)' }}>
              <div 
                className="category-header"
                onClick={() => setExpandedCategories(prev => ({ ...prev, inner: !prev.inner }))}
              >
                <div className="flex items-center">
                  <div className="category-title-card accent">
                    💞 故事主題
                  </div>
                  <div className="category-status">
                    {selectedOptions.inner ? (
                      <span className="completed">
                        ✅ 已完成
                      </span>
                    ) : (
                      <span className="pending">
                        ⏳ 待選擇
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-gray-500">
                  <svg 
                    className={`w-6 h-6 chevron ${expandedCategories.inner ? 'rotated' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {expandedCategories.inner && (
                <div className="category-content space-y-3">
                  {options.inner.map((option) => {
                    const voteData = getCurrentVoteData('inner');
                    const votes = voteData[option.id as keyof typeof voteData] || 0;
                    const isLeading = votes >= 100;
                    
                    return (
                      <OptionCard
                        key={option.id}
                        option={option}
                        category="inner"
                        votes={votes}
                        isSelected={selectedOptions.inner === option.id}
                        isLeading={isLeading}
                        onSelect={() => handleOptionSelect('inner', option.id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 投票按鈕或排名顯示 */}
          <div className="text-center mt-12" data-vote-button>
            {!showRankingContent ? (
              // 投票按鈕
              <>
                <button
                  onClick={handleVote}
                  disabled={!selectedOptions.outer || !selectedOptions.middle || !selectedOptions.inner}
                  className={`px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                    selectedOptions.outer && selectedOptions.middle && selectedOptions.inner
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 hover:scale-105 hover:shadow-2xl shadow-xl ring-4 ring-primary-200 hover:ring-primary-300'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    投下一票
                  </span>
                </button>
                {selectedOptions.outer && selectedOptions.middle && selectedOptions.inner && (
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-gray-600 animate-pulse">
                      ✨ 準備好為您的選擇投票了嗎？
                    </p>
                    <p className="text-xs text-gray-500">
                      ⏰ 剩下 3 天結束投票
                    </p>
                  </div>
                )}
              </>
            ) : (
              // Top 3排名顯示
              <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-4xl mx-auto animate-slide-up">
                <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">🏆 目前 Top 3 排名</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['outer', 'middle', 'inner'] as const).map((category, categoryIndex) => {
                    const categoryName = category === 'outer' ? '故事類型' : 
                                       category === 'middle' ? '故事背景' : '故事主題';
                    const top3 = getTopRanking(category);
                    
                    return (
                      <div key={category} className="space-y-2">
                        <h4 className="font-semibold text-gray-800 text-center">{categoryName}</h4>
                        <div className="space-y-1">
                          {top3.map((item, index) => (
                            <div key={item.id} className={`flex justify-between items-center p-2 rounded-lg ${
                              index === 0 ? 'bg-yellow-100' : 
                              index === 1 ? 'bg-gray-100' : 
                              'bg-orange-100'
                            }`}>
                              <div className="flex items-center">
                                <span className="text-lg mr-2">
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                </span>
                                <span className="text-sm font-medium">{item.label}</span>
                              </div>
                              <span className="text-sm text-gray-600">{item.votes} 票</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">
                  排名會持續更新，感謝您的參與！
                </p>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => {
                      setShowRankingContent(false);
                      setSelectedOptions({ outer: '', middle: '', inner: '' });
                      setExpandedCategories({ outer: true, middle: false, inner: false });
                    }}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                  >
                    重新投票
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 步驟2：AI故事生成提示詞 */}
      {currentStep === 2 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">AI故事生成提示詞</h2>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">生成的故事提示詞：</h3>
            <div className="bg-white border rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                {generatePrompt()}
              </pre>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatePrompt());
                alert('提示詞已複製到剪貼簿！');
              }}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              複製提示詞
            </button>
            <button
              onClick={() => {
                setCurrentStep(1);
                setSelectedOptions({ outer: '', middle: '', inner: '' });
                setSelectedResults({ outer: '', middle: '', inner: '' });
                setVoteCounts({ outer: {}, middle: {}, inner: {} });
                setShowRankingContent(false);
                setExpandedCategories({ outer: true, middle: false, inner: false });
              }}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              重新開始
              </button>
          </div>
        </div>
      )}
      </div>
    );
  }
  