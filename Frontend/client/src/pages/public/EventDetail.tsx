import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock } from 'lucide-react';
import { eventService } from '../../services/event.service';
import { EventItem } from '../../types';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (id) {
        const item = await eventService.getEventById(id);
        if (item) setEvent(item);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-32 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Événement introuvable</h2>
        <Link to="/evenements" className="text-brand-600 font-medium hover:underline">← Retour aux événements</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div>
        <Link to="/evenements" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-600 mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux événements</span>
        </Link>
        <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full uppercase tracking-wider">
          Événement Scolaire
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-4">
          {event.title}
        </h1>
        <div className="flex flex-wrap gap-6 mt-4 text-sm text-slate-600 border-y border-slate-200 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>{new Date(event.start_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      {event.image_path && (
        <div className="rounded-3xl overflow-hidden shadow-lg h-96">
          <img src={event.image_path} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6 text-lg">
        <p>{event.description}</p>
        <p>
          Tous les élèves ainsi que leurs parents sont cordialement invités à prendre part à cet événement marquant de la vie de notre établissement.
        </p>
      </div>
    </div>
  );
};
