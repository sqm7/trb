# 🚀 DEPLOYMENT.md - 部署與同步工作流

**版本**: 1.0.0
**最後更新**: 2026-01-08

---

## 核心哲學：Local First (本地優先)

1.  **所有開發在本地完成**：修改、測試、驗證都在本地環境進行。
2.  **驗證後同步**：確認本地功能正常後，才同步到遠端 GitHub (`sqm7/kthd`)。
3.  **單一真理源**：本地的 `SPEC.md` 和 `PLAN.md` 是專案的真理源，遠端只是備份與展示。

---

## 🏃‍♂️ 如何啟動 (How to Run)

由於本專案使用 ES Modules (`<script type="module">`)，瀏覽器基於安全性限制 (CORS)，**無法直接雙擊 `index.html` 開啟**。必須透過本地網頁伺服器 (Local Server) 運行。

### 快速啟動
我們提供了啟動腳本，請在終端機執行：

```bash
./start_server.sh
```

然後在瀏覽器開啟: [http://localhost:8080](http://localhost:8080)

---

## 🤖 Agent 部署指令 (AI 請嚴格遵守)

當使用者要求「部署」、「同步」或「上傳」時，請執行以下步驟：

### Step 1: 自我檢查 (Pre-flight Check)
- [ ] 確認當前任務 (`Current Task`) 在 `PLAN.md` 中已標記完成。
- [ ] 確認 `SPEC.md` 若有變更，已同步更新。
- [ ] 詢問使用者：「本地變更已完成並驗證了嗎？準備同步到 kthd？」

### Step 2: 遠端狀態檢查 (Remote Check)
- [ ] 使用 `get_commit` 或 `list_commits` 檢查遠端 `main` 分支狀態。
- [ ] **注意**：如果遠端有領先本地的 commit，**必須先通知使用者**。不要擅自覆蓋遠端的新變更。
- [ ] 若遠端落後或與本地分岔，且使用者確認以本地為準，則繼續。

### Step 3: 執行同步 (Push)
- [ ] 使用 MCP 工具 `push_files`。
- [ ] **Commit Message 規範**：
    - `feat: ...` (新功能)
    - `fix: ...` (修復)
    - `docs: ...` (文件)
    - `style: ...` (樣式)
- [ ] 包含所有變更的檔案（code + docs）。

### Step 4: 完成通知 (Post-flight)
- [ ] 告知使用者同步完成。
- [ ] 提供 Commit SHA 或連結（若有）。

---

## 📝 常用 Git 指令備忘 (供 Agent 參考背後邏輯)

雖然 Agent 使用 MCP 工具，但邏輯應等同於：

```bash
# 1. 檢查狀態
git status

# 2. 添加檔案
git add .

# 3. 提交
git commit -m "feat: 更新功能 X"

# 4. 推送 (Agent 使用 push_files 模擬此行為)
git push origin main
```

---

## 🔀 部署環境分流

本專案使用「測試 → 正式」的兩階段部署流程：

```
┌─────────────────────────────────────────────────────────────────┐
│                        開發流程                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   本地開發  ──►  測試環境 (trb)  ──►  正式環境 (kthd)            │
│                                                                 │
│   localhost     sqm7/trb            sqm7/kthd                   │
│   :8080         (GitHub)            (GitHub Pages)              │
│                                     → www.sqmtalk.com           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 部署腳本對照表

| 腳本 | 用途 | 目標儲存庫 | 網站 |
|------|------|------------|------|
| `deploy_trb.sh` | 🟡 測試版部署 | `sqm7/trb` | (無公開網站) |
| `deploy_github.sh` | 🟢 正式版部署 | `sqm7/kthd` | `www.sqmtalk.com` |

### 使用方式

```bash
# 測試版：先在 trb 驗證
./deploy_trb.sh "測試新功能"

# 確認無誤後，部署到正式版
./deploy_github.sh "feat: 新增 XX 功能"
```

### ⚠️ 重要提醒

1. **不要使用 `git push --force`**：這會覆蓋歷史，可能導致 CNAME 等關鍵檔案遺失
2. **CNAME 檔案不可刪除**：此檔案維持 `www.sqmtalk.com` 自訂網域的連結
3. **正式版部署前請先在測試環境驗證**

