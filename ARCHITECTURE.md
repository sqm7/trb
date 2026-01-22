# Technical Architecture

## 1. Stack Overview
- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, Shadcn UI.
- **Backend / BaaS**: Supabase (Auth, Database, Edge Functions).
- **Hosting**: Vercel (Frontend), Supabase (Edge Functions).

## 2. Directory Structure
```
/
├── next-app/           # Next.js Application
│   ├── src/
│   │   ├── app/        # App Router Pages
│   │   ├── components/ # React Components
│   │   ├── lib/        # Utilities & Config
│   │   └── ...
├── supabase/
│   ├── functions/      # Deno Edge Functions
│   │   ├── line-auth/  # Custom LINE Login & Linking
│   │   ├── bind-email/ # Email Binding & Unbinding
│   │   └── ...
│   ├── migrations/     # Database Schema
│   └── ...
├── SPEC.md             # Functional Specification
├── PLAN.md             # Execution Plan
├── ARCHITECTURE.md     # This file
└── .cursorrules        # Coding Standards
```

## 3. Database Schema (Key Tables)
### `auth.users` (Supabase System)
- `email`: User's primary email.
- `encrypted_password`: Hashed password.
- `user_metadata`: Stores `full_name`, `line_user_id`, `avatar_url`.
- `app_metadata`: Stores `provider`, `providers`.

### `public.profiles`
- `id`: FK to `auth.users.id`.
- `full_name`: Display name.
- `email`: Synced copy of user email for easier querying.
- `created_at`, `updated_at`.

## 4. Key Components
### Authentication
- **`bind-email` Edge Function**: Handles privileged user updates that standard client libraries can't do easily (e.g. bypassing email verification, unbinding to placeholder).
- **`line-auth` Edge Function**: Verifies LINE ID tokens, handles custom signup/login flows, references `line_user_id` in metadata.

### Frontend State
- **User Context**: derived from `supabase.auth.getSession()`.
- **Binding Status**: Calculated from `user.email` (placeholder check) and `user.app_metadata` / `identities`.
