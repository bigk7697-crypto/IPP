-- 010_add_academic_year_to_school_settings.sql
alter table public.school_settings add column if not exists academic_year text not null default '2025-2026';
update public.school_settings set academic_year = '2025-2026' where academic_year is null;
