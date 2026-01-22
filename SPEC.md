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
