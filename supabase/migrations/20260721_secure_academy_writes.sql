-- Academy completions can unlock certificate eligibility.
-- They must never be writable directly from an authenticated browser session.

drop policy if exists "Users can insert their own Academy completions" on public.academy_completions;
drop policy if exists "Users can update their own Academy completions" on public.academy_completions;

alter table public.academy_completions
  add column if not exists verified_by text not null default 'server-ai',
  add column if not exists verification_model text,
  add column if not exists assessment_version text not null default '1.0';

-- Legacy local wallet results are preserved separately. They are not certificate-eligible
-- until the learner passes the current server-side assessment under an OTT account.
create table if not exists public.academy_legacy_imports (
  user_id uuid not null references auth.users(id) on delete cascade,
  wallet_address text not null check (wallet_address ~ '^r[1-9A-HJ-NP-Za-km-z]{25,34}$'),
  course_id text not null,
  overall_score integer not null check (overall_score between 0 and 100),
  xp integer not null default 0 check (xp >= 0),
  credits integer not null default 0 check (credits >= 0),
  assessments jsonb not null default '[]'::jsonb,
  legacy_completed_at timestamptz not null,
  imported_at timestamptz not null default now(),
  status text not null default 'needs_reassessment' check (
    status in ('needs_reassessment', 'reassessed', 'dismissed')
  ),
  primary key (user_id, wallet_address, course_id)
);

alter table public.academy_legacy_imports enable row level security;

create policy "Users can view their own Academy legacy imports"
  on public.academy_legacy_imports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own Academy legacy imports"
  on public.academy_legacy_imports for insert
  with check (auth.uid() = user_id and status = 'needs_reassessment');

create policy "Users can update their own Academy legacy import status"
  on public.academy_legacy_imports for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists academy_legacy_imports_user_id_idx
  on public.academy_legacy_imports(user_id);
