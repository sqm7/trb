# LINE Integration Guide (開發與串接手冊)

本文件詳細記錄本專案的 **LINE Login** 與 **LINE Official Account (OA)** 串接流程，以及開發過程中遇到的關鍵問題與解決方案。

## 1. 系統架構概念
本系統採用「雙軌並行」架構：
1.  **LINE Login Channel**: 負責「身分識別」。
    -   使用者點擊「LINE 一鍵登入」。
    -   透過前端 LIFF SDK 或後端 API 取得 User ID。
2.  **Messaging API Channel**: 負責「機器人互動」。
    -   即官方帳號 (Official Account)。
    -   負責發送 Push Message (通知)、Reply Message (自動回覆)。

**關鍵目標**: 將這兩個 Channel 綁定在同一個 **Provider** 下，並設定 **Linked OA**，系統才能知道「登入這個網站的人」=「這個官方帳號的好友」。

---

## 2. 環境配置 (Environment Setup)
為了區分測試與正式環境，我們建立了兩組 LIFF App，由程式碼自動判斷。

### 2.1 LIFF Config (`src/lib/liff-config.ts`)
| 環境 | LIFF ID | 對應網域 (Endpoint URL) |
| :--- | :--- | :--- |
| **Test (測試區)** | `2008934556-oxSVZdHU` | `https://sqm7.github.io/trb` |
| **Production (正式區)** | `2008934556-Ud86tczR` | `https://www.sqmtalk.com` |

> **⚠️ 注意**: 在 LINE Developers Console 中，必須確保每個 LIFF ID 的 `Endpoint URL` 與上述網域完全一致，否則用戶無法開啟。

---

## 3. 完整串接流程 (Step-by-Step)

### Step 1: 建立 Provider
這是在 LINE Developers Console 的最上層單位。
*   **原則**: Login Channel 和 Messaging API Channel 必須在 **同一個 Provider** 底下。
*   *問題點*: 如果分屬不同 Provider，後續將無法進行連結。

### Step 2: 建立 LINE Login Channel
1.  在此 Provider 下新增 Channel，類型選 `LINE Login`。
2.  設定 App Types: 勾選 `Web app`。
3.  在此 Channel 下建立 **LIFF App** (測試用與正式用各一個)。
    *   **Scopes**: 必須勾選 `profile`, `openid` (重要！)。

### Step 3: 建立 Messaging API Channel (官方帳號)
> **🔥 關鍵改變 (2025 新制)**: 現在無法直接在 Console 建立 Messaging API Channel，流程變複雜。

**正確流程**:
1.  在此 Provider 點擊 `Create a new channel` -> 選 `Messaging API`。
2.  點擊綠色按鈕 **`Create a LINE Official Account`** (會跳轉到 OA Manager)。
3.  在 OA Manager 填寫資料建立帳號。
4.  **【最容易漏掉的一步】**: 
    - 建立完後，留在 OA Manager (設定頁面)。
    - 點選左側 `Messaging API` -> 點擊 **`Enable Messaging API` (啟用)**。
    - **此時系統會彈窗詢問 Provider** -> **務必選擇與 Step 1 相同的 Provider**。
5.  完成後，該帳號就會自動出現在 Developer Console 的 Provider 列表中。

### Step 4: 執行 Linked OA (綁定)
讓 Login Channel 知道它對應哪個官方帳號。
1.  進入 **LINE Login Channel** -> **Basic settings**。
2.  捲動到底部找到 **Linked OA**。
3.  點擊 `Edit`，選擇 Step 3 建立的官方帳號。
    *   *如果下拉選單是空的？* -> 代表 Step 3 的 Provider 選錯了，兩者不在同一個家。

### Step 5: 開啟加好友選項 (Add friend option)
確保 LIFF 能檢查好友狀態。
1.  同樣在 **LINE Login Channel** -> **Basic settings**。
2.  找到 **Add friend option**。
3.  設定為 **`Normal`** 或 **`Aggressive`**。
    *   *切勿設為 `Off`*，否則 `liff.getFriendship()` 永遠會回傳 false。

---

## 4. 常見問題與除錯 (Troubleshooting)

### Q1: 為什麼我在 Linked OA 下拉選單看不到我的官方帳號？
*   **原因**: 您的 LINE Login Channel 和 Messaging API Channel 分屬不同的 **Provider**。
*   **解法**: 
    1. 前往您原本的 Provider。
    2. 點擊 `Create New Channel` -> `Messaging API`。
    3. 選擇 `Import existing LINE Official Account` (匯入現有帳號) 或新建一個，並確保在啟用 API 時選擇正確的 Provider。

### Q2: 為什麼登入後一直卡在「啟用帳號」頁面，明明我已經加好友了？
*   **原因 1**: `Add friend option` 被設為 `Off`。
*   **原因 2**: LINE API 快取延遲。
*   **解法**:
    1. 檢查 Console 設定是否為 `Normal`。
    2. 使用頁面上的「我已加入好友，立即驗證」按鈕 (手動 reload 觸發檢查)。

### Q3: 為什麼電腦版掃描 QR Code 後沒有反應？
*   **原因**: 手機上加了好友，但電腦版網頁不知道 (因為 LIFF 是在手機上運作最順暢)。
*   **解法**: 電腦版使用者在手機加入好友後，需手動點擊網頁上的「我已加入好友」按鈕來刷新狀態。

---

## 5. 相關程式碼位置
*   **LIFF 設定與 ID**: `src/lib/liff-config.ts`
*   **驗證頁面邏輯**: `src/app/auth/oa-callback/page.tsx`
*   **LINE 登入按鈕**: `src/app/page.tsx`
