import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';
import { eventService } from '../../services/event.service';
import { EventItem } from '../../types';

export const Calendar: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await eventService.getEvents();
      setEvents(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Calendrier Scolaire</h1>
        <p className="text-lg text-slate-600">
          Vue d'ensemble des événements, examens et réunions programmés pour l'année académique.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
          <div className="space-y-6">
            {events.map((evt) => (
              <div key={evt.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-200/60 hover:border-brand-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-brand-600 text-white rounded-2xl flex flex-col items-center justify-center font-bold shrink-0 shadow-md shadow-brand-500/20">
                    <span className="text-xs uppercase">{new Date(evt.start_at).toLocaleString('fr-FR', { month: 'short' })}</span>
                    <span className="text-lg">{new Date(evt.start_at).getDate()}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wide">Événement Officiel</span>
                    <h3 className="text-lg font-bold text-slate-900">{evt.title}</h3>
                    <p className="text-sm text-slate-600">{evt.description}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1 text-xs text-slate-500 shrink-0">
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-brand-600" />
                    <span>{evt.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-brand-600" />
                    <span>{new Date(evt.start_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
