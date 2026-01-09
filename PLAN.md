# 📝 PLAN.md - 執行路線圖

### [Current Task]
### [Current Task]
- [x] Create .gitignore to exclude development docs (SPEC.md, PLAN.md, ARCHITECTURE.md, .cursorrules)


**版本**: 1.0.0  
**最後更新**: 2026-01-08

---

## 🎯 當前專案狀態

✅ **已完成核心功能**
- 銷控表分析
- 多維單價分析
- PDF 導出
- 行動版響應式

---

## 📋 任務清單

### [History] Add Project Name Auto-Replace Feature
- [x] Step 1: Design Supabase table schema
- [x] Step 2: Create `project_name_mappings` table
- [x] Step 3: Modify uploader to save mappings on batch update
- [x] Step 4: Modify file-handler to apply mappings on upload

### [History] Fix Parking Analysis Counts
- [x] Step 1: Investigation & Plan
- [x] Step 2: Update SPEC.md with clarified logic
- [x] Step 3: Modify `analysis-engine.ts` to separate counting logic from pricing logic
- [x] Step 4: Verify the fix with user data
- [x] Step 5: Fix frontend `reports.js` to include B5_below and Unknown floors in stats

### [Task] Setup Deployment Workflow
- [x] Step 1: Create DEPLOYMENT.md
- [x] Step 2: Create .cursorrules
- [x] Step 3: Verify workflow with a dry run

### [Task] Add Navigation Links
- [x] Step 1: Add "Back to Home" to login.html
- [x] Step 2: Add "Back to Home" to uploader/update.html

### [Task] Setup SEO for index.html
- [x] Step 1: Analyze current tags and content
- [x] Step 2: Implement comprehensive Meta, OG, and Twitter tags
- [x] Step 3: Verify tags implementation

### [Task] Design SEO Cover Image
- [x] Step 1: Generate high-quality dashboard concept art
- [x] Step 2: Update index.html with new image path
- [x] Step 3: Deployment

### [Task] Documentation Maintenance
- [x] Update SPEC.md with SEO specs
- [x] Update ARCHITECTURE.md with DEPLOYMENT.md and image path
- [x] Update PLAN.md
### [History] 開發文件初始化
- [x] 創建 SPEC.md
- [x] 創建 PLAN.md
- [x] 創建 ARCHITECTURE.md
- [x] 創建 .cursorrules

---

## 🔮 待辦事項 (Backlog)

### 高優先級
- [x] 修復「各類型車位平均單價」表格數據錯誤
- [x] PDF 導出優化（A4 格式、新增車位分析頁、修正總價帶資料）
- [x] 建案名稱自動替換功能
- [ ] 3D 車位圖表互動優化
- [ ] 行動版表格滾動優化

### 中優先級
- [ ] 使用者系統引入
- [ ] 我的最愛功能
- [ ] 個人化儀表板

### 低優先級
- [ ] 中古屋數據源
- [ ] 租賃市場數據
- [ ] 價格預測模型

---

## 📅 版本規劃

| 版本 | 預計時間 | 主要功能 |
|------|----------|----------|
| v1.1 | Q4 2025 | 使用者系統、個人化儀表板 |
| v1.2 | Q1 2026 | 中古屋與租賃數據 |
| v2.0 | Q2 2026 | 機器學習價格預測 |

---

## 📝 任務模板

```markdown
### [Task Name] 任務標題
- [ ] Step 1: 描述
- [ ] Step 2: 描述
- [ ] Step 3: 驗證與測試
```
