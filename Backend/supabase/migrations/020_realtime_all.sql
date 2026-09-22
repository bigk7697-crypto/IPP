-- 020_realtime_all.sql — temps réel complet : plus jamais de refresh manuel.
-- Le frontend s'abonne en websocket (RLS respectée) + garde le polling en secours.
alter publication supabase_realtime add table public.results;
alter publication supabase_realtime add table public.documents;
alter publication supabase_realtime add table public.inscription_applications;
