---
description: Guidelines for using and creating project scripts.
globs: ["scripts/**/*", "ARCHITECTURE.md"]
---

# Script Usage Rules ⚠️

- **禁止重複創建已存在的腳本**，先查閱 `ARCHITECTURE.md` 第 6、7 章節。
- 常用腳本：
  - 備份 Schema: `bash scripts/backup_supabase.sh`
  - 部署正式版: `bash scripts/deploy_next_prod.sh`
  - 部署測試版: `bash scripts/deploy_next_trb.sh`
  - 部署 Edge Functions: `supabase functions deploy <name>`
