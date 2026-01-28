# Implementation Plan

## [Current Task] Standardize Price Band Report Export Buttons

### Step 1: Implementation
- [x] Rename "匯出圖表" to "匯出" in Price Band Chart section.
- [x] Rename "匯出表格" to "匯出" in Detail Table section and add `chartType`.
- [x] Rename "匯出分佈表" to "匯出" in Location Table section and add `chartType`.
- [x] Add "匯出" button to Location Chart section with `price-band-location-chart` chartType.

## [Current Task] Deployment to Test Environment

### Step 1: Execution
- [x] Run `scripts/deploy_next_trb.sh` to push updates to TRB test environment.

## [Current Task] Alchemy of Data (Web Edition)

### Step 1: Implementation
- [x] Create `src/components/animations/AlchemyOfDataWeb.tsx` using `framer-motion`.
- [x] Replicate the 5 narrative scenes (Dust, Lattice, Crown, Ripples, Diamond).

### Step 2: Deployment
- [x] Add a hidden route `/alchemy` to preview the animation.
- [x] Ensure it doesn't break the build (no missing deps).
- [x] Integrate `AlchemyOfDataWeb` into the Login Page (`src/app/page.tsx`) background.

### Step 3: Deployment
- [x] **[Ops]** Deploy Web Edition to Test Environment (TRB).

## [Current Task] Investigation: Missing Animations

### Step 1: Investigation & Fix
- [x] Investigate `src/app/page.tsx` for missing usages.
- [x] **[Fix]** Add `ScannerBackground` to `src/app/page.tsx` within the fixed background container.
- [x] **[Verify]** Ensure z-index layering is correct (Background Image < Scanner < Alchemy < Gradient).
- [x] **[Ops]** Deploy animation restoration to Test Environment (TRB).
- [x] **[Feature]** Add "Replay Brand Intro" button to Login Page footer.
- [x] **[Ops]** Deploy updates (Replay + Scanner Fix) to Test Environment (TRB).

- [x] **[UI]** Remove redundant copyright and background alchemy animation.

## [Completed Task] Alchemy of Data (Web Edition)

### Step 1: Setup & Dependencies
- [x] Install `remotion` dependencies. (Blocked by local NPM auth)
- [x] Check local Remotion rules (animations, timing).

### Step 2: Implementation (AlchemyOfData.tsx)
- [x] Create `remotion/AlchemyOfData.tsx`.
- [x] Scene 1: Dust in the Fog (Particles).
- [x] Scene 2: Etchings of Law (Ring & Grid).
- [x] Scene 3: Ascension of the Crown (3D Columns).
- [x] Scene 4: Pulsating Heat (Heatmap Ripples).
- [x] Scene 5: Inheritance of Wisdom (Diamond Core).

### Step 3: Registration
- [x] Register Composition in `remotion/index.ts` (or equivalent).


### Step 2: Fix Sidebar Overlay
- [x] **[UI]** Increase `Sidebar` z-index to prevent overlapping with Header animations.

### Step 3: Add Dashboard Animations
- [x] **[Motion]** Add `framer-motion` entry animations to Dashboard tabs in `src/app/dashboard/page.tsx`.

### Step 4: Deployment
- [x] **[Ops]** Deploy to Test Environment (TRB).

## [Completed Task] User Management - Delete Member

User is unable to unbind LINE even after binding an email. We suspect a state synchronization issue or a logic gap in how the backend validates the "Email Bound" status.

### Step 1: Diagnose Backend State
- [x] Add detailed logging to `line-auth/index.ts` to inspect the `user` object retrieved from `auth.getUser()`.
- [x] Specifically verify the value of `user.email` and `user.app_metadata` during the unlink request.

### Step 2: Verify `bind-email` Effects
- [x] Check if `bind-email` correctly updates `app_metadata`. If not, it might leave `provider` or `providers` in an inconsistent state.
- [x] Ensure `bind-email` updates are immediately visible to subsequent requests.

### Step 3: Fix `line-auth` Unlink Logic
- [x] Update `line-auth` to be more robust in detecting a real email.
- [x] Ensure it doesn't falsely warn about "No Email" if the email is valid.

### Step 4: Frontend Verification
- [x] Review `settings/page.tsx` for any potential race conditions where the UI shows "Bound" but the token is stale (though `refreshSession` should handle this).

