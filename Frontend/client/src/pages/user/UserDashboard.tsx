import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, FileSpreadsheet, Calendar, Award, ChevronRight, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { resolveImageUrl } from '../../utils/images';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { newsService } from '../../services/news.service';
import { eventService } from '../../services/event.service';
import { NewsItem, EventItem } from '../../types';

export const UserDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { notifications } = useNotificationStore();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [n, e] = await Promise.all([
        newsService.getNews(),
        eventService.getEvents()
      ]);
      setNews(n.slice(0, 2));
      setEvents(e.slice(0, 2));
      setLoading(false);
    }
    load();
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full uppercase tracking-wider">
            Espace Élève & Parent
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Bonjour, {user?.first_name} {user?.last_name} 👋</h1>
          <p className="text-brand-100 text-sm">Voici les dernières actualités et documents disponibles pour votre classe.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
          <div className="space-y-1">
            <p className="text-xs text-brand-200">Statut du compte</p>
            <p className="text-sm font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Actif & Vérifié</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{unreadCount}</p>
            <p className="text-xs text-slate-500 font-medium uppercase">Notifications non lues</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">1 Nvx</p>
            <p className="text-xs text-slate-500 font-medium uppercase">Résultats Trimestre 1</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">2 Prévus</p>
            <p className="text-xs text-slate-500 font-medium uppercase">Événements à venir</p>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent News */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-slate-900">Actualités Récentes</h2>
            <Link to="/actualites" className="text-xs font-semibold text-brand-600 hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-4">
            {news.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                {(() => {
                  const url = resolveImageUrl(item.image_url || (item as any).image_path);
                  return url ? (
                    <img src={url} alt={item.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    </div>
                  );
                })()}
                <div className="space-y-1 flex-1">
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-slate-900">Prochains Événements</h2>
            <Link to="/evenements" className="text-xs font-semibold text-brand-600 hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-4">
            {events.map(evt => (
              <div key={evt.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-brand-600 text-white rounded-xl flex flex-col items-center justify-center font-bold text-xs shrink-0">
                  <span>{new Date(evt.start_at).toLocaleString('fr-FR', { month: 'short' })}</span>
                  <span className="text-sm">{new Date(evt.start_at).getDate()}</span>
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="font-bold text-sm text-slate-900">{evt.title}</h3>
                  <p className="text-xs text-slate-500">📍 {evt.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
