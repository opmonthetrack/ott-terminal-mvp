-- OTT platform foundations
-- Private research evidence and server-controlled NFT issuance.

create extension if not exists pgcrypto;

create table if not exists public.research_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_key text not null check (char_length(project_key) between 1 and 64),
  evidence_kind text not null check (evidence_kind in ('whitepaper', 'roadmap', 'audit', 'legal', 'other')),
  file_name text not null check (char_length(file_name) between 1 and 160),
  mime_type text not null check (char_length(mime_type) between 1 and 160),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  storage_path text not null unique,
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists research_evidence_user_project_idx
  on public.research_evidence (user_id, project_key, created_at desc);

alter table public.research_evidence enable row level security;

create policy "research evidence owner select"
  on public.research_evidence
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "research evidence owner insert"
  on public.research_evidence
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "research evidence owner update"
  on public.research_evidence
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "research evidence owner delete"
  on public.research_evidence
  for delete
  to authenticated
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'research-evidence',
  'research-evidence',
  false,
  10485760,
  array[
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/json',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "research evidence storage owner select"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'research-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "research evidence storage owner insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'research-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "research evidence storage owner update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'research-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'research-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "research evidence storage owner delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'research-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create table if not exists public.nft_issuance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  issuance_type text not null check (issuance_type in ('access-pass', 'foundation-certificate')),
  status text not null check (status in ('eligible', 'reserved', 'pending', 'issued', 'failed')),
  serial_number integer not null,
  wallet_address text,
  transaction_hash text,
  metadata_uri text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nft_issuance_serial_range check (
    (issuance_type = 'access-pass' and serial_number between 1 and 500)
    or
    (issuance_type = 'foundation-certificate' and serial_number between 1 and 5000)
  ),
  constraint nft_issuance_wallet_format check (
    wallet_address is null
    or wallet_address ~ '^r[1-9A-HJ-NP-Za-km-z]{25,34}$'
  ),
  constraint nft_issuance_transaction_format check (
    transaction_hash is null
    or transaction_hash ~ '^[A-Fa-f0-9]{64}$'
  ),
  constraint nft_issuance_type_serial_unique unique (issuance_type, serial_number)
);

create index if not exists nft_issuance_user_idx
  on public.nft_issuance_records (user_id, issuance_type, updated_at desc);

create unique index if not exists nft_issuance_transaction_unique
  on public.nft_issuance_records (transaction_hash)
  where transaction_hash is not null;

alter table public.nft_issuance_records enable row level security;

-- Authenticated users may view only their own issuance state.
-- Insert, update and delete deliberately have no browser policies.
-- The trusted server/service role performs all lifecycle writes after eligibility,
-- wallet ownership, metadata and validated XRPL transaction checks.
create policy "nft issuance owner select"
  on public.nft_issuance_records
  for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_ott_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists research_evidence_set_updated_at on public.research_evidence;
create trigger research_evidence_set_updated_at
before update on public.research_evidence
for each row execute function public.set_ott_updated_at();

drop trigger if exists nft_issuance_set_updated_at on public.nft_issuance_records;
create trigger nft_issuance_set_updated_at
before update on public.nft_issuance_records
for each row execute function public.set_ott_updated_at();
