import React, { useEffect } from 'react';
import { Bell, CheckCheck, Check } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';

export const Notifications: React.FC = () => {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Centre de Notifications</h1>
          <p className="text-slate-600 mt-1">Restez notifié en temps réel des nouveaux résultats, actualités et événements.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-50 text-brand-700 hover:bg-brand-100 font-medium rounded-xl text-xs transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Tout marquer comme lu</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            Aucune notification pour le moment.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-6 flex items-start justify-between gap-4 transition-colors ${
                notif.is_read ? 'bg-white' : 'bg-brand-50/40'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl shrink-0 ${notif.is_read ? 'bg-slate-100 text-slate-500' : 'bg-brand-600 text-white'}`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{notif.title}</h3>
                    {!notif.is_read && (
                      <span className="w-2.5 h-2.5 bg-brand-600 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-slate-400 font-mono pt-1">
                    {new Date(notif.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>

              {!notif.is_read && (
                <button
                  onClick={() => markAsRead(notif.id)}
                  className="p-2 text-slate-400 hover:text-brand-600 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
                  title="Marquer comme lu"
                >
                  <Check className="w-5 h-5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
