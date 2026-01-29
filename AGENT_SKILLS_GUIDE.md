# 🤖 AI Agent 技能與工作流說明書 (Skills & Workflows Guide)

這份文件旨在幫助您了解專案中安裝的 AI 擴充功能，以及如何高效地調用它們。

---

## 💡 核心概念：Workflow vs. Skill

| 類型 | 存放路徑 | 調用方式 | 本質 |
| :--- | :--- | :--- | :--- |
| **Workflow (工作流)** | `.agent/workflows/` | `/指令名稱` | **「提示詞腳本」**：告訴 AI 執行某項任務的詳細步驟與規則。 |
| **Skill (技能包)** | `.agent/skills/` | AI 自動調用 | **「能力模組」**：包含說明書、腳本工具與範例，讓 AI 具備新的數據處理或代碼建構能力。 |

---

## 🛠️ 目前已安裝的功能清單

### 1. Slash Commands (快捷指令 / Workflows)
在對話框輸入 `/` 即可快速啟動以下專屬流程：

*   **/react-native** (新)：React Native & Expo 最佳實踐與開發嚮導。
*   **/frontend-design**：高品質前端介面與組件設計。
*   **/ui-ux-pro-max**：UI/UX 規劃與實作。
*   **/react-components**：將設計轉化為 React 組件。
*   **/remotion**：Remotion 影片製作最佳實踐。
*   **/webapp-testing**：使用 Playwright 進行網頁自動化測試。
*   **/doc-coauthoring**：引導您協同撰寫技術文件。
*   **/skill-creator**：協助您建立新的 AI 技能包。
*   **/pptx / /xlsx / /docx / /pdf**：處理各種辦公文件格式。
*   **/canvas-design**：生成海報、藝術設計。
*   **/stitch-loop**：網站代碼迭代開發循環。
*   **/vibe-coding-writer** (新)：撰寫具有 Vibe Coding 風格的文案與文章。

### 2. Modular Skills (模組化技能包)
這些功能通常由系統後台或特定的「橋接指令」啟動：

*   **vercel-react-native-skills**：
    *   **位置**：`.agent/skills/vercel-react-native-skills/`
    *   **核心能力**：列表效能優化 (FlashList)、Reanimated 動畫、原生模組配置。
    *   **備註**：已透過 `/react-native` 指令建立橋接入口。

---

## ❓ 常見問題

### 如何新增技能？
*   **Workflow**：直接在 `.agent/workflows/` 下新增一個 `.md` 檔案，定義好規則即可。
*   **Skill**：使用 `npx skills add <URL>` 工具安裝。

### 為什麼有些技能在資料夾裡，有些是單個檔案？
*   單個 `.md` 檔案（Workflow）適合簡單的規則指令。
*   資料夾（Skill）適合包含多個規則文件、腳本或範例的複雜能力包。

---

> [!TIP]
> 如果您忘記了某個指令的具體用法，可以直接問我：「/指令名稱 的用法是什麼？」或者查看 `.agent/workflows/` 下對應的檔案。
