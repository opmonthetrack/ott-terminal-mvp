-- OTT Access Pass Alpha payment and NFT delivery lifecycle.
-- Run after:
--   1. 20260721_platform_foundations.sql
--   2. 20260722_foundation_certificate_delivery.sql
--
-- Browser users may read only their own order. All payment verification,
-- serial reservation and NFT lifecycle writes remain service-role only.

create table if not exists public.access_pass_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_wallet text not null,
  access_tier text not null default 'Alpha',
  price_drops bigint not null default 1589000,
  destination_wallet text not null,
  source_tag bigint not null default 2606170002,
  status text not null default 'created',
  payment_payload_uuid text,
  payment_tx_hash text,
  payer_account text,
  payment_validated_at timestamptz,
  serial_number integer,
  issuance_record_id uuid references public.nft_issuance_records(id) on delete set null,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint access_pass_order_one_per_user unique (user_id),
  constraint access_pass_order_issuance_unique unique (issuance_record_id),
  constraint access_pass_order_serial_unique unique (serial_number),
  constraint access_pass_order_payment_tx_unique unique (payment_tx_hash),
  constraint access_pass_order_wallet_format check (
    customer_wallet ~ '^r[1-9A-HJ-NP-Za-km-z]{25,34}$'
    and destination_wallet ~ '^r[1-9A-HJ-NP-Za-km-z]{25,34}$'
    and (payer_account is null or payer_account ~ '^r[1-9A-HJ-NP-Za-km-z]{25,34}$')
  ),
  constraint access_pass_order_fixed_price check (price_drops = 1589000),
  constraint access_pass_order_source_tag check (source_tag = 2606170002),
  constraint access_pass_order_serial_range check (serial_number is null or serial_number between 1 and 500),
  constraint access_pass_order_payload_uuid_format check (
    payment_payload_uuid is null
    or payment_payload_uuid ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ),
  constraint access_pass_order_tx_hash_format check (
    payment_tx_hash is null or payment_tx_hash ~* '^[0-9a-f]{64}$'
  ),
  constraint access_pass_order_status_allowed check (
    status in (
      'created',
      'payment-signing',
      'payment-pending',
      'paid',
      'reserved',
      'mint-signing',
      'minted',
      'offer-signing',
      'offer-created',
      'accept-signing',
      'issued',
      'failed',
      'cancelled'
    )
  )
);

create index if not exists access_pass_orders_status_idx
  on public.access_pass_orders (status, created_at);

create index if not exists access_pass_orders_wallet_idx
  on public.access_pass_orders (customer_wallet, updated_at desc);

alter table public.access_pass_orders enable row level security;

drop policy if exists "access pass order owner select" on public.access_pass_orders;
create policy "access pass order owner select"
  on public.access_pass_orders
  for select
  to authenticated
  using (auth.uid() = user_id);

drop trigger if exists access_pass_orders_set_updated_at on public.access_pass_orders;
create trigger access_pass_orders_set_updated_at
before update on public.access_pass_orders
for each row execute function public.set_ott_updated_at();

create or replace function public.reserve_ott_access_pass(p_order_id uuid)
returns table (
  order_id uuid,
  issuance_record_id uuid,
  serial_number integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.access_pass_orders%rowtype;
  v_serial integer;
  v_issuance_id uuid;
begin
  select * into v_order
  from public.access_pass_orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Access Pass order not found.';
  end if;

  if v_order.payment_tx_hash is null or v_order.payment_validated_at is null then
    raise exception 'A validated payment is required before serial reservation.';
  end if;

  if v_order.issuance_record_id is not null and v_order.serial_number is not null then
    return query select v_order.id, v_order.issuance_record_id, v_order.serial_number;
    return;
  end if;

  -- Serialize allocation so two paid customers can never receive the same number.
  perform pg_advisory_xact_lock(2606170002);

  select candidate into v_serial
  from generate_series(1, 500) as candidate
  where not exists (
    select 1
    from public.nft_issuance_records record
    where record.issuance_type = 'access-pass'
      and record.serial_number = candidate
  )
  order by candidate
  limit 1;

  if v_serial is null then
    raise exception 'OTT Access Pass Alpha is sold out.';
  end if;

  insert into public.nft_issuance_records (
    user_id,
    issuance_type,
    status,
    lifecycle_step,
    serial_number,
    wallet_address,
    error_message
  )
  values (
    v_order.user_id,
    'access-pass',
    'reserved',
    'reserved',
    v_serial,
    v_order.customer_wallet,
    null
  )
  returning id into v_issuance_id;

  update public.access_pass_orders
  set
    status = 'reserved',
    serial_number = v_serial,
    issuance_record_id = v_issuance_id,
    error_message = null
  where id = v_order.id;

  return query select v_order.id, v_issuance_id, v_serial;
end;
$$;

revoke all on function public.reserve_ott_access_pass(uuid) from public;
revoke all on function public.reserve_ott_access_pass(uuid) from anon;
revoke all on function public.reserve_ott_access_pass(uuid) from authenticated;
grant execute on function public.reserve_ott_access_pass(uuid) to service_role;

create index if not exists nft_issuance_access_pass_queue_idx
  on public.nft_issuance_records (lifecycle_step, created_at)
  where issuance_type = 'access-pass';
