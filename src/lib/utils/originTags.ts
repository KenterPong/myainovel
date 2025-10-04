/**
 * 故事起源標籤映射工具
 */

// 故事起源選項映射
export const originTagMapping = {
  outer: {
    'fantasy': '奇幻',
    'sci-fi': '科幻',
    'mystery': '懸疑',
    'history': '歷史',
    'urban': '都市',
    'apocalypse': '末日'
  },
  middle: {
    'campus': '校園',
    'workplace': '職場',
    'ancient': '古代',
    'adventure': '冒險',
    'superpower': '超能力',
    'deduction': '推理'
  },
  inner: {
    'bg': 'B/G',
    'bb': 'B/B',
    'gg': 'G/G',
    'other': '其他'
  }
};

/**
 * 從故事起源投票資料中提取標籤
 */
export function getOriginTags(originVoting: any): string[] {
  if (!originVoting || !originVoting.voteCounts) {
    return [];
  }

  const tags: string[] = [];
  const { voteCounts } = originVoting;

  // 獲取得票最高的選項
  const getTopOption = (category: any) => {
    if (!category || typeof category !== 'object') return null;
    return Object.entries(category).reduce((max, [key, votes]) => {
      return (votes as number) > (max.votes as number) ? { key, votes } : max;
    }, { key: null, votes: 0 });
  };

  // 外圈標籤
  const outerTop = getTopOption(voteCounts.outer);
  if (outerTop && outerTop.key && originTagMapping.outer[outerTop.key as keyof typeof originTagMapping.outer]) {
    tags.push(originTagMapping.outer[outerTop.key as keyof typeof originTagMapping.outer]);
  }

  // 中圈標籤
  const middleTop = getTopOption(voteCounts.middle);
  if (middleTop && middleTop.key && originTagMapping.middle[middleTop.key as keyof typeof originTagMapping.middle]) {
    tags.push(originTagMapping.middle[middleTop.key as keyof typeof originTagMapping.middle]);
  }

  // 內圈標籤
  const innerTop = getTopOption(voteCounts.inner);
  if (innerTop && innerTop.key && originTagMapping.inner[innerTop.key as keyof typeof originTagMapping.inner]) {
    tags.push(originTagMapping.inner[innerTop.key as keyof typeof originTagMapping.inner]);
  }

  return tags;
}
