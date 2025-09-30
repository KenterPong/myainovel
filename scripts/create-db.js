const { Pool } = require('pg');

async function createDatabase() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:1234@localhost:5432/postgres'
  });

  try {
    await pool.query('CREATE DATABASE myainovel;');
    console.log('✅ 資料庫 myainovel 建立成功');
  } catch (error) {
    if (error.code === '42P04') {
      console.log('📝 資料庫 myainovel 已存在');
    } else {
      console.error('❌ 建立資料庫失敗:', error.message);
    }
  } finally {
    await pool.end();
  }
}

createDatabase();
