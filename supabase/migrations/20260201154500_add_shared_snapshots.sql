-- Add 'partner' to role check constraint if it exists, or just ensure it's handled in application logic
-- Ideally we check if there is a CHECK constraint on role column in profiles
-- For now, let's create the shared_snapshots table

create table public.shared_snapshots (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references auth.users(id) not null,
  title text not null,
  config_json jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  view_count int default 0
);

-- RLS Policies
alter table public.shared_snapshots enable row level security;

-- Everyone can read snapshots (public access for viewing)
create policy "Public can view shared snapshots"
  on public.shared_snapshots for select
  using (true);

-- Only partners and admins can create snapshots
-- Note: 'partner' role check depends on how role is stored in profiles or metadata
-- Assuming role is in profiles.role or auth.users meta
create policy "Partners and Admins can insert snapshots"
  on public.shared_snapshots for insert
  with check (
    auth.uid() = creator_id and (
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role in ('admin', 'super_admin', 'partner')
      )
    )
  );

-- Only creator or admin can delete
create policy "Creator or Admin can delete snapshots"
  on public.shared_snapshots for delete
  using (
    auth.uid() = creator_id or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'super_admin')
    )
  );
