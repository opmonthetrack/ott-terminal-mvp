-- OTT Token Research, evidence, public watchlist and founder access grants.
-- Run after the platform, Academy, certificate and Access Pass migrations.
-- Scores are research-evidence scores from 0 to 100, never return predictions.

create table if not exists public.token_research_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_name text not null check (char_length(token_name) between 1 and 120),
  currency_code text not null check (
    currency_code ~ '^[A-Za-z0-9?!@#$%^&*<>()[\]{}|]{3}$'
    or currency_code ~* '^[0-9a-f]{40}$'
  ),
  issuer_address text not null check (
    issuer_address ~ '^r[1-9A-HJ-NP-Za-km-z]{25,34}$'
  ),
  official_website text,
  claimed_country text,
  claimed_legal_entity text,
  claimed_registration_number text,
  requester_summary text not null default '' check (char_length(requester_summary) <= 5000),
  status text not null default 'submitted' check (
    status in (
      'submitted',
      'triage',
      'needs-evidence',
      'in-review',
      'scored',
      'published',
      'rejected',
      'archived'
    )
  ),
  raw_score integer check (raw_score is null or raw_score between 0 and 100),
  final_score integer check (final_score is null or final_score between 0 and 100),
  score_threshold integer not null default 55 check (score_threshold = 55),
  score_cap integer check (score_cap is null or score_cap between 0 and 100),
  score_cap_reason text,
  evidence_confidence text not null default 'insufficient' check (
    evidence_confidence in ('insufficient', 'low', 'medium', 'high')
  ),
  neutral_conclusion text,
  founder_review_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint token_research_request_unique_token_per_user
    unique (user_id, currency_code, issuer_address)
);

create index if not exists token_research_requests_owner_idx
  on public.token_research_requests (user_id, created_at desc);

create index if not exists token_research_requests_queue_idx
  on public.token_research_requests (status, created_at);

create index if not exists token_research_requests_token_idx
  on public.token_research_requests (issuer_address, currency_code);

alter table public.token_research_requests enable row level security;

drop policy if exists "token research owner select"
  on public.token_research_requests;

create policy "token research owner select"
  on public.token_research_requests
  for select
  to authenticated
  using (auth.uid() = user_id);

-- The server creates and updates requests after authenticating the OTT account.
-- Browser users deliberately receive no direct insert/update/delete policies.

create table if not exists public.token_research_score_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.token_research_requests(id) on delete cascade,
  category_id text not null check (
    category_id in (
      'issuer-ledger',
      'legal-jurisdiction',
      'holders-distribution',
      'liquidity-orderbook',
      'whitepaper-product',
      'roadmap-execution',
      'team-transparency',
      'market-data'
    )
  ),
  max_points integer not null check (max_points between 1 and 20),
  awarded_points integer not null default 0 check (
    awarded_points between 0 and max_points
  ),
  evidence_status text not null default 'missing' check (
    evidence_status in ('verified', 'partial', 'unverified', 'missing', 'conflict')
  ),
  rationale text not null default '' check (char_length(rationale) <= 5000),
  evidence_ids uuid[] not null default '{}',
  checked_at timestamptz,
  checked_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint token_research_score_category_unique unique (request_id, category_id)
);

create index if not exists token_research_score_request_idx
  on public.token_research_score_items (request_id, category_id);

alter table public.token_research_score_items enable row level security;

drop policy if exists "token research score owner select"
  on public.token_research_score_items;

create policy "token research score owner select"
  on public.token_research_score_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.token_research_requests request
      where request.id = request_id
        and request.user_id = auth.uid()
    )
  );

-- Extend the existing private research evidence model for token investigations.
alter table public.research_evidence
  add column if not exists token_request_id uuid
    references public.token_research_requests(id)
    on delete cascade,
  add column if not exists source_url text,
  add column if not exists source_title text,
  add column if not exists source_published_at timestamptz,
  add column if not exists source_checked_at timestamptz,
  add column if not exists source_kind text;

alter table public.research_evidence
  drop constraint if exists research_evidence_evidence_kind_check;

