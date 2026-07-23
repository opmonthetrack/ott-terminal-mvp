-- Founder-reviewed web sources for OTT Token Research.
-- Run after 20260723_token_research_foundations.sql.
-- AI/search output is stored only as a candidate source until a founder verifies it.

create table if not exists public.token_research_sources (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.token_research_requests(id) on delete cascade,
  url text not null check (char_length(url) between 8 and 4000),
  canonical_url text not null check (char_length(canonical_url) between 8 and 4000),
  domain text not null check (char_length(domain) between 1 and 253),
  title text not null default '' check (char_length(title) <= 500),
  source_kind text not null default 'other' check (
    source_kind in (
      'official-legislation',
      'regulator',
      'company-register',
      'project-official',
      'audit-provider',
      'market-provider',
      'news',
      'social',
      'other'
    )
  ),
  authority_level text not null default 'unverified' check (
    authority_level in ('official', 'primary', 'secondary', 'unverified')
  ),
  review_status text not null default 'candidate' check (
    review_status in ('candidate', 'verified', 'rejected', 'conflict')
  ),
  search_focus text not null default 'general' check (char_length(search_focus) <= 120),
  summary text not null default '' check (char_length(summary) <= 8000),
  extracted_claims jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  checked_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint token_research_source_unique_url unique (request_id, canonical_url)
);

create index if not exists token_research_sources_request_idx
  on public.token_research_sources (request_id, review_status, checked_at desc);

create index if not exists token_research_sources_domain_idx
  on public.token_research_sources (domain, authority_level, reviewed_at desc);

alter table public.token_research_sources enable row level security;

-- No browser write policy. Founder/service role performs source review.
-- Applicants may see only founder-verified sources attached to their own case.
drop policy if exists "verified research source owner select"
  on public.token_research_sources;

create policy "verified research source owner select"
  on public.token_research_sources
  for select
  to authenticated
  using (
    review_status = 'verified'
    and exists (
      select 1
      from public.token_research_requests request
      where request.id = request_id
        and request.user_id = auth.uid()
    )
  );

alter table public.token_research_score_items
  add column if not exists source_ids uuid[] not null default '{}';

create or replace function public.validate_ott_research_score_source_links()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if exists (
    select 1
    from unnest(new.source_ids) as source_id
    left join public.token_research_sources source
      on source.id = source_id
     and source.request_id = new.request_id
    where source.id is null
  ) then
    raise exception 'Every linked web source must belong to the same research request.';
  end if;

  return new;
end;
$$;

drop trigger if exists token_research_score_validate_sources
  on public.token_research_score_items;

create trigger token_research_score_validate_sources
before insert or update on public.token_research_score_items
for each row
execute function public.validate_ott_research_score_source_links();

drop trigger if exists token_research_sources_set_updated_at
  on public.token_research_sources;

create trigger token_research_sources_set_updated_at
before update on public.token_research_sources
for each row
execute function public.set_ott_updated_at();
