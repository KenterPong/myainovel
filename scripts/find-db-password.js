const { Pool } = require('pg');

const passwords = [
  '', 'postgres', '123456', 'password', 'admin', 'root', 
  '1234', '12345', '123456789', 'qwerty', 'abc123'
];

async function testPassword(password) {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'myainovel',
    port: 5432,
    password: password,
    ssl: false
  });

  try {
    const client = await pool.connect();
    console.log(`✅ 密碼正確: "${password}"`);
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.log(`❌ 密碼錯誤: "${password}"`);
    await pool.end();
    return false;
  }
}

async function findCorrectPassword() {
  console.log('🔍 嘗試找到正確的資料庫密碼...');
  
  for (const password of passwords) {
    const success = await testPassword(password);
    if (success) {
      console.log(`🎉 找到正確密碼: "${password}"`);
      return password;
    }
  }
  
  console.log('❌ 沒有找到正確的密碼');
  return null;
}

findCorrectPassword();
