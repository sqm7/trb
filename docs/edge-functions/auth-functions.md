# Auth Related Edge Functions

本文件涵蓋所有與用戶身份驗證、帳號綁定相關的 Edge Functions。

## 1. Line Auth (`line-auth`)
### 概述
處理 LINE Login 的完整流程，包括驗證 ID Token、帳號連結 (Linking) 以及建立新用戶。

### 功能端點
- **GET**: Health Check，檢查環境變數 (`LINE_CHANNEL_ID`, `LINE_JWT_SECRET`) 是否設定。
- **POST**:
    - **`action: 'unlink'`**: 解除 LINE 綁定。
        - 檢查用戶是否有備用 Email。
        - 移除 `auth.identities` 中的 LINE 連結。
        - 清除 `user_metadata` 中的 LINE 資訊。
        - 強制將 `app_metadata.provider` 切換為 `email`。
    - **Login / Link Flow**:
        - 驗證 LINE ID Token。
        - **Linking**: 若帶有 `linkToUserId`，將 LINE 帳號連結至現有 Vibe 帳號。
        - **Login/Signup**: 若無連結意圖，則尋找現有帳號或建立新帳號。
        - **JWT Minting**: 簽發一個長效期的 Supabase JWT (30天) 供前端使用。

---

## 2. Bind Email (`bind-email`)
### 概述
允許用戶綁定 Email/密碼，或解除 Email 綁定（退回純 LINE 帳號模式）。此函數使用 `service_role_key` 繞過標準的 Email 驗證流程，提供無縫的 UX。

### 功能端點
- **POST**:
    - **`action: 'unbind'`**:
        - 驗證用戶是否已連結 LINE（必須有後路）。
        - 將 Email 重置為 `{line_id}@line.workaround` 的佔位符。
        - 亂數重置密碼。
    - **`action: 'cancel'`**:
        - 清除前端的「待確認 Email」警告狀態。
    - **Normal Bind**:
        - 驗證 `current_password` (如果有的話)。
        - 更新 `auth.users` 的 Email 與 Password。
        - 自動設定 `email_confirm: true`。
        - 同步更新 `public.profiles` 表。
