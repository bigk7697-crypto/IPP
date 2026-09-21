import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, CheckCircle2, MessageCircleQuestion } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { ConfirmModal } from '../components/ConfirmModal';

interface Topic {
  id: string;
  slug: string;
  category: 'filieres' | 'infos';
  title: string;
  content: string;
  keywords: string;
  is_published: boolean;
  sort_order: number;
}

interface Unanswered {
  id: string;
  question: string;
  source: string;
  handled: boolean;
  created_at: string;
}

const EMPTY: Omit<Topic, 'id'> = {
  slug: '', category: 'infos', title: '', content: '', keywords: '', is_published: true, sort_order: 0,
};

export const AdminOrientation: React.FC = () => {
  const [tab, setTab] = useState<'topics' | 'journal'>('topics');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [journal, setJournal] = useState<Unanswered[]>([]);
  const [showJournalUnhandled, setShowJournalUnhandled] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteJournalId, setDeleteJournalId] = useState<string | null>(null);

  useEffect(() => {
    loadTopics();
    refreshJournal();
  }, []);

  async function loadTopics() {
    setTopics(await adminService.getOrientationTopics());
  }
  async function refreshJournal() {
    const data = await adminService.getUnanswered();
    setJournal(data);
  }

  const startCreate = () => { setForm(EMPTY); setEditingId(null); setShowForm(true); setError(''); setSuccess(''); };
  const startEdit = (t: Topic) => {
    setForm({ slug: t.slug, category: t.category, title: t.title, content: t.content, keywords: t.keywords || '', is_published: t.is_published, sort_order: t.sort_order || 0 });
    setEditingId(t.id);
    setShowForm(true);
    setError(''); setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      if (editingId) {
        await adminService.updateOrientationTopic(editingId, form);
        setSuccess('Fiche mise à jour — visible immédiatement côté client.');
      } else {
        await adminService.createOrientationTopic(form);
        setSuccess('Fiche créée — visible immédiatement côté client.');
      }
      setShowForm(false);
      setEditingId(null);
      loadTopics();
    } catch (err: any) {
      setError(err.message || 'Échec d’enregistrement');
    }
  };

  const handleDeleteTopic = async () => {
    if (!deleteId) return;
    await adminService.deleteOrientationTopic(deleteId);
    setDeleteId(null);
    loadTopics();
  };

  const handleJournal = async (id: string, handled: boolean) => {
    await adminService.markUnanswered(id, handled);
    refreshJournal();
  };
  const handleDeleteJournal = async () => {
    if (!deleteJournalId) return;
    await adminService.deleteUnanswered(deleteJournalId);
    setDeleteJournalId(null);
    refreshJournal();
  };

  const visibleJournal = showJournalUnhandled ? journal.filter((j) => !j.handled) : journal;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Orientation — Assistant & Quiz</h1>
        <p className="text-slate-600 mt-1">Tout ce que vous modifiez ici est visible immédiatement côté client (assistant, quiz, page Orientation).</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('topics')} className={`px-5 py-2.5 rounded-2xl text-sm font-bold ${tab === 'topics' ? 'bg-brand-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
          Base de connaissances ({topics.length})
        </button>
        <button onClick={() => { setTab('journal'); refreshJournal(); }} className={`px-5 py-2.5 rounded-2xl text-sm font-bold ${tab === 'journal' ? 'bg-brand-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
          Questions sans réponse ({journal.filter((j) => !j.handled).length})
        </button>
      </div>

      {tab === 'topics' && (
        <>
          <div className="flex justify-end">
            <button onClick={() => (showForm ? setShowForm(false) : startCreate())} className="flex items-center gap-2 px-4 py-2.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold rounded-xl text-sm">
              <Plus className="w-4 h-4" /> {showForm ? 'Fermer' : 'Nouvelle fiche'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Modifier la fiche' : 'Nouvelle fiche'}</h2>
              {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">{error}</div>}
              {success && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200">{success}</div>}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Slug (identifiant URL)</label>
                  <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="ex : frais-scolarite"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Catégorie</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-600">
                    <option value="infos">Info pratique</option>
                    <option value="filieres">Filière</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Ordre d’affichage</label>
                  <input type="number" min={0} max={1000} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Titre</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Contenu (visible côté client)</label>
                <textarea required rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Mots-clés (séparés par des virgules — servent à la recherche)</label>
                <input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="frais, prix, tarif, scolarité"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4" />
                Publié (visible côté client)
              </label>
              <button type="submit" className="px-6 py-2.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold rounded-xl text-sm">
                {editingId ? 'Enregistrer' : 'Créer'}
              </button>
            </form>
          )}
          {!showForm && success && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200">{success}</div>}

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3">Titre</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Catégorie</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Statut</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topics.map((t) => (
                  <tr key={t.id}>
                    <td className="px-5 py-3 font-semibold text-slate-900">{t.title}<span className="block text-xs font-normal text-slate-400">{t.slug}</span></td>
                    <td className="px-5 py-3 hidden md:table-cell text-slate-600">{t.category === 'filieres' ? 'Filière' : 'Info'}</td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        {t.is_published ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <button onClick={() => startEdit(t)} className="p-2 text-brand-700 hover:bg-brand-50 rounded-lg" title="Modifier"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(t.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'journal' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <MessageCircleQuestion className="w-5 h-5 text-brand-700" />
            <p className="text-slate-600">Questions posées par les visiteurs restées sans réponse. Ajoutez la réponse dans la base, puis marquez « traitée ».</p>
            <label className="ml-auto flex items-center gap-2 font-semibold text-slate-700">
              <input type="checkbox" checked={showJournalUnhandled} onChange={(e) => setShowJournalUnhandled(e.target.checked)} className="w-4 h-4" />
              Non traitées uniquement
            </label>
          </div>
          {visibleJournal.length === 0 && <p className="text-sm text-slate-500 py-8 text-center">Rien à traiter. 🎉</p>}
          {visibleJournal.map((j) => (
            <div key={j.id} className={`bg-white border rounded-2xl p-4 flex items-start gap-3 ${j.handled ? 'border-slate-200 opacity-60' : 'border-amber-200'}`}>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold text-slate-900">« {j.question} »</p>
                <p className="text-xs text-slate-400">{new Date(j.created_at).toLocaleString('fr-FR')} • via {j.source === 'quiz' ? 'quiz' : 'assistant'}</p>
              </div>
              {!j.handled && (
                <button onClick={() => handleJournal(j.id, true)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold rounded-xl">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Traitée
                </button>
              )}
              <button onClick={() => setDeleteJournalId(j.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal open={deleteId !== null} onCancel={() => setDeleteId(null)} onConfirm={handleDeleteTopic} title="Supprimer cette fiche ?" message="Elle disparaîtra immédiatement de l’assistant, du quiz et de la page Orientation." />
      <ConfirmModal open={deleteJournalId !== null} onCancel={() => setDeleteJournalId(null)} onConfirm={handleDeleteJournal} title="Supprimer cette question ?" message="Elle sera retirée du journal." />
    </div>
  );
};
