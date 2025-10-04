#!/usr/bin/env node

console.log('parseInt("001"):', parseInt('001'));
console.log('parseInt("002"):', parseInt('002'));
console.log('parseInt("abc"):', parseInt('abc'));
console.log('parseInt(""):', parseInt(''));
console.log('parseInt(null):', parseInt(null));
console.log('parseInt(undefined):', parseInt(undefined));

// 測試章節號碼計算
const testChapterNumbers = ['001', '002', '003', 'abc', '', null, undefined];

testChapterNumbers.forEach(chapterNumber => {
  console.log(`\n測試 chapter_number: "${chapterNumber}"`);
  console.log('  type:', typeof chapterNumber);
  console.log('  parseInt result:', parseInt(chapterNumber));
  console.log('  parseInt + 1:', parseInt(chapterNumber) + 1);
  console.log('  String result:', String(parseInt(chapterNumber) + 1).padStart(3, '0'));
});