### Step 6: Fix Persistent LINE Login (New)
- [x] Analyze `line-auth` login logic: does it match by email if `line_user_id` is missing?
- [x] Ensure `line-auth` unlink fully removes the association, preventing re-login.
- [x] Modify `line-auth` to strictly require `line_user_id` metadata match for existing users, or handle email collision correctly (i.e., if email exists but not linked, should it auto-link? NO, it should error or ask for password).
- [ ] **[Frontend]** Locate and verify Login component's error handling for `line-auth` calls. Ensure it displays the "Unlinked" error to the user.

### Step 7: Extreme Debugging (Current)
- [x] Add rigorous try-catch blocks and logging to EVERY step of the `unlink` action in `line-auth`.
- [ ] Verify if `deleteUserIdentity` is actually deleting the identity.
- [ ] Check if `updateUserById` is silently failing or if Supabase is restoring the metadata somehow.
### Step 7: Extreme Debugging (Current)
- [x] Add rigorous try-catch blocks and logging to EVERY step of the `unlink` action in `line-auth`.
- [x] Verify if `deleteUserIdentity` is actually deleting the identity.
- [x] Check if `updateUserById` is silently failing or if Supabase is restoring the metadata somehow.
- [x] Add rigorous try-catch blocks and logging to EVERY step of the `unlink` action in `line-auth`.
- [x] Verify if `deleteUserIdentity` is actually deleting the identity.
- [x] Check if `updateUserById` is silently failing or if Supabase is restoring the metadata somehow.
- [x] Return the FULL error object and interim states in the response to the frontend for visibility.

### Step 8: Sync Provider State
- [x] Modify `line-auth` to explicitly update `app_metadata.provider` to 'email'.
- [x] Check if `public.profiles` has a `provider` column and update it if so. (Updated to target `provider`, `line_user_id`, `avatar_url`).

### User Management - Delete Member
- [/] **[Backend]** Create `delete-user` Edge Function.
    - [x] Input: `target_user_id`.
    - [x] Security: Verify caller is `admin` or `super_admin`.
    - [x] Logic: Call `supabase.auth.admin.deleteUser(id)`. Verify `public.profiles` cleanup.
    - [x] Logic: Call `supabase.auth.admin.deleteUser(id)`. Verify `public.profiles` cleanup.
- [x] **[Ops]** Deploy `delete-user` function.
- [x] **[Frontend]** Update `src/app/admin/members/page.tsx`.
    - [x] Add "Delete" button to user row.
    - [x] Add confirmation modal (Double check before delete).
    - [x] Call `delete-user` function.
    - [x] Refresh list on success.
- [x] **[Verification]** Verify deletion removes user from list and database.

### File Structure Cleanup
- [x] Move legacy vanilla JS/HTML files to `_legacy_backup`.
- [x] Remove root-level clutter (images, css, js folders).
- [x] Ensure `next-app` and `supabase` remain as core directories.

### Step 9: Workspace Cleanup & Commit
- [x] Remove duplicate documentation files (`PLAN 2.md` etc).
- [x] Commit all changes.

### Step 10: RWD Verification (Mobile)
- [x] Check Landing Page layout on mobile.
- [x] Check Settings/Member pages on mobile.
- [x] Check Complex Reports (Charts/Tables) on mobile.

### Step 11: Fix Mobile Navigation
- [x] Update `Header.tsx` to include missing sidebar items:
    - [x] System Settings (/settings)
    - [x] System Announcements (/announcements)
    - [x] Admin Interface (conditional)
    - [x] User Profile & Logout
- [x] Re-verify mobile menu.

### Step 12: Deployment
- [x] Deploy to Test Environment (TRB).
- [x] Deploy to Production Environment (PROD).

