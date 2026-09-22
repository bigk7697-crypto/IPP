import React, { useEffect, useState } from 'react';
import { BellRing, X } from 'lucide-react';
import { isPushSupported, subscribePush } from '../services/push.service';

const DISMISS_KEY = 'ipp_push_dismissed';

// Bandeau one-tap (espace connecté uniquement) : propose d'activer les
// notifications système pour recevoir actus/résultats même site fermé.
// Affiché une seule fois : si permission !== 'default', déjà abonné ou refusé.
export const PushPrompt: React.FC = () => {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        if (!isPushSupported()) return;
        if (localStorage.getItem(DISMISS_KEY)) return;
        if (Notification.permission !== 'default') return;
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!sub) setShow(true);
      } catch {
        // push indisponible ici : on ne propose rien
      }
    })();
  }, []);

  if (!show) return null;

  const enable = async () => {
    setBusy(true);
    setError('');
    try {
      await subscribePush();
      setShow(false);
    } catch (e: any) {
      setError(e?.message || 'Activation impossible sur cet appareil.');
    } finally {
      setBusy(false);
    }
  };

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore
    }
    setShow(false);
  };

  return (
    <div className="mx-4 sm:mx-8 lg:mx-10 mt-4 p-4 bg-gradient-to-r from-brand-900 to-brand-700 text-white rounded-2xl shadow-lg flex items-center gap-4">
      <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
        <BellRing className="w-5 h-5 text-amber-300" />
      </div>
      <div className="flex-1 space-y-0.5">
        <p className="text-sm font-bold">Recevez les résultats même quand le site est fermé</p>
        <p className="text-xs text-slate-200">Notifications système : actus, événements, résultats, convocation.</p>
        {error && <p className="text-xs text-amber-200">{error}</p>}
      </div>
      <button
        onClick={enable}
        disabled={busy}
        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-brand-950 text-xs font-extrabold rounded-xl transition-colors disabled:opacity-50 shrink-0"
      >
        {busy ? '…' : 'Activer'}
      </button>
      <button onClick={dismiss} className="p-1.5 text-slate-300 hover:text-white shrink-0" title="Plus tard">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
