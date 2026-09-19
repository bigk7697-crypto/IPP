-- 009_fix_role_escalation_service_role.sql — permet au SERVICE_ROLE de promouvoir admin sans drop trigger
-- Le trigger précédent bloquait même le service_role (auth.uid() = null)
-- On y ajoute une exception : si le JWT a le rôle service_role, on autorise.

create or replace function public.prevent_role_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- service_role (backend) doit pouvoir créer le premier admin
  if auth.jwt() ->> 'role' = 'service_role' then
    return new;
  end if;
  if new.role <> old.role and not public.is_admin() then
    raise exception 'Modification du role interdite.';
  end if;
  return new;
end $$;
