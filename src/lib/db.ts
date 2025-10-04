import { Pool } from 'pg';

// 資料庫連線設定
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'myainovel',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  password: process.env.POSTGRES_PASSWORD || '1234',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // 明確設定編碼為 UTF-8
  client_encoding: 'utf8',
});

// 測試資料庫連線
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ 資料庫連線成功');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ 資料庫連線失敗:', error);
    return false;
  }
}

// 執行 SQL 查詢
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// 執行事務
export async function transaction(callback: (client: any) => Promise<any>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
