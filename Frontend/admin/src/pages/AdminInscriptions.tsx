import React, { useEffect, useState } from 'react';
import { Trash2, FileText, CalendarCheck, XCircle, BadgeCheck, Search, ExternalLink } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { ConfirmModal } from '../components/ConfirmModal';

interface Application {
  id: string;
  reference: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  parent_name: string;
  niveau: string;
  filiere_slug: string | null;
  status: string;
  rendez_vous_at: string | null;
  created_at: string;
}

interface Doc {
  id: string;
  type_piece: string;
  file_name: string;
  mime: string;
  size_bytes: number;
  downloadUrl: string;
}

const STATUS = ['soumis', 'verifie', 'convoque', 'refuse', 'admis'];
const STATUS_LABEL: Record<string, string> = {
  soumis: 'Soumis',
  verifie: 'Vérifié',
  convoque: 'Convoqué',
  refuse: 'Refusé',
  admis: 'Admis',
};

export const AdminInscriptions: React.FC = () => {
  const [apps, setApps] = useState<Application[]>([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [rdvAt, setRdvAt] = useState('');
  const [rdvMsg, setRdvMsg] = useState('');
  const [motif, setMotif] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [filter]);

  async function load() {
    setApps(await adminService.getApplications(filter || undefined));
  }

  async function openDetail(id: string) {
    setError('');
    const data = await adminService.getApplication(id);
    setSelected(data);
    setDocs(data.documents || []);
    setRdvAt('');
    setRdvMsg(data.rendez_vous_message || '');
    setMotif('');
  }

  async function decide(action: string) {
    if (!selected) return;
    setError('');
    setSuccess('');
    try {
      const payload: any = { action };
      if (action === 'convoquer') {
        if (!rdvAt) {
          setError('Choisissez une date et heure de rendez-vous.');
          return;
        }
        payload.rendez_vous_at = new Date(rdvAt).toISOString();
        payload.rendez_vous_message = rdvMsg;
      }
      if (action === 'refuser') {
        if (!motif.trim()) {
          setError('Indiquez le motif du refus (visible par la famille).');
          return;
        }
        payload.motif_refus = motif;
      }
      await adminService.decideApplication(selected.id, payload);
      setSuccess('Décision enregistrée — visible immédiatement sur la page de suivi.');
      const data = await adminService.getApplication(selected.id);
      setSelected(data);
      setDocs(data.documents || []);
      load();
    } catch (err: any) {
      setError(err.message || 'Décision impossible.');
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return;
    await adminService.deleteApplication(deleteId);
    setDeleteId(null);
    setSelected(null);
    load();
  };

  const filtered = apps.filter((a) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return a.reference.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.last_name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pré-inscriptions</h1>
        <p className="text-slate-600 mt-1">Vérifiez les dossiers, convoquez (date + message visibles par la famille) ou refusez avec motif.</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {['', ...STATUS].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold ${filter === s ? 'bg-brand-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
            {s === '' ? `Tous (${apps.length})` : STATUS_LABEL[s]}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Référence, email, nom…"
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">{error}</div>}
      {success && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200">{success}</div>}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="text-left px-4 py-3">Dossier</th><th className="text-left px-4 py-3">Statut</th><th className="text-right px-4 py-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a) => (
                <tr key={a.id} className={selected?.id === a.id ? 'bg-brand-50/50' : ''}>
                  <td className="px-4 py-3">
                    <button onClick={() => openDetail(a.id)} className="text-left">
                      <span className="font-mono font-bold text-brand-800 text-xs">{a.reference}</span>
                      <span className="block font-semibold text-slate-900">{a.first_name} {a.last_name} <span className="font-normal text-slate-400">— {a.niveau}</span></span>
                      <span className="block text-xs text-slate-400">{a.email}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      a.status === 'refuse' ? 'bg-red-100 text-red-700' : a.status === 'admis' ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-50 text-brand-800'
                    }`}>{STATUS_LABEL[a.status] || a.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDeleteId(a.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={3} className="px-4 py-10 text-center text-sm text-slate-400">Aucun dossier.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
          {!selected ? (
            <p className="text-sm text-slate-400 text-center py-16">Cliquez sur un dossier pour le vérifier.</p>
          ) : (
            <>
              <div className="space-y-1">
                <p className="font-mono font-bold text-brand-800">{selected.reference}</p>
                <h2 className="text-lg font-extrabold text-slate-900">{selected.first_name} {selected.last_name}</h2>
                <p className="text-xs text-slate-500">
                  Né(e) le {selected.birth_date || '—'} • {selected.niveau}{selected.filiere_slug ? ` • ${selected.filiere_slug}` : ''} •
                  Parent : {selected.parent_name} ({selected.phone}, {selected.email})
                </p>
                {selected.message && <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">« {selected.message} »</p>}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-slate-500">Pièces ({docs.length})</p>
                {docs.map((d) => (
                  <a key={d.id} href={d.downloadUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-xs bg-slate-50 hover:bg-brand-50 border border-slate-200 rounded-xl px-3 py-2 transition-colors">
                    <FileText className="w-4 h-4 text-brand-700 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{d.file_name}</span>
                    <span className="text-slate-400 ml-auto shrink-0">{d.type_piece}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </a>
                ))}
                {docs.length === 0 && <p className="text-xs text-slate-400">Aucune pièce.</p>}
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <p className="text-xs font-bold uppercase text-slate-500">Décision</p>
                {(selected.status === 'refuse' || selected.status === 'admis') && (
                  <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    Dossier clos ({selected.status === 'refuse' ? 'refusé' : 'admis'}) — aucune action possible.
                  </p>
                )}
                {selected.status === 'soumis' && (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => decide('verifier')} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl">Vérifier</button>
                  </div>
                )}
                {(selected.status === 'verifie' || selected.status === 'convoque') && (
                  <button onClick={() => decide('admettre')} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5" /> Admettre</button>
                )}
                {selected.status === 'verifie' && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <input type="datetime-local" value={rdvAt} onChange={(e) => setRdvAt(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                      <input value={rdvMsg} onChange={(e) => setRdvMsg(e.target.value)} placeholder="Message de convocation…"
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                    </div>
                    <button onClick={() => decide('convoquer')} className="w-full px-4 py-2 bg-brand-900 text-white text-xs font-bold rounded-xl inline-flex items-center justify-center gap-1">
                      <CalendarCheck className="w-3.5 h-3.5" /> Convoquer à cette date
                    </button>
                  </>
                )}
                {['soumis', 'verifie', 'convoque'].includes(selected.status) && (
                  <div className="flex gap-2">
                    <input value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Motif du refus (visible par la famille)…"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                    <button onClick={() => decide('refuser')} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Refuser
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal open={deleteId !== null} onCancel={() => setDeleteId(null)} onConfirm={handleDelete} title="Supprimer ce dossier ?" message="Le dossier et ses pièces seront définitivement supprimés." />
    </div>
  );
};
