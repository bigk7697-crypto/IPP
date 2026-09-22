import React, { useState } from 'react';
import { Search, CalendarCheck, XCircle, Hourglass, BadgeCheck, FileCheck } from 'lucide-react';
import { inscriptionService, DossierSuivi, STATUS_LABEL } from '../../services/inscription.service';

const STEPS = ['soumis', 'verifie', 'convoque', 'admis'] as const;

export const SuiviDossier: React.FC = () => {
  const [ref, setRef] = useState('');
  const [dossier, setDossier] = useState<DossierSuivi | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) return;
    setLoading(true);
    setError('');
    setDossier(null);
    try {
      const d = await inscriptionService.track(ref);
      setDossier(d);
    } catch {
      setError('Référence introuvable. Vérifiez le format (ex : IPP-2026-A8K2QD).');
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = dossier ? STEPS.indexOf(dossier.status as any) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Suivre mon dossier</h1>
        <p className="text-slate-600">Entrez la référence reçue lors du dépôt (ex : IPP-2026-A8K2QD).</p>
      </div>

      <form onSubmit={lookup} className="flex gap-2">
        <input
          value={ref}
          onChange={(e) => setRef(e.target.value.toUpperCase())}
          placeholder="IPP-2026-…"
          className="flex-1 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-900 shadow-sm"
        />
        <button type="submit" disabled={loading} className="px-6 py-3.5 bg-brand-900 hover:bg-brand-950 text-white text-sm font-bold rounded-2xl transition-colors disabled:opacity-50">
          <Search className="w-4 h-4" />
        </button>
      </form>

      {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">{error}</div>}

      {dossier && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
          <div className="text-center space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{dossier.reference}</p>
            <h2 className="text-xl font-extrabold text-slate-900">
              Dossier de {dossier.first_name} — {dossier.niveau}
            </h2>
            <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${
              dossier.status === 'refuse' ? 'bg-red-100 text-red-700' :
              dossier.status === 'admis' ? 'bg-emerald-100 text-emerald-700' :
              'bg-brand-50 text-brand-800'
            }`}>
              {STATUS_LABEL[dossier.status]}
            </span>
          </div>

          {dossier.status !== 'refuse' ? (
            <div className="space-y-0">
              {STEPS.map((s, i) => (
                <div key={s} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      stepIndex >= i ? 'bg-brand-900 text-white' : 'bg-slate-200 text-slate-400'
                    }`}>
                      {stepIndex > i ? <BadgeCheck className="w-4 h-4" /> : <Hourglass className="w-4 h-4" />}
                    </div>
                    {i < STEPS.length - 1 && <div className={`w-0.5 h-8 ${stepIndex > i ? 'bg-brand-900' : 'bg-slate-200'}`}></div>}
                  </div>
                  <div className="pb-6">
                    <p className={`text-sm font-bold ${stepIndex >= i ? 'text-slate-900' : 'text-slate-400'}`}>{STATUS_LABEL[s]}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3">
              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-red-800">Dossier refusé</p>
                <p className="text-red-700">{dossier.motif_refus || 'Contactez le secrétariat pour plus d’informations.'}</p>
              </div>
            </div>
          )}

          {dossier.status === 'convoque' && dossier.rendez_vous_at && (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <p className="flex items-center gap-2 font-bold text-amber-900"><CalendarCheck className="w-5 h-5" /> Rendez-vous</p>
              <p className="text-amber-900 font-extrabold">
                {new Date(dossier.rendez_vous_at).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              {dossier.rendez_vous_message && <p className="text-sm text-amber-800 whitespace-pre-line">{dossier.rendez_vous_message}</p>}
            </div>
          )}

          {dossier.status === 'admis' && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex gap-3">
              <FileCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800">Bienvenue à IPP La Paix ! Présentez-vous au secrétariat pour finaliser l’inscription.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
