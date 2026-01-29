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
- [x] Update Sidebar UI with "開發中" badges.
- [x] Update documentation (SPEC.md).
