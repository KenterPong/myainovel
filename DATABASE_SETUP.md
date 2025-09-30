# PostgreSQL 資料庫設定指南

本專案使用 PostgreSQL 作為主要資料庫，支援 AI 故事生成的「故事聖經」和「長篇連貫性」功能。

## 🚀 快速開始

### 1. 安裝 PostgreSQL

#### Windows
```bash
# 使用 Chocolatey
choco install postgresql

# 或下載官方安裝程式
# https://www.postgresql.org/download/windows/
```

#### macOS
```bash
# 使用 Homebrew
brew install postgresql
brew services start postgresql
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. 建立資料庫

```bash
# 連接到 PostgreSQL
psql -U postgres

# 建立資料庫
CREATE DATABASE myainovel;

# 建立使用者（可選）
CREATE USER myainovel_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE myainovel TO myainovel_user;

# 退出
\q
```

### 3. 設定環境變數

複製環境變數範例檔案：
```bash
cp env.example .env.local
```

編輯 `.env.local` 檔案：
```env
DATABASE_URL=postgresql://myainovel_user:your_password@localhost:5432/myainovel
POSTGRES_USER=myainovel_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=myainovel
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

### 4. 安裝依賴

```bash
npm install
```

### 5. 初始化資料庫

```bash
# 測試資料庫連線
npm run db:test

# 初始化資料庫（建立資料表）
npm run db:init

# 建立範例資料
npm run db:sample

# 檢查資料庫狀態
npm run db:status
```

## 📊 資料庫結構

### 核心資料表

#### 1. `stories` (故事主表)
- `story_id` (UUID) - 主鍵
- `story_serial` (VARCHAR) - 流水序號 (A00001, A00002...)
- `title` (VARCHAR) - 故事名稱
- `status` (VARCHAR) - 故事狀態 (投票中/撰寫中/已完結)
- `voting_result` (JSONB) - 投票結果
- `current_chapter_id` (INT) - 最新章節 ID
- 時間戳記欄位

#### 2. `chapters` (章節表)
- `chapter_id` (SERIAL) - 主鍵
- `story_id` (UUID) - 外鍵指向 stories
- `chapter_number` (VARCHAR) - 章節編號 (001, 002...)
- `title` (VARCHAR) - 章節標題
- `full_text` (TEXT) - 完整章節內容
- `summary` (TEXT) - 前情提要
- `tags` (JSONB) - 自動生成標籤
- `voting_options` (JSONB) - 投票選項
- `voting_deadline` (TIMESTAMP) - 投票截止時間
- `voting_status` (VARCHAR) - 投票狀態
- `user_choice` (VARCHAR) - 讀者選擇的選項

#### 3. `story_settings` (故事設定檔表)
- `setting_id` (SERIAL) - 主鍵
- `story_id` (UUID) - 外鍵指向 stories
- `setting_type` (VARCHAR) - 設定類型 (角色/世界觀/大綱)
- `setting_data` (JSONB) - 核心設定資料
- `last_updated_at` (TIMESTAMP) - 最後更新時間

### 資料表關聯

```
stories (1) ←→ (N) chapters
    ↓
    (1) ←→ (N) story_settings
```

## 🔧 管理指令

### 資料庫操作

```bash
# 測試連線
npm run db:test

# 初始化資料庫
npm run db:init

# 建立範例資料
npm run db:sample

# 檢查狀態
npm run db:status

# 重置資料庫（刪除所有資料）
npm run db:reset
```

### 手動 SQL 操作

```bash
# 連接到資料庫
psql -U myainovel_user -d myainovel

# 查看所有資料表
\dt

# 查看資料表結構
\d stories
\d chapters
\d story_settings

# 查看資料
SELECT * FROM stories;
SELECT * FROM chapters;
SELECT * FROM story_settings;
```

## 🌐 API 端點

### 故事管理
- `GET /api/stories` - 取得故事列表
- `POST /api/stories` - 建立新故事
- `GET /api/stories/[id]` - 取得故事詳情
- `PUT /api/stories/[id]` - 更新故事
- `DELETE /api/stories/[id]` - 刪除故事

### 章節管理
- `GET /api/stories/[id]/chapters` - 取得章節列表
- `POST /api/stories/[id]/chapters` - 建立新章節

### 投票系統
- `GET /api/stories/[id]/chapters/[chapterId]/vote` - 取得投票狀態
- `POST /api/stories/[id]/chapters/[chapterId]/vote` - 投票

### 資料庫管理
- `GET /api/db/init` - 檢查資料庫狀態
- `POST /api/db/init` - 初始化資料庫

## 🎯 特色功能

### 1. JSONB 支援
- 靈活儲存複雜的 AI 生成資料
- 支援 JSON 查詢和索引
- 高效能資料處理

### 2. 自動觸發器
- 自動更新 `stories.current_chapter_id`
- 自動更新 `story_settings.last_updated_at`

### 3. 外鍵約束
- 確保資料完整性
- 自動級聯刪除

### 4. 索引優化
- 針對常用查詢建立索引
- 提升查詢效能

## 🔍 故障排除

### 連線問題

1. **檢查 PostgreSQL 服務**
   ```bash
   # Windows
   net start postgresql-x64-14
   
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```

2. **檢查連線設定**
   ```bash
   # 測試連線
   psql -U myainovel_user -d myainovel -h localhost -p 5432
   ```

3. **檢查防火牆設定**
   - 確保 5432 埠口開放
   - 檢查 pg_hba.conf 設定

### 權限問題

```sql
-- 授予所有權限
GRANT ALL PRIVILEGES ON DATABASE myainovel TO myainovel_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO myainovel_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO myainovel_user;
```

### 資料庫不存在

```sql
-- 建立資料庫
CREATE DATABASE myainovel;
```

## 📈 效能優化

### 1. 連線池設定
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // 最大連線數
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 2. 查詢優化
- 使用適當的索引
- 避免 N+1 查詢問題
- 使用 EXPLAIN 分析查詢效能

### 3. 快取策略
- 使用 Redis 快取熱門資料
- 實作查詢結果快取

## 🔒 安全性

### 1. 環境變數保護
- 不要將 `.env.local` 提交到版本控制
- 使用強密碼
- 定期更換密碼

### 2. 資料庫安全
- 限制資料庫使用者權限
- 使用 SSL 連線（生產環境）
- 定期備份資料

### 3. SQL 注入防護
- 使用參數化查詢
- 驗證輸入資料
- 使用 ORM 或查詢建構器

## 📚 相關資源

- [PostgreSQL 官方文件](https://www.postgresql.org/docs/)
- [pg Node.js 驅動程式](https://node-postgres.com/)
- [JSONB 查詢指南](https://www.postgresql.org/docs/current/datatype-json.html)
- [Next.js API 路由](https://nextjs.org/docs/api-routes/introduction)