alter table public.research_evidence
  add constraint research_evidence_evidence_kind_check
  check (
    evidence_kind in (
      'whitepaper',
      'roadmap',
      'audit',
      'legal',
      'issuer',
      'liquidity',
      'holders',
      'team',
      'market',
      'screenshot',
      'other'
    )
  );

alter table public.research_evidence
  drop constraint if exists research_evidence_source_kind_check;

alter table public.research_evidence
  add constraint research_evidence_source_kind_check
  check (
    source_kind is null
    or source_kind in (
      'user-upload',
      'official-project',
      'xrpl-ledger',
      'company-register',
      'regulator',
      'legislation',
      'audit-provider',
      'market-provider',
      'news',
      'social',
      'other'
    )
  );

create index if not exists research_evidence_token_request_idx
  on public.research_evidence (token_request_id, created_at desc)
  where token_request_id is not null;

create or replace function public.enforce_ott_research_evidence_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.token_request_id is not null and not exists (
    select 1
    from public.token_research_requests request
    where request.id = new.token_request_id
      and request.user_id = new.user_id
  ) then
    raise exception 'Evidence and research request must belong to the same OTT account.';
  end if;

  return new;
end;
$$;

drop trigger if exists research_evidence_enforce_request_owner
  on public.research_evidence;

create trigger research_evidence_enforce_request_owner
before insert or update on public.research_evidence
for each row
execute function public.enforce_ott_research_evidence_owner();

-- Add common evidence formats to the existing private bucket.
update storage.buckets
set
  file_size_limit = 15728640,
  allowed_mime_types = array[
    'application/pdf',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/json',
    'application/rtf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/octet-stream'
  ]
where id = 'research-evidence';

create table if not exists public.token_research_watchlist (
  id uuid primary key default gen_random_uuid(),
  token_name text not null check (char_length(token_name) between 1 and 120),
  currency_code text not null,
  issuer_address text not null check (
    issuer_address ~ '^r[1-9A-HJ-NP-Za-km-z]{25,34}$'
  ),
  status text not null default 'research' check (
    status in ('research', 'monitor', 'documented', 'caution', 'archived')
  ),
  neutral_rationale text not null check (char_length(neutral_rationale) between 20 and 5000),
  evidence_summary text not null default '',
  research_request_id uuid references public.token_research_requests(id) on delete set null,
  is_public boolean not null default false,
  display_order integer not null default 100,
  created_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint token_research_watchlist_token_unique unique (currency_code, issuer_address)
);

create index if not exists token_research_watchlist_public_idx
  on public.token_research_watchlist (is_public, display_order, updated_at desc);

alter table public.token_research_watchlist enable row level security;

drop policy if exists "public token research watchlist select"
  on public.token_research_watchlist;

create policy "public token research watchlist select"
  on public.token_research_watchlist
  for select
  to anon, authenticated
  using (is_public = true and published_at is not null and status <> 'archived');

create table if not exists public.ott_access_grants (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid references auth.users(id) on delete cascade,
  wallet_address text,
  access_scope text not null check (
    access_scope in ('academy-premium', 'wallet-academy', 'research-pro', 'all-premium')
  ),
  status text not null default 'active' check (
    status in ('active', 'revoked', 'expired')
  ),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  reason text not null check (char_length(reason) between 3 and 1000),
  granted_by uuid references auth.users(id) on delete set null,
  revoked_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ott_access_grant_target_required check (
    target_user_id is not null or wallet_address is not null
  ),
  constraint ott_access_grant_wallet_format check (
    wallet_address is null
    or wallet_address ~ '^r[1-9A-HJ-NP-Za-km-z]{25,34}$'
  ),
  constraint ott_access_grant_expiry_after_start check (
    expires_at is null or expires_at > starts_at
  )
);

create index if not exists ott_access_grants_user_idx
  on public.ott_access_grants (target_user_id, access_scope, status, expires_at);

create index if not exists ott_access_grants_wallet_idx
  on public.ott_access_grants (wallet_address, access_scope, status, expires_at)
  where wallet_address is not null;

