# System Specification: Access Control & Authentication

## 1. Overview
The system allows users to access the platform using multiple identity providers (LINE, Email). It supports account linking/unlinking to ensure users can transition between login methods while maintaining their profile data.

### 3.4 Admin Features
- **User Management**:
    - **List Users**: View all registered users, their email, roles, and status.
    - **Edit Role**: Promote/Demote users (Admin/Super Admin access required).
    - **Delete User**: Remove user account completely.
        - **Constraint**: Only 'super_admin' and 'admin' can delete users.
        - **Action**: Must remove data from both `auth.users` and `public.profiles`.

## 2. Authentication Methods
- **LINE Login**: Primary method for many users. Uses Supabase Auth with custom OpenID Connect flow via Edge Function (`line-auth`).
- **Email/Password**: Standard Supabase Auth (Identity).
- **Hybrid**: Users can have both LINE and Email bound to the same account.

## 3. Account Binding Rules
- **At least one provider required**: A user cannot unbind a provider if it is their ONLY method of authentication.
- **Email Binding**:
    - Users created via LINE have a placeholder email (`{line_user_id}@line.workaround`).
    - Binding an email replaces this placeholder with a real email address and verifies it immediately (bypassing email confirmation link for better UX in this specific flow).
    - Requires setting a password.
- **LINE Binding**:
    - Can link an existing LINE account to an Email-only user.
    - Can link a new LINE account (if not already used).
- **Unbinding**:
    - **Unbind LINE**: Allowed ONLY if the user has a valid (real) email address.
    - **Unbind Email**: Allowed ONLY if the user has LINE linked. Reverts the account to use the placeholder email.

## 4. User Flows
### 4.1. Unbind LINE
1. User clicks "Unlink" in settings.
2. Frontend checks if `isEmailBound`. Verification needed: `user.email` is not placeholder.
3. Backend (`line-auth`):
    - Validates request token.
    - Checks user's current email.
    - If email is placeholder or missing, RED REJECT ("Must have email bound first").
    - Removes `line_user_id` from metadata.
    - Removes `avatar_url` (optional).
    - Removes LINE identity from `auth.identities`.
    - Updates `app_metadata.providers` to remove 'line'.
    - Returns success.
4. Frontend:
    - Clears LIFF session.
    - Signs out.
    - Redirects to login.

### 4.2. Bind Email
1. User enters Email + Password + Confirm Password.
2. Frontend calls `bind-email` function.
3. Backend `bind-email`:
    - Validates inputs.
    - Updates `auth.users` with new email and password.
    - Sets `email_confirm` to true.
    - Syncs email to `public.profiles`.
4. Frontend refreshes session.
    
## 5. Data Export Features
- **Goal**: Enable users to analyze data in external tools (Google Sheets, Excel).
- **Format**: CSV (Comma Separated Values) with BOM (\uFEFF) for UTF-8 compatibility in Excel.
- **Coverage**: All major charts and data tables on the dashboard must offer an export option.
- **Implementation**:
    - **Format**: CSV with UTF-8 BOM for Excel compatibility.
- **Coverage**: All data tables and key charts must include an "Export to CSV" button.
- **Naming**: Files should be named descriptively (e.g., `sales_velocity_monthly_2024-01-23.csv`).
- **Headers**: Column headers must be localized to Chinese (e.g., "建案名稱" instead of "projectName").
- **View State**: Exported data must mirror the current UI view state (WYSIWYG).
  - If a table row is expanded to show details, the export must include those details inline.
  - If collapsed, the export should only show the summary row.
  - If a chart is showing "Top 30", the export should contain the top 30 items.
- **Permissions**: Feature is restricted to `Pro`, `Pro Max`, `Admin`, and `Super Admin` roles.
  - Non-pro users will see a locked button or permission denied alert.
    - **Content**: Visible data points or underlying dataset for the specific view.

## 6. Report Generation Architecture
- **Philosophy**: "Data -> Template -> Output".
- **Constraint**: DO NOT use client-side screen scraping (e.g., `html2canvas`, DOM cloning).
- **PDF Generation**:
  - Must use a dedicated **Print Template** component.
  - Rendered in a detached context (iframe or new window) using the raw `AnalysisData`.
  - Optimized for **A4 Landscape**.
  - Must not contain UI controls (buttons, scrollbars).
- **PPTX Generation**:
  - Must rely on `PptxGenJS` with a **Strict Template System**.
  - Visuals must be defined in a "Design System" config (Colors, Fonts), separate from logic.
  - Output must contain **Native Editable Charts** (no images of charts).

## 6. Dashboard UX Logic
- **Global Search**: Moved to the left Sidebar to free up Header space.
  - **Collapsed State**: Displays only a Search icon.
  - **Expanded State**: Displays a full-width search input with focus effects.
- **Smart FilterBar**:
  - **Pill Transformation**: When scrolling down (> 100px), the FilterBar collapses into a compact "Pill" fixed at `top-3` (Header area).
  - **Z-Index Strategy**: The compact pill and its parent container must use high z-indices (`z-[70]` and `z-[100]` respectively) to float above the `z-50` Header and other page elements.
  - **Auto-Expansion**: Clicking the compact pill triggers a smooth scroll to the top of the page and expands the full filter panel.
## 7. Custom Report Builder
- **Goal**: Allow users to create personalized report layouts by dragging and dropping dashboard charts onto a canvas.
- **Features**:
  - **Drag & Drop**: Reposition components freely on the canvas.
  - **Resizing**: Adjust width and height of each chart.
  - **Ratio Control**: Toggle between 16:9 and A4 Landscape canvas ratios.
  - **Persistence**: Layout automatically saves to `localStorage`.
  - **Direct Export**: PDF output via browser print dialog, maintaining "Vibe" aesthetic.
- **Workflow**:
  - Users can add components via a sidebar palette.
  - Dashboard charts include an "Add to Report Builder" option in their export dropdown.
- **Architecture**:
  - **State**: Managed via `useReportBuilderStore` (Zustand).
  - **Components**: Built with `react-rnd` for interactive manipulation.
  - **Chart Rendering**: Shared chart components used across both Dashboard and Builder for consistency.
