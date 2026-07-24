-- Public OTT wallet integration testing, provider confidence and tester-pass eligibility.
-- Run after 20260723_wallet_links_and_founder_grants.sql and the NFT lifecycle migrations.
-- All challenge, proof and reward writes remain service-role controlled.

alter table public.ott_wallet_links
  add column if not exists provider_id text not null default 'xaman',
  add column if not exists network text not null default 'mainnet',
  add column if not exists verification_method text not null default 'signed',
  add column if not exists proof_transaction_hash text,
  add column if not exists last_tested_at timestamptz;

alter table public.ott_wallet_links
  drop constraint if exists ott_wallet_link_verified_state;

alter table public.ott_wallet_links
  add constraint ott_wallet_link_provider_allowed check (
    provider_id in ('xaman', 'crossmark', 'gemwallet', 'walletconnect', 'joey', 'katz', 'metamask-xrpl', 'ledger')
  ),
  add constraint ott_wallet_link_network_allowed check (
    network in ('mainnet', 'testnet', 'devnet')
  ),
  add constraint ott_wallet_link_verification_allowed check (
    verification_method in ('signed', 'provider')
  ),
  add constraint ott_wallet_link_proof_hash_format check (
    proof_transaction_hash is null or proof_transaction_hash ~* '^[0-9a-f]{64}$'
  ),
  add constraint ott_wallet_link_verified_state check (
    status <> 'verified'
    or (
      verified_at is not null
      and revoked_at is null
      and (
        xaman_payload_uuid is not null
        or proof_transaction_hash is not null
      )
    )
  );

create unique index if not exists ott_wallet_links_active_provider_unique
  on public.ott_wallet_links (user_id, provider_id, wallet_address)
  where status = 'verified';

create table if not exists public.wallet_provider_certifications (
  provider_id text primary key check (
    provider_id in ('xaman', 'crossmark', 'gemwallet', 'walletconnect', 'joey', 'katz', 'metamask-xrpl', 'ledger')
  ),
  technical_score integer not null default 0 check (technical_score between 0 and 85),
  minimum_validated_tests integer not null default 5 check (minimum_validated_tests between 1 and 100),
  public_testing_enabled boolean not null default false,
  auto_certify boolean not null default false,
  status text not null default 'planned' check (status in ('live', 'beta', 'planned', 'paused')),
  notes text,
  updated_at timestamptz not null default now()
);

insert into public.wallet_provider_certifications (
  provider_id, technical_score, minimum_validated_tests, public_testing_enabled, auto_certify, status, notes
)
values
  ('xaman', 85, 1, true, true, 'live', 'Existing Xaman payload and server-return verification.'),
  ('crossmark', 70, 5, true, true, 'beta', 'Official SDK connector; public validated proofs complete the release gate.'),
  ('gemwallet', 70, 5, true, true, 'beta', 'Official provider API; public validated proofs complete the release gate.'),
  ('walletconnect', 30, 5, false, false, 'planned', 'Requires Reown project configuration and namespace validation.'),
  ('joey', 25, 5, false, false, 'planned', 'Enabled through the reviewed WalletConnect transport.'),
  ('katz', 25, 5, false, false, 'planned', 'Enabled through the reviewed WalletConnect transport.'),
  ('metamask-xrpl', 25, 5, false, false, 'planned', 'Requires isolated XRPL Snap review and signing proof.'),
  ('ledger', 20, 5, false, false, 'planned', 'Requires reviewed hardware transport and device confirmation flow.')
on conflict (provider_id) do update set
  technical_score = excluded.technical_score,
  minimum_validated_tests = excluded.minimum_validated_tests,
  public_testing_enabled = excluded.public_testing_enabled,
  auto_certify = excluded.auto_certify,
  status = excluded.status,
  notes = excluded.notes,
  updated_at = now();