alter table public.ott_access_grants enable row level security;

drop policy if exists "access grant owner select"
  on public.ott_access_grants;

create policy "access grant owner select"
  on public.ott_access_grants
  for select
  to authenticated
  using (target_user_id = auth.uid());

create table if not exists public.ott_access_grant_events (
  id uuid primary key default gen_random_uuid(),
  grant_id uuid not null references public.ott_access_grants(id) on delete cascade,
  event_type text not null check (
    event_type in ('created', 'extended', 'scope-changed', 'revoked', 'expired', 'used')
  ),
  actor_user_id uuid references auth.users(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ott_access_grant_events_grant_idx
  on public.ott_access_grant_events (grant_id, created_at desc);

alter table public.ott_access_grant_events enable row level security;

drop policy if exists "access grant event owner select"
  on public.ott_access_grant_events;

create policy "access grant event owner select"
  on public.ott_access_grant_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.ott_access_grants grant_record
      where grant_record.id = grant_id
        and grant_record.target_user_id = auth.uid()
    )
  );

create or replace function public.submit_ott_token_research_request(
  p_token_name text,
  p_currency_code text,
  p_issuer_address text,
  p_official_website text default null,
  p_claimed_country text default null,
  p_claimed_legal_entity text default null,
  p_claimed_registration_number text default null,
  p_requester_summary text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_request_id uuid;
begin
  if v_user_id is null then
    raise exception 'An authenticated OTT account is required.';
  end if;

  insert into public.token_research_requests (
    user_id,
    token_name,
    currency_code,
    issuer_address,
    official_website,
    claimed_country,
    claimed_legal_entity,
    claimed_registration_number,
    requester_summary,
    status,
    raw_score,
    final_score,
    score_cap,
    score_cap_reason,
    evidence_confidence
  )
  values (
    v_user_id,
    trim(p_token_name),
    upper(trim(p_currency_code)),
    trim(p_issuer_address),
    nullif(trim(p_official_website), ''),
    nullif(trim(p_claimed_country), ''),
    nullif(trim(p_claimed_legal_entity), ''),
    nullif(trim(p_claimed_registration_number), ''),
    left(coalesce(p_requester_summary, ''), 5000),
    'submitted',
    null,
    null,
    null,
    null,
    'insufficient'
  )
  on conflict (user_id, currency_code, issuer_address)
  do update set
    token_name = excluded.token_name,
    official_website = excluded.official_website,
    claimed_country = excluded.claimed_country,
    claimed_legal_entity = excluded.claimed_legal_entity,
    claimed_registration_number = excluded.claimed_registration_number,
    requester_summary = excluded.requester_summary,
    status = case
      when token_research_requests.status in ('published', 'archived')
        then token_research_requests.status
      else 'submitted'
    end,
    updated_at = now()
  returning id into v_request_id;

  return v_request_id;
end;
$$;

revoke all on function public.submit_ott_token_research_request(
  text, text, text, text, text, text, text, text
) from public, anon;

grant execute on function public.submit_ott_token_research_request(
  text, text, text, text, text, text, text, text
) to authenticated;

-- Keep updated_at consistent through the shared platform trigger function.
drop trigger if exists token_research_requests_set_updated_at
  on public.token_research_requests;
create trigger token_research_requests_set_updated_at
before update on public.token_research_requests
for each row execute function public.set_ott_updated_at();

drop trigger if exists token_research_score_items_set_updated_at
  on public.token_research_score_items;
create trigger token_research_score_items_set_updated_at
before update on public.token_research_score_items
for each row execute function public.set_ott_updated_at();

drop trigger if exists token_research_watchlist_set_updated_at
  on public.token_research_watchlist;
create trigger token_research_watchlist_set_updated_at
before update on public.token_research_watchlist
for each row execute function public.set_ott_updated_at();

drop trigger if exists ott_access_grants_set_updated_at
  on public.ott_access_grants;
create trigger ott_access_grants_set_updated_at
before update on public.ott_access_grants
for each row execute function public.set_ott_updated_at();
