-- Defense-in-depth invariants for founder-reviewed web evidence.
-- Run after 20260724_token_research_web_sources.sql.
--
-- A source may count only while it:
-- 1. belongs to the same research request;
-- 2. has founder review_status = verified;
-- 3. remains present and verified for as long as a saved score links it.

create or replace function public.validate_ott_research_score_source_links()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  evidence_count integer;
begin
  if exists (
    select 1
    from unnest(new.evidence_ids) as linked_evidence_id
    left join public.research_evidence evidence
      on evidence.id = linked_evidence_id
     and evidence.token_request_id = new.request_id
    where evidence.id is null
  ) then
    raise exception using
      errcode = '23514',
      message = 'OTT_RESEARCH_SCORE_EVIDENCE_WRONG_CASE';
  end if;

  if exists (
    select 1
    from unnest(new.source_ids) as linked_source_id
    left join public.token_research_sources source
      on source.id = linked_source_id
     and source.request_id = new.request_id
     and source.review_status = 'verified'
    where source.id is null
  ) then
    raise exception using
      errcode = '23514',
      message = 'OTT_RESEARCH_SCORE_SOURCE_MUST_BE_VERIFIED';
  end if;

  evidence_count :=
    coalesce(cardinality(new.evidence_ids), 0)
    + coalesce(cardinality(new.source_ids), 0);

  if new.awarded_points > 0 and evidence_count = 0 then
    raise exception using
      errcode = '23514',
      message = 'OTT_RESEARCH_SCORE_POINTS_REQUIRE_EVIDENCE';
  end if;

  if new.evidence_status = 'missing' and evidence_count > 0 then
    raise exception using
      errcode = '23514',
      message = 'OTT_RESEARCH_SCORE_MISSING_CANNOT_LINK_EVIDENCE';
  end if;

  if new.evidence_status <> 'missing' and evidence_count = 0 then
    raise exception using
      errcode = '23514',
      message = 'OTT_RESEARCH_SCORE_STATUS_REQUIRES_EVIDENCE';
  end if;

  if (
    new.awarded_points > 0
    or new.evidence_status <> 'missing'
  ) and char_length(btrim(new.rationale)) < 20 then
    raise exception using
      errcode = '23514',
      message = 'OTT_RESEARCH_SCORE_RATIONALE_REQUIRED';
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

create or replace function public.guard_linked_ott_research_source_change()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if exists (
      select 1
      from public.token_research_score_items score_item
      where old.id = any(score_item.source_ids)
    ) then
      raise exception using
        errcode = '23514',
        message = 'OTT_RESEARCH_SOURCE_LINKED';
    end if;
    return old;
  end if;

  if (
    new.request_id is distinct from old.request_id
    or new.review_status <> 'verified'
  ) and exists (
    select 1
    from public.token_research_score_items score_item
    where old.id = any(score_item.source_ids)
  ) then
    raise exception using
      errcode = '23514',
      message = 'OTT_RESEARCH_SOURCE_LINKED';
  end if;

  return new;
end;
$$;

drop trigger if exists token_research_source_guard_linked_change
  on public.token_research_sources;

create trigger token_research_source_guard_linked_change
before update of request_id, review_status or delete
on public.token_research_sources
for each row
execute function public.guard_linked_ott_research_source_change();

create or replace function public.guard_linked_ott_research_evidence_delete()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.token_research_score_items score_item
    where old.id = any(score_item.evidence_ids)
  ) then
    raise exception using
      errcode = '23514',
      message = 'OTT_RESEARCH_EVIDENCE_LINKED';
  end if;

  return old;
end;
$$;

drop trigger if exists token_research_evidence_guard_linked_delete
  on public.research_evidence;

create trigger token_research_evidence_guard_linked_delete
before delete on public.research_evidence
for each row
execute function public.guard_linked_ott_research_evidence_delete();
