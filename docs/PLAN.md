# Implementation Plan

## [Current Task] Recovery and Test Deployment
- [x] Step 1: Commit uncommitted changes to local repository.
- [x] Step 2: Update ARCHITECTURE.md if necessary (added Remotion files).
- [x] Step 3: Execute `scripts/deploy_next_trb.sh` to deploy to test environment.
- [x] Step 4: Verify deployment at https://sqm7.github.io/trb


## [Current Task] Report Builder Bug Fixes

### Step 1: Implementation
- [x] 修復圖片匯出 oklch 色彩錯誤
- [x] 修復批次拖移邏輯
- [x] 修復按鈕文字截斷問題

## [Current Task] Documentation & Finalization
- [x] Create `AGENT_SKILLS_GUIDE.md` <!-- id: 7 -->
- [x] Final summary and cleanup <!-- id: 4 -->
- [x] Deploy to Test Environment.
- [x] Fix empty state link (404 issue).
- [x] Enhance drag-over visual feedback.

## [Current Task] Add Agent Skill: vercel-react-native-skills
- [x] Step 1: Execute skill installation command
- [x] Step 2: Verify skill availability
- [x] Step 5: Create `/react-native` workflow link
- [x] Step 6: Create `AGENT_SKILLS_GUIDE.md` documentation
- [x] Step 3: Update ARCHITECTURE.md with new capability
- [x] Step 4: Consolidate `.agent` and `.agents` directories

## [Current Task] Mobile Web Optimization & Repair
- [x] Analyze `vercel-react-native-skills` applicability to Next.js.
- [x] Fix Build Error (CssSyntaxError/package.json)
- [x] Create Implementation Plan
- [x] Implement Mobile Optimizations (PWA, Viewport, Touch Targets)
- [x] Verify Mobile Layout

## [Current Task] Fix Mobile Sidebar Z-Index Conflict
- [x] Identify z-index values in Header.tsx and FilterBar.tsx
- [x] Increase Header z-index to z-[110] when open
- [x] Ensure mobile menu overlay sits on top
- [x] Adjust FilterBar compact mode to z-[100] (staying below menu)
- [x] Verify fix on mobile viewport

## [Current Task] Report Builder UI/UX Optimizations
- [x] Increase sidebar width to w-80.
- [x] Change Component Palette to 2-column grid.
- [x] Implement auto-page switching on drag-drop.
- [x] Enhance tab hover scale factor (1.1).
- [x] Improve "Cross-page move" label trigger logic.
- [x] Deploy to frontend test version (trb).

## [Current Task] Data Alchemy Remotion Video (90秒)
- [x] Phase 1: Base architecture + Scene 1 (Chaos Mine) + Scene 7 (Brand Imprint)
- [x] Phase 2: Scene 2 (Alchemy Start) + Scene 3 (Data Refinery)
- [x] Phase 3: Scene 4 (Crystal Room) + Scene 5 (Gold Casting) + Scene 6 (Value Reveal)
- [x] Phase 4: Integration + Verification
- [ ] Render final MP4 video

## [Current Task] Report Builder Keyboard Shortcuts
- [x] Implement keyboard "Delete/Backspace" to remove selected items
- [x] Add visual feedback or confirmation for deletion
- [x] Deploy to test environment (trb)

## [Current Task] Refine Data Alchemy Video
- [x] Step 1: **Scene 1 Refinement (Chaos Mine)** - Enhance particle types (icons), deep-dive camera effect, and light beam timing.
- [x] Step 2: **Scene 2 Construction (Alchemy Start)** - Implement Alchemy Array logo animation, pulse effect, and particle suction funnel.
- [x] Step 3: **Scene 3 Construction (Data Refinery)** - Build transparent furnace, Taiwan map projection, impurity separation (Grey vs Cyan).
- [x] Step 4: **Scene 4 Construction (Crystal Room)** - Animate Liquid -> Bar Chart -> Heatmap -> Radar Lock transitions.
- [x] Step 5: **Scene 5 Construction (Gold Casting)** - Melt crystals to gold liquid, mold injection, and light burst.
- [x] Step 6: **Scene 6 Construction (Value Reveal)** - Floating Decision Gem with orbiting success indicators.
- [x] Step 7: **Scene 7 Construction (Brand Imprint)** - Extreme close-up of Gem reflecting "Pingmi" logo.
- [x] Step 8: **Verification** - Verify all transitions and render full video preview.

### [Current Task] Enhance Report Builder UX
- [x] Step 1: Implement Canvas Zoom Logic in `useReportBuilderStore`.
  - Add `zoomLevel` state (default 100%, range 25%-200%).
  - Add `setZoomLevel` action.
- [x] Step 2: Update `EditorCanvas` component.
  - Apply `transform: scale()` CSS based on zoom level.
  - Implement Mouse Wheel event listener (Cmd/Ctrl + Scroll) for zooming.
  - Ensure Drag & Drop coordinates are adjusted for the zoom factor.
- [x] Step 3: Add Zoom Controls UI.
  - Create floating controls (bottom-right or top-right) with +, -, Reset buttons, and % display.
- [x] Step 4: Enhance Page Tab Draggability.
  - Refactor `SortableTab` to make the wrapper the drag handle.
  - Ensure the "Delete X" button has `data-no-dnd` or `onPointerDown` stop propagation to prevent dragging when deleting.

