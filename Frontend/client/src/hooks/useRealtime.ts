import { useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

// Abonne la page au temps réel Supabase (websocket) : à chaque INSERT/UPDATE/DELETE
// sur la table, onChange() est rappelé (typiquement : refetch + sonnette).
// - filter format PostgREST : "user_id=eq.xxx" (ou undefined = toute la table,
//   dans la limite des policies RLS).
// - enabled=false (ex : visiteur déconnecté) : aucune connexion ouverte.
// - Le polling existant reste en secours si le websocket est bloqué.
export function useRealtime(
  table: string,
  filter: string | undefined,
  onChange: () => void,
  enabled: boolean
) {
  const cbRef = useRef(onChange);
  cbRef.current = onChange;

  useEffect(() => {
    if (!enabled) return;
    let channel: any = null;
    let alive = true;
    // Petit délai : laisse la session supabase se stabiliser (RLS du socket).
    const timer = setTimeout(() => {
      if (!alive) return;
      try {
        channel = supabase
          .channel(`rt-${table}-${filter || 'all'}`)
          .on(
            'postgres_changes' as any,
            { event: '*', schema: 'public', table, filter },
            () => cbRef.current()
          )
          .subscribe();
      } catch {
        // websocket indisponible : le polling/fetch existant prend le relais
      }
    }, 1500);
    return () => {
      alive = false;
      clearTimeout(timer);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter, enabled]);
}
