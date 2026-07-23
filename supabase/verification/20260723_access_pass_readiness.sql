-- OTT Access Pass Alpha database readiness verification.
-- Run this read-only query in the Supabase SQL Editor after all four migrations.
-- Every blocking row should return ok = true before starting the TESTNET lifecycle.

with checks as (
  select
    'order_table'::text as check_id,
    'access_pass_orders table exists'::text as check_name,
    to_regclass('public.access_pass_orders') is not null as ok,
    true as blocking

  union all

  select
    'issuance_table',
    'nft_issuance_records table exists',
    to_regclass('public.nft_issuance_records') is not null,
    true

  union all

  select
    'lifecycle_column',
    'NFT lifecycle_step column exists',
    exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'nft_issuance_records'
        and column_name = 'lifecycle_step'
    ),
    true

  union all

  select
    'order_rls',
    'RLS is enabled on access_pass_orders',
    coalesce((
      select relrowsecurity
      from pg_class
      where oid = to_regclass('public.access_pass_orders')
    ), false),
    true

  union all

  select
    'owner_policy',
    'Authenticated users can only select their own order',
    exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'access_pass_orders'
        and policyname = 'access pass order owner select'
        and cmd = 'SELECT'
        and roles = array['authenticated']::name[]
    ),
    true

  union all

  select
    'reservation_function',
    'Atomic reservation function exists',
    to_regprocedure('public.reserve_ott_access_pass(uuid)') is not null,
    true

  union all

  select
    'reservation_security',
    'Reservation function is SECURITY DEFINER',
    coalesce((
      select prosecdef
      from pg_proc
      where oid = to_regprocedure('public.reserve_ott_access_pass(uuid)')
    ), false),
    true

  union all

  select
    'anonymous_execute_revoked',
    'Anonymous role cannot execute reservation function',
    not has_function_privilege('anon', 'public.reserve_ott_access_pass(uuid)', 'EXECUTE'),
    true

  union all

  select
    'authenticated_execute_revoked',
    'Authenticated browser role cannot execute reservation function',
    not has_function_privilege('authenticated', 'public.reserve_ott_access_pass(uuid)', 'EXECUTE'),
    true

  union all

  select
    'service_execute_granted',
    'Service role can execute reservation function',
    has_function_privilege('service_role', 'public.reserve_ott_access_pass(uuid)', 'EXECUTE'),
    true

  union all

  select
    'serial_range',
    'Every Access Pass serial is between 001 and 500',
    not exists (
      select 1
      from public.nft_issuance_records
      where issuance_type = 'access-pass'
        and serial_number not between 1 and 500
    ),
    true

  union all

  select
    'serial_unique',
    'No Access Pass serial is duplicated',
    not exists (
      select serial_number
      from public.nft_issuance_records
      where issuance_type = 'access-pass'
      group by serial_number
      having count(*) > 1
    ),
    true

  union all

  select
    'one_order_per_user',
    'No OTT account has multiple Access Pass orders',
    not exists (
      select user_id
      from public.access_pass_orders
      group by user_id
      having count(*) > 1
    ),
    true

  union all

  select
    'payment_hash_unique',
    'No validated payment hash is reused',
    not exists (
      select payment_tx_hash
      from public.access_pass_orders
      where payment_tx_hash is not null
      group by payment_tx_hash
      having count(*) > 1
    ),
    true

  union all

  select
    'order_issuance_link',
    'Every reserved order links to its Access Pass issuance record',
    not exists (
      select 1
      from public.access_pass_orders orders
      left join public.nft_issuance_records issuance
        on issuance.id = orders.issuance_record_id
       and issuance.issuance_type = 'access-pass'
      where orders.serial_number is not null
        and (
          issuance.id is null
          or issuance.serial_number <> orders.serial_number
          or issuance.user_id <> orders.user_id
        )
    ),
    true

  union all

  select
    'supply_limit',
    'Reserved Access Pass supply does not exceed 500',
    (
      select count(*) <= 500
      from public.nft_issuance_records
      where issuance_type = 'access-pass'
    ),
    true
)
select
  check_id,
  check_name,
  ok,
  blocking,
  case
    when ok then 'PASS'
    when blocking then 'BLOCKED'
    else 'REVIEW'
  end as result
from checks
order by ok asc, check_id;
