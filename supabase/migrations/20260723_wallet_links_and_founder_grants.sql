-- Verified OTT account to XRPL wallet links for secure founder access grants.
-- Run after 20260723_token_research_foundations.sql.
-- A public wallet address alone is never enough to activate a wallet-targeted grant.

create table if not exists public.ott_wallet_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wallet_address text not null check (
    wallet_address ~ '^r[1-9A-HJ-NP-Za-km-z]{25,34}$'
  ),
  status text not null default 'pending' check (
    status in ('pending', 'verified', 'revoked', 'failed')
  ),
  xaman_payload_uuid text,
  verified_at timestamptz,
  revoked_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ott_wallet_link_user_wallet_unique unique (user_id, wallet_address),
  constraint ott_wallet_link_payload_unique unique (xaman_payload_uuid),
  constraint ott_wallet_link_payload_format check (
    xaman_payload_uuid is null
    or xaman_payload_uuid ~*
      '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ),
  constraint ott_wallet_link_verified_state check (
    status <> 'verified'
    or (
      xaman_payload_uuid is not null
      and verified_at is not null
      and revoked_at is null
    )
  )
);

create index if not exists ott_wallet_links_user_status_idx
  on public.ott_wallet_links (user_id, status, updated_at desc);

create index if not exists ott_wallet_links_wallet_status_idx
  on public.ott_wallet_links (wallet_address, status, updated_at desc);

alter table public.ott_wallet_links enable row level security;

drop policy if exists "wallet link owner select"
  on public.ott_wallet_links;

create policy "wallet link owner select"
  on public.ott_wallet_links
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Link creation, verification and revocation are server-controlled after the
-- authenticated OTT session and Xaman payload are checked.

drop trigger if exists ott_wallet_links_set_updated_at
  on public.ott_wallet_links;

create trigger ott_wallet_links_set_updated_at
before update on public.ott_wallet_links
for each row
execute function public.set_ott_updated_at();

-- Prevent duplicate active grants for the same exact account target and scope.
create unique index if not exists ott_access_grants_active_user_scope_unique
  on public.ott_access_grants (target_user_id, access_scope)
  where status = 'active' and target_user_id is not null;

create unique index if not exists ott_access_grants_active_wallet_scope_unique
  on public.ott_access_grants (wallet_address, access_scope)
  where status = 'active' and wallet_address is not null;
