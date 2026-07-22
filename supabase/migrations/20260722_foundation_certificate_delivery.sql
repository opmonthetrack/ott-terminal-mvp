-- Complete OTT XRPL Foundation Certificate delivery lifecycle.
-- Run after:
--   1. 20260721_platform_foundations.sql
--   2. 20260722_academy_scoring_certificate_claim.sql
--
-- The broad status remains compatible with the existing app:
-- reserved -> pending -> issued / failed.
-- lifecycle_step records the exact XRPL/Xaman stage.

alter table public.nft_issuance_records
  add column if not exists lifecycle_step text not null default 'reserved',
  add column if not exists mint_payload_uuid text,
  add column if not exists mint_transaction_hash text,
  add column if not exists nftoken_id text,
  add column if not exists offer_payload_uuid text,
  add column if not exists offer_transaction_hash text,
  add column if not exists transfer_offer_id text,
  add column if not exists accept_payload_uuid text,
  add column if not exists accept_transaction_hash text,
  add column if not exists minted_at timestamptz,
  add column if not exists offer_created_at timestamptz,
  add column if not exists issued_at timestamptz;

alter table public.nft_issuance_records
  drop constraint if exists nft_issuance_lifecycle_step_allowed;

alter table public.nft_issuance_records
  add constraint nft_issuance_lifecycle_step_allowed
  check (
    lifecycle_step in (
      'reserved',
      'mint-signing',
      'minted',
      'offer-signing',
      'offer-created',
      'accept-signing',
      'issued',
      'failed'
    )
  );

alter table public.nft_issuance_records
  drop constraint if exists nft_issuance_payload_uuid_format;

alter table public.nft_issuance_records
  add constraint nft_issuance_payload_uuid_format
  check (
    (mint_payload_uuid is null or mint_payload_uuid ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
    and
    (offer_payload_uuid is null or offer_payload_uuid ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
    and
    (accept_payload_uuid is null or accept_payload_uuid ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
  );

alter table public.nft_issuance_records
  drop constraint if exists nft_issuance_delivery_hash_format;

alter table public.nft_issuance_records
  add constraint nft_issuance_delivery_hash_format
  check (
    (mint_transaction_hash is null or mint_transaction_hash ~* '^[0-9a-f]{64}$')
    and
    (offer_transaction_hash is null or offer_transaction_hash ~* '^[0-9a-f]{64}$')
    and
    (accept_transaction_hash is null or accept_transaction_hash ~* '^[0-9a-f]{64}$')
    and
    (nftoken_id is null or nftoken_id ~* '^[0-9a-f]{64}$')
    and
    (transfer_offer_id is null or transfer_offer_id ~* '^[0-9a-f]{64}$')
  );

alter table public.nft_issuance_records
  drop constraint if exists nft_issuance_issued_state_complete;

alter table public.nft_issuance_records
  add constraint nft_issuance_issued_state_complete
  check (
    status <> 'issued'
    or (
      lifecycle_step = 'issued'
      and transaction_hash is not null
      and accept_transaction_hash is not null
      and nftoken_id is not null
      and transfer_offer_id is not null
      and metadata_uri is not null
      and issued_at is not null
    )
  );

create unique index if not exists nft_issuance_mint_tx_unique
  on public.nft_issuance_records (mint_transaction_hash)
  where mint_transaction_hash is not null;

create unique index if not exists nft_issuance_offer_tx_unique
  on public.nft_issuance_records (offer_transaction_hash)
  where offer_transaction_hash is not null;

create unique index if not exists nft_issuance_accept_tx_unique
  on public.nft_issuance_records (accept_transaction_hash)
  where accept_transaction_hash is not null;

create unique index if not exists nft_issuance_nftoken_unique
  on public.nft_issuance_records (nftoken_id)
  where nftoken_id is not null;

create unique index if not exists nft_issuance_transfer_offer_unique
  on public.nft_issuance_records (transfer_offer_id)
  where transfer_offer_id is not null;

create index if not exists nft_issuance_foundation_queue_idx
  on public.nft_issuance_records (lifecycle_step, created_at)
  where issuance_type = 'foundation-certificate';

-- Existing RLS remains intentionally read-only for the browser.
-- All lifecycle transitions are performed with the service role after
-- OTT account, Xaman payload and validated XRPL transaction verification.