### Step 13: Google Sheets Export Implementation
- [x] Create Reusable `ExportButton` component.
- [x] Integrate `ExportButton` into `RankingReport` (Chart & Table).
- [x] Integrate `ExportButton` into `PriceBandReport` (Chart & Table).
- [x] Integrate `ExportButton` into `UnitPriceAnalysisReport` (Bubble Chart & Comparison Table).
- [x] Integrate `ExportButton` into `HeatmapReport` (Heatmap transactions).
- [x] Integrate `ExportButton` into `PolicyTimelineReport` (Policy Comparison Table).
- [x] Integrate `ExportButton` into `SalesVelocityReport` (Chart, Table, Heatmap, Modal).
- [x] Integrate `ExportButton` into `ParkingAnalysisReport` (Charts, Tables, Modals).
- [x] Integrate `ExportButton` into `DataListReport` (Main Table, Sub Table).
- [x] **[Refinement]** Implement Chinese Column Headers for all reports.
- [x] **[Refinement]** Implement "WYSIWYG" export for `PriceBandReport` (Expand/Collapse sync).
- [x] **[Refinement]** Implement Column Alignment (Text) and Number Formatting (Area vs Price).
- [x] **[Refinement]** Restrict Export feature to Pro/Admin users only (Permission Gate).
- [x] Verify build success.
- [x] Deploy updates to Test Environment.

### [Current Task] Refine Export Button Tooltip
- [x] Update `ExportButton.tsx` tooltip text for non-pro users to "Pro會員才能用".

### [Current Task] Fix Export Button Tooltip Visibility
- [x] Verify `ExportButton.tsx` issue with disabled state.
- [x] Modify `ExportButton.tsx` to not use native `disabled` attribute for permission check, ensuring tooltip works.
- [x] Implement proper `Tooltip` component (Radix UI) to guarantee visibility on all devices.

### [Current Task] Deployment
- [x] Deploy updates to Test Environment (TRB).

### [Current Task] Implement Membership Upgrade Link
- [x] Create `src/app/pricing/page.tsx` with attractive breakdown of Free vs Pro features.
- [x] Update `ExportButton.tsx` to include a link to `/pricing` in the tooltip.
- [x] Ensure tooltip content is interactive (clickable).

### [Current Task] Enhance Navigation
- [x] Add "Membership" link to `Sidebar` implementation.
- [x] Wrap `pricing/page.tsx` in `AppLayout` to show Header/Footer.

### [Current Task] Branding Update
- [x] Replace `icon.jpg` with high-quality `icon.png` in metadata and UI.
- [x] Update `Sidebar` and `Login` pages to display the new logo.
- [x] Fix image 404 on GitHub Pages (add base path).
- [x] Style logo as circular (`rounded-full`).

### [Current Task] Unify Member Terminology
- [x] Rename "Standard Member" to "General Member" (一般會員) in `settings/page.tsx`.
- [x] Update `settings/page.tsx` to dynamically show actual role (Super Admin, Admin, PRO, PRO MAX).
- [x] Deploy to Test Environment (TRB).

### [Current Task] Admin Private Messaging
- [x] Create SQL migration to add `target_user_id` to `announcements` and update RLS.
- [x] Update `admin/announcements/page.tsx` to support sending private messages (User Search).
- [x] Update `announcements/page.tsx` (User View) to filter private messages securely.
- [x] Notify user to apply database migration.
- [x] Deploy to Test Environment (TRB).

### [Current Task] Mobile RWD Fixes & Skills Installation
- [x] Review and fix `Sidebar` and `Header` mobile layout.
- [x] Inspect `Landing Page` for horizontal overflow.
- [x] Improve `ExportButton` and Table/Chart responsiveness on small screens.
- [x] Verify functionality of interactive elements (modals, dropdowns) on mobile.
- [x] Install Stitch skills (react-components, design-md, stitch-loop).
- [x] Install Remotion best practices skill.
- [x] Implement micro-animations for Login page (Scanner, Staggered entry).
- [x] Create Animated BentoCard graphics (Price bars, Heatmap).
- [x] Create Cinematic Feature Promo Overlay.
- [x] Provide Remotion video template (`remotion/MarketReport.tsx`).
- [x] Create High-End Brand Image Animation (Cinematic Intro).
- [x] Deploy to Test Environment (TRB).



### [Current Task] Fix Double Scrollbar
- [x] Analyze cause: inner div `overflow-x-hidden` causing vertical scroll context.
- [x] Fix: Move `overflow-x: hidden` to global `body`.
- [x] Fix: Remove `overflow-x-hidden` from `page.tsx`.
- [x] Deploy to Test Environment (TRB).

