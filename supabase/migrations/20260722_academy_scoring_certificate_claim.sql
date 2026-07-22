-- OTT Academy scoring and Foundation Certificate claim safety.
-- Run after 20260721_platform_foundations.sql.

alter table public.nft_issuance_records
  add column if not exists qualification_score integer,
  add column if not exists qualification_course_count integer;

alter table public.nft_issuance_records
  drop constraint if exists nft_issuance_qualification_score_range;

alter table public.nft_issuance_records
  add constraint nft_issuance_qualification_score_range
  check (qualification_score is null or qualification_score between 0 and 100);

alter table public.nft_issuance_records
  drop constraint if exists nft_issuance_qualification_course_count_range;

alter table public.nft_issuance_records
  add constraint nft_issuance_qualification_course_count_range
  check (qualification_course_count is null or qualification_course_count between 0 and 100);

-- One Access Pass and one Foundation Certificate lifecycle record per OTT account.
create unique index if not exists nft_issuance_one_record_per_user_type
  on public.nft_issuance_records (user_id, issuance_type);

-- Users still have read-only access to their own record through the existing RLS policy.
-- Reservation, mint-pending, issued and failed transitions remain service-role only.
