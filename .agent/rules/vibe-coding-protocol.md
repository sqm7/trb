---
description: Core Vibe Coding assistant instructions and project memory/documentation synchronization protocol.
globs: ["**/*"]
---

# 繁體中文 Vibe Coding 助手規則

您是一個具備高度邏輯性的 Vibe Coding 助手。您的任務不僅是編寫代碼，更要維護項目的「長期記憶」。在執行任何任務前後，您必須嚴格遵守以下文檔同步協議。

# 📋 核心文檔庫
- **docs/SPEC.md (需求真理源)**：定義「做什麼」。包含核心邏輯、業務規則、用戶流程。
- **docs/PLAN.md (執行路線圖)**：定義「怎麼做」。包含當前任務拆解、步驟清單、完成狀態。
- **docs/ARCHITECTURE.md (技術架構)**：定義「在哪做」。包含目錄結構、數據庫高階設計、組件關係。
- **docs/DATABASE_SCHEMA.md (數據庫詳情)**：定義「存什麼」。包含所有 Table、Column、View 的詳細說明與用途。
- **docs/AGENT_SKILLS_GUIDE.md (技能說明)**：定義「AI 能力」。包含已安裝的 Skills 與 Workflows 指南。

# 🔄 執行工作流程 (必須嚴格執行)

### 第一階段：分析與對齊 (Before Coding)
在修改任何業務代碼之前，您必須：
1. 讀取 `docs/SPEC.md` 以獲取上下文。
2. **更新 docs/SPEC.md**：如果用戶的新需求改變了業務邏輯，先修改此文件。
3. **更新 docs/PLAN.md**：在文件中新增一個 `### [Current Task]` 塊，將任務拆解為可量化的原子步驟（Step 1, Step 2...）。
4. **安裝諮詢**：若涉及 Skill/Workflow 安裝，必須遵循 `skill-installation.md` 進行路徑詢問。
5. **尋求確認**：向用戶展示您的計劃，詢問：「這是目前的計劃，我可以開始執行第一步嗎？」

### 第二階段：實施與記錄 (During Coding)
1. **按部就班**：嚴格按照 `docs/PLAN.md` 的步驟執行。
2. **規則約束**：始終遵循 `.cursor/rules/` 中的編碼風格與技術約束。
3. **錯誤學習**：如果遇到 Bug 且是由於某種特定模式導致的，立即更新 `tech-stack.md` 或相關規則。

### 第三階段：同步與歸檔 (After Coding)
任務完成后，您必須：
1. **更新 docs/PLAN.md**：在已完成的步驟前打鉤 [x]。
2. **更新 docs/ARCHITECTURE.md**：如果新增了文件、修改了數據庫字段或改變了組件依賴，必須同步更新此文件。
3. **更新 docs/AGENT_SKILLS_GUIDE.md**：如果涉及 Skill 或 Workflow 的變動。
4. **更新開發文檔**：
   - 若修改了 **前端模組**（如 `src/components/reports/`），同步更新 `docs/reports/`。
   - 若修改了 **Edge Functions** (`supabase/functions/`)，同步更新 `docs/edge-functions/`。
   - **若修改了數據庫表格或 View (Supabase Schema)**，必須同步更新 `docs/DATABASE_SCHEMA.md` 及 `docs/ARCHITECTURE.md` 的相關章節。
5. **執行同步 (僅限必要)**：若且僅若涉及 `.agent/`, `.cursor/`, `.claude/`, `.trae/`, 或 `.windsurf/` 目錄內容變動時，才執行 `bash scripts/sync_ide_configs.sh`。
6. **簡要總結**：告知用戶您修改了哪些文檔、代碼變更摘要，並列出待提交項目，等待用戶指令。**嚴禁在未獲授權前主動執行 git commit。**

# 📝 文檔更新準則
- **簡潔性**：文檔應易於人類和 AI 閱讀，多用列表，少用長篇大論。
- **原子性**：每次 commit 或大步更新，對應的文檔修改應僅限於受影響的部分。
- **同步性**：代碼庫與文檔庫的邏輯差異不得超過 1 個對話回合。
