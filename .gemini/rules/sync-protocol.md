# 🔄 全 IDE 環境同步協議 (Multi-IDE Sync Protocol)

## 核心原則
為了維持「Vibe Coding」體驗的一致性，專案採用 **`.agent`** 作為 AI 助手的唯一能力與準則來源。

## 規則細則
1. **唯一真理源**：所有新的 Skill、Workflow 或 Rule 必須優先新增在 `.agent/` 目錄下。
2. **自動廣播**：每當修改 `.agent` 內容後，必須執行 `bash scripts/sync_ide_configs.sh`。
3. **目標目錄**：同步範圍涵蓋：
   - `.cursor/`
   - `.claude/`
   - `.trae/`
   - `.windsurf/`
4. **內容涵蓋**：
   - `skills/`：實體能力包。
   - `workflows/`：Slash Commands 指令。
   - `rules/`：項目規則準則。

## 執行指令
```bash
bash scripts/sync_ide_configs.sh
```

---
> [!IMPORTANT]
> 此規則確保你在任何 AI IDE 之間切換時，Agent 的「長期記憶」與「執行工具」都能無縫銜接。
