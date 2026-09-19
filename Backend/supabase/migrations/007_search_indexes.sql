-- 007_search_indexes.sql — index pour recherche insensible à la casse (?q)
-- Optimise les ilike sur title/content/description/name sans pg_trgm lourd.

create extension if not exists pg_trgm;

-- news : title + content
create index if not exists idx_news_title_trgm on public.news using gin (title gin_trgm_ops);
create index if not exists idx_news_content_trgm on public.news using gin (content gin_trgm_ops);
create index if not exists idx_news_title_lower on public.news (lower(title));
create index if not exists idx_news_slug on public.news (slug);

-- events : title + description
create index if not exists idx_events_title_trgm on public.events using gin (title gin_trgm_ops);
create index if not exists idx_events_desc_trgm on public.events using gin (description gin_trgm_ops);

-- documents : title + description
create index if not exists idx_documents_title_trgm on public.documents using gin (title gin_trgm_ops);
create index if not exists idx_documents_desc_trgm on public.documents using gin (description gin_trgm_ops);

-- classes : name / level / series
create index if not exists idx_classes_name_trgm on public.classes using gin (name gin_trgm_ops);
create index if not exists idx_classes_level_trgm on public.classes using gin (level gin_trgm_ops);
