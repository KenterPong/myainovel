# 資料庫設定指南

## 🔧 解決 pg 模組錯誤

您遇到的錯誤是因為 `pg` 模組沒有正確安裝。請按照以下步驟操作：

### 1. 安裝依賴套件
```bash
npm install
```

### 2. 建立環境變數檔案

在專案根目錄建立 `.env.local` 檔案，內容如下：

```env
# 資料庫連線設定
DATABASE_URL=postgresql://postgres:您的密碼@localhost:5432/myainovel
POSTGRES_USER=postgres
POSTGRES_PASSWORD=您的密碼
POSTGRES_DB=myainovel
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# 網站設定
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# AI 服務設定（未來使用）
OPENAI_API_KEY=your-openai-api-key
```

**重要：** 請將 `您的密碼` 替換為您 PostgreSQL 的實際密碼。

### 3. 啟動 PostgreSQL 服務

#### 方法一：使用 Windows 服務
1. 按 `Win + R`，輸入 `services.msc`
2. 找到 `postgresql` 服務
3. 右鍵選擇「啟動」

#### 方法二：使用命令列
```bash
# 找到 PostgreSQL 安裝路徑
where psql

# 啟動服務（替換為實際路徑）
pg_ctl start -D "C:\Program Files\PostgreSQL\17\data"
```

### 4. 建立資料庫

```bash
# 連接到 PostgreSQL
psql -U postgres

# 建立資料庫
CREATE DATABASE myainovel;

# 退出
\q
```

### 5. 測試連線

```bash
# 測試資料庫連線
npm run db:test

# 如果成功，初始化資料庫
npm run db:init

# 建立範例資料
npm run db:sample
```

## 🚨 常見問題

### 問題 1: 找不到 psql 命令
**解決方案：** 將 PostgreSQL 的 bin 目錄加入系統 PATH
- 通常路徑：`C:\Program Files\PostgreSQL\17\bin`

### 問題 2: 連線被拒絕
**解決方案：** 檢查 PostgreSQL 服務是否正在運行
```bash
# 檢查服務狀態
sc query postgresql
```

### 問題 3: 認證失敗
**解決方案：** 檢查密碼是否正確，或重置密碼
```bash
# 重置 postgres 使用者密碼
psql -U postgres
ALTER USER postgres PASSWORD '新密碼';
```

## 📞 需要協助？

如果遇到問題，請提供以下資訊：
1. PostgreSQL 的安裝路徑
2. 錯誤訊息的完整內容
3. 您使用的 Windows 版本

我們可以根據您的具體情況提供更詳細的解決方案。
