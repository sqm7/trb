# Implementation Plan

## [Current Task] User Management - Delete Member

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
