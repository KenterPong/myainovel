'use client';

import { useState } from 'react';

export default function Origin() {
  const [currentStep, setCurrentStep] = useState(1);
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

  const handleVote = () => {
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
      
      setVoteCounts(newVoteCounts);
      
      // 清空選擇
      setSelectedOptions({ outer: '', middle: '', inner: '' });
      
      // 顯示投票完成提醒
      setShowVoteSuccess(true);
      setTimeout(() => setShowVoteSuccess(false), 3000);
      
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

    return (
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">故事起源</h1>
        <p className="text-gray-600">選擇您的偏好，讓AI為您創作獨特的故事起源</p>
      </div>

      {/* 步驟指示器 */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 2 && (
                <div className={`w-8 h-0.5 ${
                  currentStep > step ? 'bg-purple-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        </div>

      {/* 投票成功提醒 */}
      {showVoteSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">投票完成！</h3>
            <p className="text-gray-600">感謝您的參與，系統正在統計結果...</p>
          </div>
        </div>
      )}

      {/* 步驟1：投票選擇 */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">為您喜歡的故事元素投票</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 text-center">
              💡 <strong>提示：</strong>系統會自動統計三大類別的最高票選項，當所有類別都有選項達到100票時，將自動生成AI故事！
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 故事類型選項 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                故事類型
              </h3>
              <div className="space-y-2">
                {options.outer.map((option) => {
                  const voteData = getCurrentVoteData('outer');
                  const votes = voteData[option.id as keyof typeof voteData] || 0;
                  const isLeading = votes >= 100;
                  
                  return (
                    <div
                      key={option.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedOptions.outer === option.id
                          ? 'border-red-500 bg-red-50'
                          : isLeading
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-red-300'
                      }`}
                      onClick={() => handleOptionSelect('outer', option.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="outer"
                            checked={selectedOptions.outer === option.id}
                            onChange={() => handleOptionSelect('outer', option.id)}
                            className="mr-3"
                          />
                          <span className="font-medium text-gray-900">{option.label}</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold ${isLeading ? 'text-green-600' : 'text-gray-600'}`}>
                            {votes} 票
                          </div>
                          {isLeading && (
                            <div className="text-xs text-green-600">
                              ✓ 已達標
                              <br />
                              💡 領先選項
                            </div>
                          )}
                        </div>
                  </div>
                </div>
                  );
                })}
              </div>
            </div>

            {/* 故事背景選項 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                故事背景
              </h3>
              <div className="space-y-2">
                {options.middle.map((option) => {
                  const voteData = getCurrentVoteData('middle');
                  const votes = voteData[option.id as keyof typeof voteData] || 0;
                  const isLeading = votes >= 100;
                  
                  return (
                    <div
                      key={option.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedOptions.middle === option.id
                          ? 'border-green-500 bg-green-50'
                          : isLeading
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-green-300'
                      }`}
                      onClick={() => handleOptionSelect('middle', option.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="middle"
                            checked={selectedOptions.middle === option.id}
                            onChange={() => handleOptionSelect('middle', option.id)}
                            className="mr-3"
                          />
                          <span className="font-medium text-gray-900">{option.label}</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold ${isLeading ? 'text-green-600' : 'text-gray-600'}`}>
                            {votes} 票
                          </div>
                          {isLeading && (
                            <div className="text-xs text-green-600">
                              ✓ 已達標
                              <br />
                              💡 領先選項
                            </div>
                          )}
                        </div>
                  </div>
                </div>
                  );
                })}
              </div>
            </div>

            {/* 故事主題選項 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                故事主題
              </h3>
              <div className="space-y-2">
                {options.inner.map((option) => {
                  const voteData = getCurrentVoteData('inner');
                  const votes = voteData[option.id as keyof typeof voteData] || 0;
                  const isLeading = votes >= 100;
                  
                  return (
                    <div
                      key={option.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedOptions.inner === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : isLeading
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                      onClick={() => handleOptionSelect('inner', option.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="inner"
                            checked={selectedOptions.inner === option.id}
                            onChange={() => handleOptionSelect('inner', option.id)}
                            className="mr-3"
                          />
                          <span className="font-medium text-gray-900">{option.label}</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold ${isLeading ? 'text-green-600' : 'text-gray-600'}`}>
                            {votes} 票
                          </div>
                          {isLeading && (
                            <div className="text-xs text-green-600">
                              ✓ 已達標
                              <br />
                              💡 領先選項
                            </div>
                          )}
                        </div>
                  </div>
                </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 投票按鈕 */}
          <div className="text-center mt-8">
            <button
              onClick={handleVote}
              disabled={!selectedOptions.outer || !selectedOptions.middle || !selectedOptions.inner}
              className={`px-8 py-3 rounded-lg font-medium transition-all ${
                selectedOptions.outer && selectedOptions.middle && selectedOptions.inner
                  ? 'bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              投下一票
            </button>
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
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              複製提示詞
            </button>
            <button
              onClick={() => {
                setCurrentStep(1);
                setSelectedOptions({ outer: '', middle: '', inner: '' });
                setSelectedResults({ outer: '', middle: '', inner: '' });
                setVoteCounts({ outer: {}, middle: {}, inner: {} });
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
  