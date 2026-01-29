---
description: Technical constraints for Tailwind CSS v4, Remotion video generation, and Z-Index stacking.
globs: ["**/*.{ts,tsx,css,scss}", "next-app/**/*"]
---

# Tech Stack Constraints & Pitfalls ⚠️

## Tailwind CSS v4 Usage
- 本專案使用 **Tailwind CSS v4** (`@tailwindcss/postcss`)，**不存在** `tailwind.config.ts` 或 `tailwind.config.js`。
- 當使用 Agent Skills (如 `/react-components`) 或生成代碼時，若遇到讀取 config 的步驟，請**直接忽略**或假設使用標準設定。
- 樣式配置請查閱 CSS 變數或全域 CSS 檔案，勿嘗試讀取或創建 config 檔案。

## Remotion Video Generation
- **Tailwind Integration**: 必須建立 `remotion.config.ts` 並配置 `postcss-loader` 才能讀取 Tailwind CSS v4 樣式。否則影片會失去所有樣式。
- **Animation Smoothness**: 
  - **禁止使用 Framer Motion** (`framer-motion`) 進行影片渲染。時間軸不同步會導致嚴重頓挫 (Stuttering)。
  - **必須使用 Remotion Native Hooks** (`spring`, `interpolate`, `useCurrentFrame`) 進行所有動畫計算，確保 Frame-Perfect 的 60FPS 流暢度。
- **Static Assets**: 必須使用 `staticFile("path/to/asset.png")` 來引用 `public/` 資料夾內的圖片，直接寫 `src="/icon.png"` 會導致 Render 失敗。

## Z-Index & Stacking Context
- 當在 Dashboard 實作 `fixed` 或 `sticky` 元素時，必須注意與 `Header (z-50)` 的層級關係。
- 當 `FilterBar` 處於精簡模式時，其容器應設置 `z-[100]` 以上，且元素本身設置 `z-[70]`，以確保正確出現在 Header 最上方。
