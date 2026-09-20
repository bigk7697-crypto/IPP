import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Smartphone, AlertTriangle } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import {
  isPushSupported,
  isIOS,
  isStandalone,
  getPermissionState,
  subscribePush,
  unsubscribePush,
} from '../../services/push.service';

export const Settings: React.FC = () => {
  const { preferences, fetchPreferences, updatePreferences } = useNotificationStore();
  const [pushState, setPushState] = useState<string>('...');
  const [pushLoading, setPushLoading] = useState(false);
  const [pushError, setPushError] = useState('');

  useEffect(() => {
    fetchPreferences();
    refreshPushState();
  }, []);

  async function refreshPushState() {
    const p = await getPermissionState();
    if (p === 'unsupported') { setPushState('unsupported'); return; }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setPushState(sub ? 'on' : p);
    } catch {
      setPushState(p);
    }
  }

  async function handlePushToggle() {
    setPushLoading(true);
    setPushError('');
    try {
      if (pushState === 'on') {
        await unsubscribePush();
      } else {
        await subscribePush();
      }
      await refreshPushState();
    } catch (e: any) {
      setPushError(e.message || 'Impossible d\u2019activer les notifications système.');
    } finally {
      setPushLoading(false);
    }
  }

  if (!preferences) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleToggle = (key: keyof typeof preferences) => {
    if (typeof preferences[key] === 'boolean') {
      updatePreferences({ [key]: !preferences[key] });
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Paramètres & Préférences</h1>
        <p className="text-slate-600 mt-1">Configurez vos préférences de notifications pour les actualités, résultats et événements.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-brand-600" />
          <span>Notifications système (barre Android / Windows)</span>
        </h2>
        <p className="text-xs text-slate-500">
          Recevez les actualités, événements et résultats même quand le site est fermé, avec le son et l'icône IPP.
        </p>
        {isIOS() && !isStandalone() && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
            <p className="font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> iPhone : installation requise</p>
            <p>1. Ouvrez ce site dans <strong>Safari</strong> → <strong>Partager</strong> → <strong>Sur l'écran d'accueil</strong> (iOS 16.4+).</p>
            <p>2. Rouvrez l'app depuis la nouvelle icône, revenez ici et activez ci-dessous.</p>
          </div>
        )}
        {pushState === 'unsupported' ? (
          <p className="text-xs text-slate-500">Ce navigateur ne supporte pas les notifications système.</p>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-slate-900">
                {pushState === 'on' ? 'Activées ✓' : pushState === 'denied' ? 'Bloquées par le navigateur' : 'Désactivées'}
              </p>
              <p className="text-xs text-slate-500">
                {pushState === 'denied'
                  ? 'Autorisez les notifications dans les réglages du navigateur, puis revenez ici.'
                  : 'Un appui active la barre système + le son IPP.'}
              </p>
            </div>
            <button
              onClick={handlePushToggle}
              disabled={pushLoading || pushState === 'denied'}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors disabled:opacity-50 ${
                pushState === 'on' ? 'bg-brand-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <span className="w-6 h-6 bg-white rounded-full shadow-md"></span>
            </button>
          </div>
        )}
        {pushError && <p className="text-xs text-red-600">{pushError}</p>}

        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pt-2">
          <Bell className="w-5 h-5 text-brand-600" />
          <span>Préférences de Notifications</span>
        </h2>

        <div className="divide-y divide-slate-100">
          {[
            { key: 'news_enabled', label: 'Actualités & Annonces', desc: 'Recevoir une notification lors de la publication d’une nouvelle actualité' },
            { key: 'events_enabled', label: 'Événements & Agenda', desc: 'Alertes pour les prochains événements et réunions scolaires' },
            { key: 'results_enabled', label: 'Résultats Scolaires', desc: 'Notification immédiate dès qu’un procès-verbal de notes est publié' },
            { key: 'documents_enabled', label: 'Documents & Formulaires', desc: 'Mises à jour concernant les nouveaux règlements ou formulaires' },
            { key: 'calendar_enabled', label: 'Rappels Calendrier', desc: 'Rappels automatiques avant les dates clés et examens' },
            { key: 'system_enabled', label: 'Notifications Système', desc: 'Annonces administratives importantes et sécurité du compte' },
          ].map((item) => {
            const isEnabled = (preferences as any)[item.key];
            return (
              <div key={item.key} className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <button
                  onClick={() => handleToggle(item.key as any)}
                  className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${
                    isEnabled ? 'bg-brand-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <span className="w-6 h-6 bg-white rounded-full shadow-md"></span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
