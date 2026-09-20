import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { EventItem } from '../types';

export const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const data = await adminService.getEvents();
    setEvents(data);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const iso = startAt ? new Date(startAt).toISOString() : new Date().toISOString();
      await adminService.createEvent({ title, description, location, start_at: iso, status: 'published' });
      setSuccess('Événement publié ! Visible sur calendrier et notifications.');
      setTitle(''); setLocation(''); setDescription(''); setStartAt(''); setIsCreating(false);
      loadEvents();
    } catch (err: any) {
      setError(err.message || 'Échec de publication');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cet événement ?')) {
      await adminService.deleteEvent(id);
      loadEvents();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion des Événements</h1>
          <p className="text-slate-600 mt-1">Planifiez les événements et rappels automatiques pour le calendrier.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Fermer' : 'Nouvel Événement'}</span>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Créer un événement</h2>
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">{error}</div>}
          {success && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200">{success}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Titre de l'événement"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
            />
            <input
              type="text"
              required
              placeholder="Lieu (ex: Amphithéâtre)"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
            />
          </div>
          <input
            type="datetime-local"
            required
            value={startAt}
            onChange={e => setStartAt(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
          />
          <textarea
            required
            rows={3}
            placeholder="Description..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
          ></textarea>
          <button type="submit" className="px-6 py-2.5 bg-brand-900 text-white font-semibold rounded-xl text-sm">
            Publier l'événement
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50">
              <th className="py-4 px-6">Titre</th>
              <th className="py-4 px-6">Lieu</th>
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {events.map(evt => (
              <tr key={evt.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900">{evt.title}</td>
                <td className="py-4 px-6 text-slate-600">{evt.location}</td>
                <td className="py-4 px-6 text-slate-600">{new Date(evt.start_at).toLocaleDateString('fr-FR')}</td>
                <td className="py-4 px-6 text-right">
                  <button onClick={() => handleDelete(evt.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