create table if not exists public.wallet_test_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_id text not null references public.wallet_provider_certifications(provider_id),
  wallet_address text not null check (wallet_address ~ '^r[1-9A-HJ-NP-Za-km-z]{25,34}$'),
  network text not null default 'mainnet' check (network = 'mainnet'),
  destination_wallet text not null check (destination_wallet ~ '^r[1-9A-HJ-NP-Za-km-z]{25,34}$'),
  amount_drops bigint not null default 1 check (amount_drops = 1),
  source_tag bigint not null default 2606170002 check (source_tag = 2606170002),
  memo_text text not null,
  status text not null default 'created' check (status in ('created', 'signing', 'pending', 'validated', 'declined', 'expired', 'failed')),
  xaman_payload_uuid text,
  transaction_hash text,
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  validated_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wallet_test_challenge_payload_unique unique (xaman_payload_uuid),
  constraint wallet_test_challenge_tx_unique unique (transaction_hash),
  constraint wallet_test_challenge_payload_format check (
    xaman_payload_uuid is null or xaman_payload_uuid ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ),
  constraint wallet_test_challenge_tx_format check (
    transaction_hash is null or transaction_hash ~* '^[0-9a-f]{64}$'
  )
);

create index if not exists wallet_test_challenges_user_idx
  on public.wallet_test_challenges (user_id, created_at desc);
create index if not exists wallet_test_challenges_provider_idx
  on public.wallet_test_challenges (provider_id, status, created_at desc);

create table if not exists public.wallet_test_results (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null unique references public.wallet_test_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_id text not null references public.wallet_provider_certifications(provider_id),
  wallet_address text not null check (wallet_address ~ '^r[1-9A-HJ-NP-Za-km-z]{25,34}$'),
  transaction_hash text not null unique check (transaction_hash ~* '^[0-9a-f]{64}$'),
  score integer not null check (score between 0 and 100),
  checks jsonb not null default '{}'::jsonb,
  status text not null default 'validated' check (status in ('validated', 'revoked', 'failed')),
  validated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint wallet_test_one_result_per_user_provider unique (user_id, provider_id)
);

create index if not exists wallet_test_results_provider_idx
  on public.wallet_test_results (provider_id, status, validated_at desc);

create table if not exists public.wallet_test_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  result_id uuid not null unique references public.wallet_test_results(id) on delete restrict,
  provider_id text not null references public.wallet_provider_certifications(provider_id),
  wallet_address text not null check (wallet_address ~ '^r[1-9A-HJ-NP-Za-km-z]{25,34}$'),
  status text not null default 'eligible' check (status in ('eligible', 'reserved', 'minting', 'issued', 'failed')),
  serial_number integer,
  issuance_record_id uuid unique references public.nft_issuance_records(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wallet_test_reward_serial_unique unique (serial_number),
  constraint wallet_test_reward_serial_range check (serial_number is null or serial_number between 1 and 100000)
);

alter table public.wallet_provider_certifications enable row level security;
alter table public.wallet_test_challenges enable row level security;
alter table public.wallet_test_results enable row level security;
alter table public.wallet_test_rewards enable row level security;

-- Provider aggregate rows are intentionally public read-only data.
drop policy if exists "wallet provider certifications public select" on public.wallet_provider_certifications;
create policy "wallet provider certifications public select"
  on public.wallet_provider_certifications for select to anon, authenticated using (true);

drop policy if exists "wallet challenge owner select" on public.wallet_test_challenges;
create policy "wallet challenge owner select"
  on public.wallet_test_challenges for select to authenticated using (auth.uid() = user_id);

drop policy if exists "wallet result owner select" on public.wallet_test_results;
create policy "wallet result owner select"
  on public.wallet_test_results for select to authenticated using (auth.uid() = user_id);

drop policy if exists "wallet reward owner select" on public.wallet_test_rewards;
create policy "wallet reward owner select"
  on public.wallet_test_rewards for select to authenticated using (auth.uid() = user_id);

drop trigger if exists wallet_provider_certifications_set_updated_at on public.wallet_provider_certifications;
create trigger wallet_provider_certifications_set_updated_at before update on public.wallet_provider_certifications
for each row execute function public.set_ott_updated_at();
drop trigger if exists wallet_test_challenges_set_updated_at on public.wallet_test_challenges;
create trigger wallet_test_challenges_set_updated_at before update on public.wallet_test_challenges
for each row execute function public.set_ott_updated_at();
drop trigger if exists wallet_test_rewards_set_updated_at on public.wallet_test_rewards;
create trigger wallet_test_rewards_set_updated_at before update on public.wallet_test_rewards
for each row execute function public.set_ott_updated_at();

