// 測試投票邏輯
console.log('🧪 測試投票邏輯...\n');

// 模擬數據
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

// 模擬用戶投票
const userVotes = {
  outer: { 'fantasy': 1 },  // fantasy 從 99 變成 100
  middle: { 'adventure': 1 }, // adventure 從 105 變成 106
  inner: { 'master-disciple': 1 } // master-disciple 從 103 變成 104
};

// 計算總票數的函數
function calculateTotalVotes(category) {
  const mockData = mockVoteData[category];
  const actualVotes = userVotes[category];
  
  const result = { ...mockData };
  Object.keys(actualVotes).forEach(key => {
    result[key] = (result[key] || 0) + actualVotes[key];
  });
  
  return result;
}

// 測試計算
console.log('📊 計算結果：');
const outerVotes = calculateTotalVotes('outer');
const middleVotes = calculateTotalVotes('middle');
const innerVotes = calculateTotalVotes('inner');

console.log('故事類型:', outerVotes);
console.log('故事背景:', middleVotes);
console.log('故事主題:', innerVotes);

// 找出最高票選項
const outerHighest = Object.entries(outerVotes).reduce((a, b) => a[1] > b[1] ? a : b);
const middleHighest = Object.entries(middleVotes).reduce((a, b) => a[1] > b[1] ? a : b);
const innerHighest = Object.entries(innerVotes).reduce((a, b) => a[1] > b[1] ? a : b);

console.log('\n🏆 最高票選項：');
console.log('故事類型:', outerHighest[0], '=', outerHighest[1], '票');
console.log('故事背景:', middleHighest[0], '=', middleHighest[1], '票');
console.log('故事主題:', innerHighest[0], '=', innerHighest[1], '票');

// 檢查是否都達到 100 票
const allReach100 = outerHighest[1] >= 100 && middleHighest[1] >= 100 && innerHighest[1] >= 100;
console.log('\n✅ 是否都達到 100 票:', allReach100);

if (allReach100) {
  console.log('🎉 應該觸發 AI 故事生成！');
} else {
  console.log('⏳ 還未達到門檻，繼續投票');
}
