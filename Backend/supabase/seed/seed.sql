-- seed.sql — DONNÉES DEV/TEST UNIQUEMENT. Ne jamais appliquer en prod réelle.
-- Prérequis : 001 appliqué. Les UUID sont fixes pour des tests reproductibles.

-- Classes
insert into public.classes (id, name, level, series, academic_year, is_active) values
  ('11111111-1111-1111-1111-111111111111', 'Seconde A', 'Seconde', 'A', '2025-2026', true),
  ('22222222-2222-2222-2222-222222222222', 'Première D', 'Première', 'D', '2025-2026', true),
  ('33333333-3333-3333-3333-333333333333', 'Terminale D', 'Terminale', 'D', '2025-2026', true)
on conflict (id) do nothing;

-- News publiées (visibles publiquement)
insert into public.news (id, title, slug, content, status, published_at) values
  ('a0000000-0000-0000-0000-000000000001', 'Bienvenue sur le site de l''école', 'bienvenue', 'Contenu de test — page d''accueil dynamique.', 'published', now()),
  ('a0000000-0000-0000-0000-000000000002', 'Rentrée scolaire 2025-2026', 'rentree-2025', 'Informations de rentrée (données de test).', 'published', now()),
  ('a0000000-0000-0000-0000-000000000003', 'Brouillon invisible', 'brouillon-test', 'Ce brouillon ne doit jamais apparaître côté public.', 'draft', null)
on conflict (id) do nothing;

-- Événement publié
insert into public.events (id, title, description, location, start_at, status) values
  ('b0000000-0000-0000-0000-000000000001', 'Journée culturelle', 'Description test.', 'Établissement', now() + interval '10 days', 'published')
on conflict (id) do nothing;
