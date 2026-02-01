-- Add data_json column to store the actual analysis results at the time of sharing
alter table public.shared_snapshots
add column if not exists data_json jsonb;

-- Update RLS policies just in case, though column addition shouldn't affect existing ones
-- We can also add a comment
comment on column public.shared_snapshots.data_json is 'Snapshot of the analysis data results at the time of link creation';
