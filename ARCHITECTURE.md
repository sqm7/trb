# Technical Architecture

## 1. Stack Overview
- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, Shadcn UI.
- **Backend / BaaS**: Supabase (Auth, Database, Edge Functions).
- **Hosting**: GitHub Pages (靜態輸出), Supabase (Edge Functions).

## 2. Directory Structure
```
/
├── next-app/           # Next.js Application (Active Frontend)
│   ├── src/
│   │   ├── app/        # App Router Pages
│   │   │   - `pricing/`: Membership Pricing & Upgrade Page
│   │   ├── components/ # React Components
│   │   │   - `ui/`: Reusable UI elements
│   │   ├── remotion/   # [New] Video Generation Components
│   │   │   ├── AlchemyVideo.tsx  # Promotional Square Video (60FPS)
│   │   │   ├── Root.tsx          # Remotion Composition Entry Point
│   │   │   └── index.ts          # Remotion Register Root
│   │   └── ...
├── supabase/           # Supabase Configuration
│   ├── functions/      # Deno Edge Functions (delete-user, line-auth, etc.)
│   └── migrations/     # Database Schema
├── scripts/            # Deployment & Utility Scripts
├── skills/             # Agentic Skills
├── _legacy_backup/     # Archive of old Vanilla JS/HTML files
├── SPEC.md             # Functional Specification
├── PLAN.md             # Execution Plan
└── ARCHITECTURE.md     # This file
```

## 3. Database Schema (Key Tables)
### `auth.users` (Supabase System)
- `email`: User's primary email.
- `encrypted_password`: Hashed password.
- `user_metadata`: Stores `full_name`, `line_user_id`, `avatar_url`.
- `app_metadata`: Stores `provider`, `providers`.

### `public.profiles`
- `id`: FK to `auth.users.id`.
- `full_name`: Display name.
- `email`: Synced copy of user email for easier querying.
- `created_at`, `updated_at`.

## 4. Key Components
### Authentication
- **`bind-email` Edge Function**: Handles privileged user updates that standard client libraries can't do easily (e.g. bypassing email verification, unbinding to placeholder).
- **`line-auth` Edge Function**: Verifies LINE ID tokens, handles custom signup/login flows, references `line_user_id` in metadata.

### Frontend State
- **User Context**: derived from `supabase.auth.getSession()`.
- **Binding Status**: Calculated from `user.email` (placeholder check) and `user.app_metadata` / `identities`.
- **Global Search**: Integrated into `Sidebar.tsx`, replacing the previous Header search.
- **Filter State**: Managed by `useFilterStore`, synchronized across full and compact `FilterBar` views.

## 5. 部署平台規則

> ⚠️ **重要：變更部署平台前必須取得用戶同意**

### 目前方案：GitHub Pages
- **域名**: www.sqmtalk.com → sqm7.github.io
- **部署方式**: `npm run build` 後將 `next-app/out/` 內容複製到根目錄，推送到 main 分支
- **限制**: 僅支援靜態輸出 (`output: 'export'`)，不支援 API Routes、Server Components

### 未來可能遷移：Vercel
- 當專案需要以下功能時，可考慮遷移到 Vercel：
  - Next.js API Routes
  - Server-Side Rendering (SSR)
  - Incremental Static Regeneration (ISR)
  - Edge Middleware
- **遷移前必須詢問用戶並取得同意**

### 部署流程
```bash
# 1. 建置靜態檔案
cd next-app && npm run build

# 2. 複製到根目錄
cp -R out/* ../

# 3. 推送到 GitHub
cd .. && git add -A && git commit -m "deploy" && git push origin main
```

## 6. 腳本清單 (scripts/)

> ⚠️ **注意：已有現成腳本，請勿重複創建**

| 腳本 | 用途 | 執行方式 |
|------|------|----------|
| `backup_supabase.sh` | 備份 Supabase 資料庫結構 (Schema + RLS + Functions) | `bash scripts/backup_supabase.sh` |
| `deploy_next_prod.sh` | 部署 Next.js 到正式版 (www.sqmtalk.com) | `bash scripts/deploy_next_prod.sh "commit message"` |
| `deploy_next_trb.sh` | 部署 Next.js 到測試版 (sqm7.github.io/trb) | `bash scripts/deploy_next_trb.sh` |
| `deploy_github.sh` | 快速 Git commit + push | `bash scripts/deploy_github.sh "commit message"` |
| `start_server.sh` | 啟動本地靜態伺服器 (Python http.server) | `bash scripts/start_server.sh` |
| `inspect_user.js` | 調試用戶資料 (需 Service Role Key) | `SUPABASE_SERVICE_ROLE_KEY=... node scripts/inspect_user.js` |

### 備份目錄
- **Schema 備份**: `supabase_schema_sqm/YYYY-MM-DD/`
- **需要 Docker**: `backup_supabase.sh` 需要 Docker Desktop 運行

## 7. Edge Functions 清單 (supabase/functions/)

| Function | 用途 |
|----------|------|
| `bind-email` | 綁定/解綁 Email（繞過驗證） |
| `delete-user` | 刪除用戶（同時刪 auth.users 和 profiles） |
| `get-users` | 獲取所有用戶列表（Admin 用） |
| `line-auth` | LINE 登入/綁定/解綁 |
| `sync-emails` | 同步 auth.users 和 profiles 的 email |
| `query-data` | 查詢房地產資料 |
| `query-names` | 搜尋建案名稱 |
| `query-sub-data` | 查詢子資料 |
| `analyze-data` | 資料分析 |
| `analyze-project-ranking` | 建案排名分析 |
| `analyze-district-price` | 區域價格分析 |
| `generate-share-link` | 產生分享連結 |
| `public-report` | 公開報表 |

### 部署 Edge Functions
```bash
# 部署單一 function
supabase functions deploy <function-name> --no-verify-jwt

# 部署所有 functions
supabase functions deploy --all
```
