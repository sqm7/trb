# 🛠️ 技能安裝協議 (Skill Installation Protocol)

## 核心行為
當用戶要求「安裝」、「新增」或「搬移」任何 AI 技能（Skills）或工作流（Workflows）時，我必須嚴格執行以下詢問流程：

### 1. 安裝前確認
在執行任何文件操作前，我必須詢問用戶該技能的預期用途，並提供以下選項：
- **[A] 僅安裝為 Workflow (單一指令)**：適合簡單的流程引導，推薦存放到 `.agent/workflows/`。
- **[B] 同時安裝為 Skill 與 Workflow (完整能力包)**：推薦用於包含腳本或大量資源的重量級功能。這會將實體資源放入 `.agent/skills/`，並在 `.agent/workflows/` 建立快捷指令。
- **[C] 自定義路徑**：由用戶指定特定的安裝位置。

### 2. 選項建議基準
我會根據目標內容的複雜度給出主動建議：
- **單個 .md 文件** $\rightarrow$ 建議選項 [A]。
- **資料夾 (包含腳本/範例)** $\rightarrow$ 建議選項 [B]。

### 3. 安裝後同步
完成安裝或涉及 `.agent/`, `.cursor/`, `.claude/`, `.trae/`, 或 `.windsurf/` 目錄變動後，必須遵循「全 IDE 同步協議」執行 `bash scripts/sync_ide_configs.sh`，確保其廣播。

---
> [!IMPORTANT]
> 嚴禁在未經確認的情況下自行決定安裝位置。這能確保專案目錄結構始終符合用戶的開發直覺。