## [Completed Task] Dashboard UX Refinements (Current)
- [x] **[Sidebar]** Move Global Search from Header to Sidebar.
    - [x] Implement toggleable search bar in `Sidebar.tsx`.
    - [x] Fix overlapping search icons in collapsed mode.
- [x] **[Header]** Remove Global Search from `Header.tsx`.
- [x] **[FilterBar]** Implement Smart Compact Mode.
    - [x] Add scroll detection and automatic pill transformation.
    - [x] Implement summary text generation for active filters.
    - [x] Fix positioning and z-index conflict with Header (`z-[70]` in `top-3`).
    - [x] Implement "click-to-expand" with auto-scroll to top.
- [x] **[Ops]** Deploy refinements to Test Environment (TRB).

## [Completed Task] Reports Reliability Fixes
- [x] **[Fix]** Add `error.tsx` boundary to `/reports`.
- [x] **[Fix]** Safe navigation for `.toFixed()` in `RankingSlide.tsx` and `UnitPriceSlide.tsx`.
- [x] **[Fix]** Correct data passing logic in `ReportsPage.tsx` for `RankingSlide` and `SalesVelocitySlide`.
- [x] **[Ops]** Manually deploy fixes to Test Environment (TRB) bypassing script hang.

## [Completed Task] Refactor Report Generation
### Step 1: Design System & Architecture
- [x] Define `ReportData` schema and shared Design Tokens (Colors, Fonts) in `src/lib/report-design-system.ts`.
- [x] Ensure strict typing for all report data sources.

### Step 2: PDF Template Engine
- [x] Create `PrintableReport` component (A4 Landscape optimized).
- [x] Implement `handleDownloadPDF` using **New Window + Print** strategy (No DOM cloning).
- [x] Verify PDF output is clean, vector-based, and matches the "Vibe" aesthetic.

### Step 3: PPTX Template Engine
- [x] Refactor `pptx-generator.ts` to use `PPTXTemplate` class pattern.
- [x] Apply `ui-ux-pro-max` design principles to slide layouts.
- [x] Ensure all charts are natively editable.

### Step 4: Verification
- [x] Verify both outputs with real data.
- [x] Deploy to Test Environment.

## [Completed Task] Report Builder (Custom Report Editor)
### Step 1: Core Infrastructure
- [x] Create `/reports/builder` page with drag-and-drop canvas.
- [x] Implement `DraggableChart` component using `react-rnd`.
- [x] Implement `ComponentPalette` for adding charts to canvas.
- [x] Implement `Canvas` component with ratio settings (16:9, A4).

### Step 2: State Management
- [x] Create `useReportBuilderStore.ts` (Zustand with persist).
- [x] Implement state persistence to `localStorage`.
- [x] Add actions: `addItem`, `updateItem`, `removeItem`, `clearCanvas`.

### Step 3: Export Integration
- [x] Add PDF export from canvas via print dialog.
- [x] Add `chartType` prop to `ExportButton.tsx`.
- [x] Add "新增到報表編輯器" dropdown option.
- [x] Integrate into `RankingReport`, `PriceBandReport`, `SalesVelocityReport`, `UnitPriceAnalysisReport`.

### Step 4: Multi-page & UI Enhancements
- [x] Implement multi-page support in `useReportBuilderStore`.
- [x] Add page navigation (Tabs, Add/Delete Page) in Builder UI.
- [x] Refactor `ExportButton` to use Radix UI `DropdownMenu`.
- [x] Add toast notifications via `sonner`.
- [x] Ensure all reports have "Add to Report Builder" functionality.
- [x] Deploy to Test Environment (TRB).

## [Completed Task] Global Export Button Unification
### Step 1: Standardization
- [x] Audit all reports for export button consistency.
- [x] Update `useReportBuilderStore.ts` with new ChartTypes (`ranking-table`, `sales-velocity-table`, etc.).
- [x] Update `DraggableChart.tsx` to support rendering new table types.
- [x] Standardize `RankingReport` export buttons.
- [x] Standardize `SalesVelocityReport` export buttons.
- [x] Standardize `PriceBandReport` export buttons.
- [x] Standardize `UnitPriceAnalysisReport`, `HeatmapReport`, `ParkingAnalysisReport` export buttons.
- [x] Fix build errors (Type definitions).
- [x] Deploy and Verify.
