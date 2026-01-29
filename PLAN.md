# Implementation Plan

## [Current Task] Recovery and Test Deployment
- [ ] Step 1: Commit uncommitted changes to local repository.
- [ ] Step 2: Update ARCHITECTURE.md if necessary (added Remotion files).
- [ ] Step 3: Execute `scripts/deploy_next_trb.sh` to deploy to test environment.
- [ ] Step 4: Verify deployment at https://sqm7.github.io/trb


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
