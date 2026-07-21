create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  preferred_language text not null default 'en' check (preferred_language in ('en', 'nl')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.linked_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wallet_address text not null check (wallet_address ~ '^r[1-9A-HJ-NP-Za-km-z]{25,34}$'),
  network text not null default 'xrpl-mainnet',
  wallet_provider text,
  is_primary boolean not null default false,
  verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, wallet_address),
  unique (wallet_address, network)
);

create table if not exists public.academy_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  course_version text not null default '1.0',
  lesson_version text not null default '1.0',
  overall_score integer not null check (overall_score between 0 and 100),
  xp integer not null default 0 check (xp >= 0),
  credits integer not null default 0 check (credits >= 0),
  assessments jsonb not null default '[]'::jsonb,
  completed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id, course_version)
);

create table if not exists public.nft_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  collection_id text not null,
  serial_number integer,
  receiving_wallet text not null check (receiving_wallet ~ '^r[1-9A-HJ-NP-Za-km-z]{25,34}$'),
  status text not null default 'eligible' check (
    status in ('eligible', 'reserved', 'pending', 'issued', 'failed', 'revoked')
  ),
  eligibility_snapshot jsonb not null default '{}'::jsonb,
  transaction_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, collection_id),
  unique (collection_id, serial_number)
);

alter table public.profiles enable row level security;
alter table public.linked_wallets enable row level security;
alter table public.academy_completions enable row level security;
alter table public.nft_claims enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can view their own linked wallets"
  on public.linked_wallets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own linked wallets"
  on public.linked_wallets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own linked wallets"
  on public.linked_wallets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own linked wallets"
  on public.linked_wallets for delete
  using (auth.uid() = user_id);

create policy "Users can view their own Academy completions"
  on public.academy_completions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own Academy completions"
  on public.academy_completions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own Academy completions"
  on public.academy_completions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can view their own NFT claims"
  on public.nft_claims for select
  using (auth.uid() = user_id);

-- NFT claim insertion, serial allocation and status changes must be performed by a trusted server.
-- No direct authenticated insert/update policy is intentionally granted for nft_claims.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, preferred_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', ''),
    'en'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_linked_wallets_updated_at on public.linked_wallets;
create trigger set_linked_wallets_updated_at
before update on public.linked_wallets
for each row execute function public.set_updated_at();

drop trigger if exists set_academy_completions_updated_at on public.academy_completions;
create trigger set_academy_completions_updated_at
before update on public.academy_completions
for each row execute function public.set_updated_at();

drop trigger if exists set_nft_claims_updated_at on public.nft_claims;
create trigger set_nft_claims_updated_at
before update on public.nft_claims
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create index if not exists linked_wallets_user_id_idx
  on public.linked_wallets(user_id);

create index if not exists academy_completions_user_id_idx
  on public.academy_completions(user_id);

create index if not exists nft_claims_user_id_idx
  on public.nft_claims(user_id);
