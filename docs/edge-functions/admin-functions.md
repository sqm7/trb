# Admin Related Edge Functions

本文件涵蓋系統管理與用戶管理相關的 Edge Functions。這些函數通常需要 Admin 權限或 Service Role 執行。

## 1. Delete User (`delete-user`)
- **用途**: 徹底刪除用戶帳號。
- **權限**: 僅限 `super_admin` 或 `admin` 角色調用。
- **邏輯**:
    - 檢查發起請求者的角色（JWT Role Check）。
    - 同時刪除 `auth.users` 與 `public.profiles` 中的資料。
    - 這是一個不可逆的操作。

## 2. Get Users (`get-users`)
- **用途**: 獲取所有用戶列表，供 Admin Dashboard 使用。
- **權限**: Admin Only。
- **邏輯**:
    - 使用 `supabaseAdmin.auth.admin.listUsers()` 獲取所有註冊用戶。
    - 會過濾與整理回傳的 JSON 結構，包含 Metadata 與 Role 資訊。
    - **注意**: 若用戶量大，此函數可能需要實作分頁 (Pagination)。

## 3. Sync Emails (`sync-emails`)
- **用途**: 數據庫維護工具。
- **邏輯**:
    - 強制將 `auth.users` 中的 Email 同步到 `public.profiles`.
    - 用於修復因早期 Bug 或手動修改導致的數據不一致。

## 4. Generate Share Link (`generate-share-link`)
- **用途**: 產生帶有簽名或時效的分享連結（適用於分享報表給非會員）。
- **邏輯**:
    - 接收報表參數與過期時間。
    - 寫入 `shared_links` 資料表或生成 JWT 簽名 URL。
    - 回傳短網址或識別碼。
