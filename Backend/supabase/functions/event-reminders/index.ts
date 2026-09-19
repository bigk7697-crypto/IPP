// supabase/functions/event-reminders/index.ts
// Rappels automatiques d'événements : J-3 et Jour-J.
// À planifier en cron quotidien (Dashboard → Edge Functions → event-reminders → Schedules,
// ex. `0 7 * * *`). Idempotent : ne recrée jamais un rappel déjà envoyé aujourd'hui.
//
// Variables fournies automatiquement par Supabase : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const REMIND_DAYS_BEFORE = 3;

function dayBounds(date: Date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const now = new Date();
    const in3days = new Date(now.getTime() + REMIND_DAYS_BEFORE * 24 * 60 * 60 * 1000);
    const today = dayBounds(now);
    const target = dayBounds(in3days);

    // Événements publiés : ceux d'aujourd'hui + ceux dans 3 jours
    const { data: events, error: eErr } = await supabase
      .from('events')
      .select('id, title, start_at')
      .eq('status', 'published')
      .or(
        `and(start_at.gte.${today.start},start_at.lt.${today.end}),and(start_at.gte.${target.start},start_at.lt.${target.end})`,
      );
    if (eErr) throw eErr;
    if (!events?.length) {
      return Response.json({ success: true, data: { sent: 0, reason: 'no-events' } });
    }

    // Rappels déjà envoyés aujourd'hui (anti-doublon)
    const dayStart = today.start;
    const { data: existing } = await supabase
      .from('notifications')
      .select('target_id, title')
      .eq('type', 'calendar')
      .gte('created_at', dayStart);
    const sentKeys = new Set((existing ?? []).map((n) => `${n.target_id}|${n.title}`));

    // Utilisateurs ayant activé les rappels calendrier
    const { data: users, error: uErr } = await supabase
      .from('profiles')
      .select('id, notification_preferences!inner(calendar_enabled)')
      .eq('role', 'user');
    if (uErr) throw uErr;
    const optedIn = (users ?? []).filter(
      // deno-lint-ignore no-explicit-any
      (u: any) => u.notification_preferences?.calendar_enabled !== false,
    );
    // Utilisateurs sans ligne de préférences (défaut = true)
    const { data: noPrefs } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'user')
      .not('id', 'in', `(${(users ?? []).map((u) => u.id).join(',') || '00000000-0000-0000-0000-000000000000'})`);
    const recipients = [...optedIn.map((u) => u.id), ...(noPrefs ?? []).map((u) => u.id)];
    if (!recipients.length) {
      return Response.json({ success: true, data: { sent: 0, reason: 'no-recipients' } });
    }

    const rows = [];
    for (const ev of events) {
      const evDay = dayBounds(new Date(ev.start_at));
      const isToday = evDay.start === today.start;
      const title = isToday ? `${ev.title} — c'est aujourd'hui` : `Rappel — ${ev.title} dans 3 jours`;
      if (sentKeys.has(`${ev.id}|${title}`)) continue;
      for (const user_id of recipients) {
        rows.push({
          user_id,
          type: 'calendar',
          title,
          message: ev.title,
          target_type: 'event',
          target_id: ev.id,
        });
      }
    }

    if (!rows.length) {
      return Response.json({ success: true, data: { sent: 0, reason: 'already-sent' } });
    }
    const { error: iErr } = await supabase.from('notifications').insert(rows);
    if (iErr) throw iErr;
    return Response.json({ success: true, data: { sent: rows.length, events: events.length } });
  } catch (err) {
    console.error('[event-reminders]', err);
    return Response.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Échec rappels.' } },
      { status: 500 },
    );
  }
});
