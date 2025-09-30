const http = require('http');

function testStoryGeneration() {
  console.log('🧪 測試故事生成功能...');
  
  const postData = JSON.stringify({
    genre: '武俠',
    background: '江湖',
    theme: '復仇'
  });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/stories/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(postData, 'utf8')
    }
  };
  
  const req = http.request(options, (res) => {
    console.log('📊 回應狀態:', res.statusCode);
    
    let data = '';
    res.setEncoding('utf8');
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('📝 回應內容:', JSON.stringify(result, null, 2));
        
        if (result.success) {
          console.log('✅ 故事生成成功！');
          console.log('📖 故事標題:', result.storyData.title);
          console.log('🎭 故事類型:', result.storyData.genre);
          console.log('🌍 世界觀:', result.storyData.worldview);
        } else {
          console.log('❌ 故事生成失敗:', result.error);
        }
      } catch (error) {
        console.error('❌ 解析回應失敗:', error.message);
        console.log('原始回應:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ 請求失敗:', error.message);
  });
  
  req.write(postData, 'utf8');
  req.end();
}

testStoryGeneration();
