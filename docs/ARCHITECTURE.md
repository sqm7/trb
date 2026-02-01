# Technical Architecture

## 1. Stack Overview
- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, Shadcn UI. (Note: Build stability fix using `--webpack` for dev/build scripts).
- **Backend / BaaS**: Supabase (Auth, Database, Edge Functions).
- **Hosting**: GitHub Pages (靜態輸出), Supabase (Edge Functions).

## 2. Directory Structure
```
/
├── .agent/             # AI Assistant Configuration (Source of Truth)
│   ├── skills/         # Specialized Skill Modules
│   ├── workflows/      # Slash Command Scripts
│   └── rules/          # Project Guidelines & Rules
├── .gemini/            # Global Agent Rules & Sync Protocols
├── .cursor/            # IDE Specific (Sync from .agent)
├── .claude/            # IDE Specific (Sync from .agent)
├── .trae/              # IDE Specific (Sync from .agent)
├── .windsurf/          # IDE Specific (Sync from .agent)
├── next-app/           # Next.js Application (Active Frontend)
│   ├── src/
│   │   ├── app/        # App Router Pages
│   │   │   - `pricing/`: Membership Pricing & Upgrade Page
│   │   │   - `reports/builder/`: Custom Report Builder (Drag & Drop Canvas)
│   │   │   - `auth/oa-callback/`: LINE OA Friendship Verification Page
│   │   │   - `share/`: Public Read-Only Snapshot Viewer (Primary URL)
│   │   │   - `icon.png`: Main site icon / logo
│   │   ├── components/ # React Components
│   │   │   - `ui/`: Reusable UI elements
│   │   │   - `admin/`: Admin-specific pieces (PermissionTableModal.tsx)
│   │   │   - `PageDropZone.tsx`: Handles cross-page drag-and-drop.
│   │   │   - `FloatingToolbar.tsx`: Context-aware floating actions (Bottom-Center).
├── supabase/           # Supabase Configuration
│   ├── functions/      # Deno Edge Functions (delete-user, line-auth, etc.)
│   └── migrations/     # Database Schema
├── scripts/            # Deployment & Utility Scripts
├── skills/             # Agentic Skills
├── docs/               # Project Documentation
│   ├── reports/        # Analysis Report Specifications
├── _legacy_backup/     # Archive of old Vanilla JS/HTML files
├── SPEC.md             # Functional Specification
├── PLAN.md             # Execution Plan
├── ARCHITECTURE.md     # Technical Overview
├── DATABASE_SCHEMA.md  # Detailed Database Documentation
└── docs/               # Project Documentation
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

### `public.shared_reports`
- 儲存分享報表的設定與狀態。
- Key Columns: `token` (唯一存取碼), `report_type`, `filters` (JSON), `view_mode`.

### `public.announcements`
- 系統公告表，用於發布全站通知。

### `public.project_parsing_rules_v2`
- 建案名稱與地址的解析規則庫 (新版)。
- Key Columns: `parser_logic`, `confidence_score`.

### `public.project_name_mappings`
- 建案名稱標準化映射表 (Raw Name -> Standard Name)。

### `public.county_codes`
- 縣市代碼對照表 (e.g. A=臺北市)。

### `public.all_transactions_view`
- 整合實價登錄交易資料的視圖 (View)，用於查詢與分析。

## 4. Key Components
### Authentication
- **`bind-email` Edge Function**: Handles privileged user updates that standard client libraries can't do easily (e.g. bypassing email verification, unbinding to placeholder).
- **`line-auth` Edge Function**: Verifies LINE ID tokens, handles custom signup/login flows, references `line_user_id` in metadata.

### Protected Routes
- **`withAdminAuth` HOC**: Used to restrict access to sensitive pages like `/admin/*`, `/reports/builder`, and `/map`. Redirects unauthorized users to home or dashboard.

### Frontend State
- **User Context**: derived from `supabase.auth.getSession()`.
- **Binding Status**: Calculated from `user.email` (placeholder check) and `user.app_metadata` / `identities`.
- **Global Search**: Integrated into `Sidebar.tsx`, replacing the previous Header search.
- **Filter State**: Managed by `useFilterStore`, synchronized across full and compact `FilterBar` views. Implementation utilizes the `mask-fade-right` CSS utility and mandatory `pr-8` padding for horizontal scrolling areas to ensure content visibility.
- **Global Aesthetics**: Ultra-thin **2px** scrollbars used project-wide for a minimal and premium UI feel.
- **Report Builder State**: Managed by `useReportBuilderStore`, supports multiple pages, data snapshotting (捕捉當前視圖數據), and persists canvas items to `localStorage`.
    - **Selection**: Supports multi-selection via marquee (lasso) dragging and Ctrl/Cmd+Click. Supports keyboard **Delete/Backspace** for item removal.
    - **Current Supported Components**: Ranking, Price Band, Unit Price Analysis, Sales Velocity (Trends, Heatmaps, Detail Tables), Heatmap (Grid, Stats, Comparison), Parking Stack 3D (Hybrid CSS 3D/2D Layering).
    - **Image Generation**: Uses `modern-screenshot` (replacing `html2canvas`) for better CSS support (oklab/oklch).

- **`BrandImageIntro.tsx`**: High-performance cinematic intro animation.
    - **Visual Tech**: Uses `framer-motion` for complex physics-based particle systems and coordinate transforms (Hyperdrive/Fusion effects).
    - **Branding**: Displays dual-language metallic logos.
    - **Lifecycle**: Integrated into `page.tsx` with parallel auth verification check to minimize perceived wait time.

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
| `query-data` | 查詢房地產資料 (支援動態從 `{code}_projects` 合併建案細節) |
| `query-names` | 搜尋建案名稱 |
| `query-sub-data` | 查詢子資料 |
| `analyze-data` | 資料分析 |
| `analyze-project-ranking` | 建案排名分析 |
| `analyze-district-price` | 區域價格分析 |
| `generate-share-link` | 產生分享連結 (Legacy) |
| `create-snapshot` | 建立限時報表快照 (支援自動清理) |
| `get-snapshot` | 讀取快照數據 (含過期檢查與計數) |
| `public-report` | 公開報表 |

### 部署 Edge Functions
```bash
# 部署單一 function
supabase functions deploy <function-name> --no-verify-jwt

# 部署所有 functions
supabase functions deploy --all
```
### 4. 建案自動索引系統 (Project Indexing System)

系統透過 Edge Function 定期掃描實價登錄預售屋資料 (`*_lvr_land_b`)，並將結果存入縣市建案表 (`*_projects`)。

#### 運作邏輯 (Logic Flow):
1.  **分頁掃描 (Scan)**: 遍歷全台 22 縣市成交紀錄，提取 `建案名稱`。
2.  **智慧清洗 (Standardize)**: 轉換為標準化名稱並 Upsert 至 `{code}_projects`。
3.  **深度補全與管理 (Enrich & Manage)**:
    *   **Admin UI**: 管理者在 `/admin/projects` 指派建案進入 `requested` 隊列。
    *   **Agent Workflow**: 執行 `/batch-enrich` 或 `/lookup-project`。
    *   **嚴格判定**: 採用 **15/16 欄位完備規則**（除代銷外皆須補齊）判定為 `done`，否則退回 `pending`。
4.  **數據閉環**:
    *   `Requested` ➡ (Agent 搜尋一次) ➡ `Done` (達標) 或 `Pending` (不達標)。
    *   `Pending` ➡ (人工審查/補足/存檔) ➡ `Done`。
