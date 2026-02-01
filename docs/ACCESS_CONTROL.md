# Role-Based Access Control (RBAC) Guide

本文件定義系統中的用戶角色層級、權限矩陣以及開發規範。

## 1. 角色定義 (Role Definitions)

系統共有 5 種角色等級，權限由高至低排列：

| 角色代碼 (Role Key) | 顯示名稱 (Display Name) | 用途與定位 |
| :--- | :--- | :--- |
| **`super_admin`** | 👑 超級管理員 | 系統擁有者。擁有至高無上的權限，可管理其他管理員。 |
| **`admin`** | 🛡️ 管理員 | 系統維護者。負責審核會員、資料補全 (Enrichment)、系統監控。 |
| **`pro_max`** | 🌟 PRO MAX | 最高階付費會員。可使用報表產生器、匯出原始資料、跨區分析。 |
| **`pro`** | ⚡ PRO | 進階付費會員。可查看所有進階圖表 (熱力圖、去化率)。 |
| **`user`** | 一般會員 | 免費註冊會員。僅能瀏覽基礎儀表板，無法匯出數據。 |

---

## 2. 權限矩陣 (Permission Matrix)

✅ = 允許 | ❌ = 禁止

| 功能模組 | 功能細項 | User | Pro | Pro Max | Admin | Super Admin |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **核心數據** | 瀏覽 Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| | 切換縣市/區域 | ✅ | ✅ | ✅ | ✅ | ✅ |
| | 查看詳細熱力圖 | ❌ | ✅ | ✅ | ✅ | ✅ |
| **報表與匯出** | 匯出圖片 (PNG/JPG) | ❌ | ✅ | ✅ | ✅ | ✅ |
| | 匯出原始數據 (CSV) | ❌ | ❌ | ✅ | ✅ | ✅ |
| | 客製報表產生器 | ❌ | ❌ | ✅ | ✅ | ✅ |
| **會員管理** | 查看會員列表 | ❌ | ❌ | ❌ | ✅ | ✅ |
| | 修改會員等級 (Pro/User) | ❌ | ❌ | ❌ | ✅ | ✅ |
| | 設定管理員 (Admin) | ❌ | ❌ | ❌ | ❌ | ✅ |
| | 刪除會員帳號 | ❌ | ❌ | ❌ | ❌ | ✅ |
| **系統維護** | 資料補全 (Enrichment) | ❌ | ❌ | ❌ | ✅ | ✅ |
| | 系統設定 (Settings) | ❌ | ❌ | ❌ | 部分 | ✅ |

---

## 3. 開發規範 (Development Rules)

### 3.1 權限檢查 Hook
前端頁面與元件必須使用 `useAdminAuth` 或 `useUserRole` 進行權限檢查，嚴禁 Hard-code。

```typescript
// ❌ 錯誤寫法
if (user.email === 'boss@example.com') { ... }

// ✅ 正確寫法
const { isAdmin } = useAdminAuth(); // 檢查 Admin 以上
const { role } = useUserRole();     // 檢查特定等級

// 檢查是否為 Pro 以上
const isProOrAbove = ['pro', 'pro_max', 'admin', 'super_admin'].includes(role);
```

### 3.2 後端 (RLS & Edge Functions)
所有涉及敏感資料的操作 (如刪除用戶、匯出全體資料)，必須在 Supabase RLS (Row Level Security) 或 Edge Function 內再次驗證 `auth.users` 或 `public.profiles` 的 `role` 欄位。

### 3.3 會員管理頁面規範
`src/app/admin/members/page.tsx` 是權限管理的中心。
- 必須清晰顯示每個會員的當前等級。
- 只有 **Super Admin** 可以看到「刪除按鈕」與「升級 Admin 選項」。
- 任何新的權限等級變動，都必須同步更新此頁面的 UI 與說明。
