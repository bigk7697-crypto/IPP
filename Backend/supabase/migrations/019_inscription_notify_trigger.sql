-- 019_inscription_notify_trigger.sql — notifie le candidat à CHAQUE décision,
-- quel que soit le chemin (API direction, SQL dashboard, futur code) :
-- un trigger ne peut pas être contourné comme un appel applicatif.
create or replace function public.notify_inscription_decision()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_title text;
  v_message text;
  v_rdv text;
begin
  -- Seulement sur vrai changement de statut, avec un candidat lié
  if tg_op <> 'UPDATE' then return new; end if;
  if old.status is not distinct from new.status then return new; end if;
  if new.user_id is null then return new; end if;

  if new.status = 'verifie' then
    v_title := 'Dossier vérifié';
    v_message := 'Votre dossier ' || new.reference || ' a été vérifié. Prochaine étape : la convocation.';
  elsif new.status = 'convoque' then
    v_rdv := coalesce(to_char(new.rendez_vous_at at time zone 'UTC', 'TMDay DD TMMonth YYYY à HH24:MI'), '');
    v_title := 'Convocation — rendez-vous fixé';
    v_message := 'Rendez-vous ' || v_rdv || ' (dossier ' || new.reference || ').'
      || case when new.rendez_vous_message <> '' then ' ' || new.rendez_vous_message else '' end;
  elsif new.status = 'refuse' then
    v_title := 'Dossier refusé';
    v_message := 'Votre dossier ' || new.reference || ' a été refusé : '
      || case when new.motif_refus <> '' then new.motif_refus else 'contactez le secrétariat.' end;
  elsif new.status = 'admis' then
    v_title := 'Admis — bienvenue à IPP La Paix !';
    v_message := 'Votre dossier ' || new.reference || ' est accepté. Présentez-vous au secrétariat pour finaliser.';
  else
    return new;
  end if;

  insert into public.notifications (user_id, type, title, message, target_type, target_id)
  values (new.user_id, 'system', v_title, v_message, 'inscription', new.id);

  return new;
end $$;

drop trigger if exists trg_inscription_decision on public.inscription_applications;
create trigger trg_inscription_decision
  after update of status on public.inscription_applications
  for each row execute function public.notify_inscription_decision();
