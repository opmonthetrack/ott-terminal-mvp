-- Expand private research evidence uploads for common project documents and screenshots.
-- Run after 20260723_token_research_foundations.sql.

alter table public.research_evidence
  drop constraint if exists research_evidence_size_bytes_check;

alter table public.research_evidence
  add constraint research_evidence_size_bytes_check
  check (size_bytes > 0 and size_bytes <= 15728640);

update storage.buckets
set
  file_size_limit = 15728640,
  allowed_mime_types = array[
    'application/pdf',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/json',
    'application/rtf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/heic-sequence',
    'image/heif-sequence',
    'application/octet-stream'
  ]
where id = 'research-evidence';