alter table public.nft_issuance_records drop constraint if exists nft_issuance_records_issuance_type_check;
alter table public.nft_issuance_records drop constraint if exists nft_issuance_type_check;
alter table public.nft_issuance_records drop constraint if exists nft_issuance_serial_range;

alter table public.nft_issuance_records
  add constraint nft_issuance_type_check check (
    issuance_type in (
      'access-pass',
      'public-access-pass',
      'wallet-tester-pass',
      'foundation-certificate',
      'wallet-foundation-certificate',
      'wallet-security-certificate',
      'wallet-operations-certificate'
    )
  ),
  add constraint nft_issuance_serial_range check (
    (issuance_type = 'access-pass' and serial_number between 1 and 500)
    or (issuance_type = 'public-access-pass' and serial_number between 1 and 100000)
    or (issuance_type = 'wallet-tester-pass' and serial_number between 1 and 100000)
    or (issuance_type = 'foundation-certificate' and serial_number between 1 and 50000)
    or (issuance_type in ('wallet-foundation-certificate', 'wallet-security-certificate', 'wallet-operations-certificate') and serial_number between 1 and 100000)
  );

create or replace function public.reserve_ott_wallet_tester_pass(p_result_id uuid)
returns table (reward_id uuid, issuance_record_id uuid, serial_number integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result public.wallet_test_results%rowtype;
  v_config public.wallet_provider_certifications%rowtype;
  v_test_count integer;
  v_reward public.wallet_test_rewards%rowtype;
  v_serial integer;
  v_issuance_id uuid;
begin
  select * into v_result from public.wallet_test_results
  where id = p_result_id and status = 'validated' and score = 100
  for update;
  if not found then raise exception 'A 100 percent validated wallet test is required.'; end if;

  select * into v_config from public.wallet_provider_certifications
  where provider_id = v_result.provider_id and public_testing_enabled = true;
  if not found then raise exception 'This wallet connector is not open for public certification.'; end if;

  select count(distinct user_id)::integer into v_test_count
  from public.wallet_test_results
  where provider_id = v_result.provider_id and status = 'validated' and score = 100;

  if not v_config.auto_certify or v_test_count < v_config.minimum_validated_tests then
    raise exception 'The wallet connector has not reached 100 percent OTT verification yet.';
  end if;

  select * into v_reward from public.wallet_test_rewards where user_id = v_result.user_id for update;
  if found and v_reward.issuance_record_id is not null then
    return query select v_reward.id, v_reward.issuance_record_id, v_reward.serial_number;
    return;
  end if;

  perform pg_advisory_xact_lock(2606170003);
  select candidate into v_serial
  from generate_series(1, 100000) candidate
  where not exists (
    select 1 from public.nft_issuance_records r
    where r.issuance_type = 'wallet-tester-pass' and r.serial_number = candidate
  )
  order by candidate limit 1;
  if v_serial is null then raise exception 'OTT Wallet Tester Pass is sold out.'; end if;

  insert into public.nft_issuance_records (
    user_id, issuance_type, status, lifecycle_step, serial_number, wallet_address, metadata_uri
  ) values (
    v_result.user_id, 'wallet-tester-pass', 'reserved', 'reserved', v_serial, v_result.wallet_address,
    '/api/wallet-test?action=metadata&serial=' || lpad(v_serial::text, 6, '0')
  ) returning id into v_issuance_id;

  insert into public.wallet_test_rewards (
    user_id, result_id, provider_id, wallet_address, status, serial_number, issuance_record_id
  ) values (
    v_result.user_id, v_result.id, v_result.provider_id, v_result.wallet_address, 'reserved', v_serial, v_issuance_id
  )
  on conflict (user_id) do update set
    result_id = excluded.result_id,
    provider_id = excluded.provider_id,
    wallet_address = excluded.wallet_address,
    status = 'reserved',
    serial_number = excluded.serial_number,
    issuance_record_id = excluded.issuance_record_id,
    updated_at = now()
  returning * into v_reward;

  return query select v_reward.id, v_issuance_id, v_serial;
end;
$$;

revoke all on function public.reserve_ott_wallet_tester_pass(uuid) from public, anon, authenticated;
grant execute on function public.reserve_ott_wallet_tester_pass(uuid) to service_role;
