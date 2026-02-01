-- Index for fast cleanup
create index if not exists idx_shared_snapshots_expires_at on public.shared_snapshots(expires_at);

-- Function to cleanup expired snapshots
-- This can be called periodically or triggered by the create-snapshot edge function
create or replace function public.cleanup_expired_snapshots()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.shared_snapshots
  where expires_at < now();
end;
$$;
