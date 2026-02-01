---
description: Mandatory rules for GitHub Pages deployment and migration restrictions.
globs: ["**/*"]
---

# Deploy Platform Rules ⚠️

- **目前使用 GitHub Pages**，不可擅自更改為 Vercel 或其他平台。
- 若需要 API Routes、SSR 等功能需遷移到 Vercel，**必須先詢問用戶並取得同意**。
- 部署流程：`npm run build` → 複製 `out/` 到根目錄 → `git push`。