### [Current Task] Feature Refinement: View Mode & Drag
- [x] Implement View Mode Toggle (Single vs Continuous).
- [x] Fix Drag-to-Tab ID conflicts.
- [x] Enable direct Drag-to-Canvas in Continuous Mode.
- [x] Add "Cross-Page Moving" visual feedback.
- [x] Fix same-page drag snap-back issue.
- [x] Fix auto-zoom reset on page switch.
- [x] Implement multi-page batch image export with selection modal.

## [Current Task] Report Builder and Map Access Control
- [x] Implement Access Control for Report Builder (`useAdminAuth`).
- [x] Implement Access Control for Map Mode (`useAdminAuth`).
- [x] Update Sidebar UI with "開發中" (Dev) badges.
- [x] Update Documentation (SPEC.md, ARCHITECTURE.md).

## [Current Task] Analysis Reports Documentation
- [x] Step 1: Audit existing report modules in `src/components/reports/`.
- [x] Step 2: Create development documentation for all 8 report modules in `docs/reports/`.
- [x] Step 3: Update `SPEC.md` to index and link to the new documentation.
- [x] Step 4: Update `.cursorrules` to mandate documentation synchronization.

## [Current Task] Supabase Edge Functions Documentation
- [x] Step 1: Audit all 14 Supabase Edge Functions.
- [x] Step 2: Create comprehensive docs in `docs/edge-functions/` (Analyze, Auth, Admin, Query).
- [x] Step 3: Update `.agent/rules/vibe-coding-protocol.md` to mandate Edge Function doc synchronization.

## [Current Task] Workspace & Rules Consolidation
- [x] Step 1: Migrate `.cursorrules` to `.agent/rules/vibe-coding-protocol.md` (Source of Truth).
- [x] Step 2: Consolidate root `*.md` documents into `docs/` folder.
- [x] Step 3: Clean up empty or redundant directories (`manual_deploy`, `temp_deploy`, legacy docs).
- [x] Step 4: Verify Multi-IDE synchronization protocol (`sync_ide_configs.sh`).


## [Current Task] Synchronize Room Type Filters
- [x] Standardize `ROOM_TYPE_OPTIONS` in `useFilterStore`.
- [x] Update `PriceBandReport` to use shared options.
- [x] Update `SalesVelocityReport` to use shared options.
- [x] Add "厂辦/工廠" to filter options.
- [x] Unify filter UI label "分析房型:".

## [Current Task] Floating Room Filter Implementation
- [x] Create `FloatingRoomFilter` component (Vertical stack, left-aligned).
- [x] Integrate with `PriceBandReport` (Add Anchor ID).
- [x] Integrate with `SalesVelocityReport` (Add Anchor ID).
- [x] Implement Intersection Observer logic for auto-show/hide.
- [x] Verify UI/UX (Avoid sidebar overlap, compact styling).
- [x] Verify build and deploy readiness.
- [x] Deploy to Test Version (trb).
## [Current Task] Heatmap Side-Panel Layout & Optimization
- [x] Implement side-by-side layout in `SalesVelocityReport.tsx`.
- [x] Refactor heatmap details into compact card-based UI.
- [x] Implement "Width Freezing" strategy to prevent ApexCharts resize lag during transitions.
- [x] Fix page crash caused by global resize event loop.
- [x] Update documentation (SPEC.md).
- [x] Final commit.

## [Current Task] Refactor Unit Price Analysis Layout
- [x] Modify `UnitPriceAnalysisReport.tsx` to use grid/flex layout for side-by-side charts.
- [x] Ensure "Project Type Comparison" and "Bubble Chart" are adjacent.
- [x] Verify responsiveness.
- [x] Refine UI: Reduce table column width (140px) & Increase chart height (500px).
- [x] Fix Y-axis alignment and height coverage in coordinate mode.

## [Current Task] Sidebar & Table UI Refinement
- [x] Update Sidebar Logo to new version and link to `/`.
- [x] Ensure "Member Login" nav item is persistent in sidebar.
- [x] Limit `TypeComparisonTable` to 10 rows with scroll and sticky header.
- [x] Align Comparison Table and Bubble Chart heights.
- [x] Layout `UnitPriceStatsBlock` in a single row (3 cols).
- [x] Implement layout-stable "Pill Mode" in `FilterBar` (using ResizeObserver).
- [x] Remove redundant legend in `ParkingAnalysisReport`.
- [x] Align Heatmap height to match 600px scrollable Detail Panel in Sales Velocity report.
- [x] Increase Sales Velocity detail transactions limit to 10.
- [x] Optimize Export Button layout (Closer to input on left, Integrated in header on right).
- [x] Heatmap UI Refinement: Hide 0 values, optimize Y-axis integer labels, and support 0.5 step intervals.

## [Current Task] 3D Parking Visualization Refinement
- [x] Step 1: Implement 3D Stack model in `ParkingStack3D.tsx`.
- [x] Step 2: Implement "Glossy" material and corrected isometric angles.
- [x] Step 3: Implement conditional visibility linked to checkbox selection.
- [x] Step 4: Fix 3D seam artifacts using overlapping face geometry.
- [x] Step 5: Implement 2D Label Overlay for robust billboard text rendering.
- [x] Step 6: Solve clipping issues by enabling `overflow-visible` in parent container.
- [x] Step 7: Refine Visuals (Dynamic Scaling, Portal Labels, Contrast Shading).
- [x] Step 8: Final Documentation sync and commit.
- [x] Step 9: Deploy to Test Version (trb) and Backup.
- [x] Step 10: Fix DataList infinite reload loop mechanism.
