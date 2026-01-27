# Remotion Market Promo

這個目錄下包含專門為 **Remotion** 設計的影片渲染組件：
1. `MarketReport.tsx` - 數據驅動的動態報表展示。
2. `BrandIntro.tsx` - 高端影視級品牌形象影片模板。

### 如何使用 (How to use)

1. **安裝 Remotion CLI** (若尚未安裝):
   ```bash
   npx remotion preview
   ```

2. **核心觀點 (Rules followed)**:
   - 根據 `remotion-best-practices` 技能規範。
   - 禁用 CSS Transitions/Tailwind Animations，所有動作由 `useCurrentFrame` 和 `interpolate` 驅動。
   - 使用 `spring` 控制物理感強的動畫效果。

### 網站整合 (Web Integration)
雖然此組件用於影片渲染，但網站上的互動動畫 (Login Page) 已使用 **Framer Motion** 進行了優化，以確保瀏覽器的最佳性能。
