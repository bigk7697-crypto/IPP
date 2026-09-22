import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import { eventService } from '../../services/event.service';
import { resolveImageUrl } from '../../utils/images';
import { useRealtime } from '../../hooks/useRealtime';
import { EventItem } from '../../types';

export const EventsList: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rtick, setRtick] = useState(0);

  useRealtime('events', undefined, () => setRtick((t) => t + 1), true);

  useEffect(() => {
    async function load() {
      const data = await eventService.getEvents();
      setEvents(data);
      setLoading(false);
    }
    load();
  }, [rtick]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Agenda & Événements</h1>
        <p className="text-slate-600 mt-2">Retrouvez toutes les dates importantes, réunions, examens et manifestations culturelles.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((evt) => (
            <div key={evt.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden">
              {resolveImageUrl(evt.image_path) ? (
                <div className="h-48 overflow-hidden">
                  <img src={resolveImageUrl(evt.image_path)} alt={evt.title} className="w-full h-full object-cover" />
                </div>
              ) : null}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="inline-block px-3 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full">
                    {evt.status === 'upcoming' ? 'À venir' : 'En cours'}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">{evt.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-3">{evt.description}</p>
                </div>
                <div className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-600" />
                    <span>{new Date(evt.start_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-600" />
                    <span>{evt.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
