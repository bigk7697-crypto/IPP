import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Eye, ShieldCheck } from 'lucide-react';
import { classesService } from '../../services/classes.service';
import { resultService } from '../../services/result.service';
import { SchoolClass, ResultItem } from '../../types';
import { PDFViewerModal } from '../../components/PDFViewerModal';

export const Results: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [resultData, setResultData] = useState<{ result: ResultItem; downloadUrl: string; expiresIn: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadClasses() {
      try {
        const cls = await classesService.getClasses();
        setClasses(cls);
        if (cls.length > 0) {
          setSelectedClassId(cls[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    async function loadResultForClass() {
      setLoading(true);
      try {
        const data = await resultService.getResultsByClass(selectedClassId);
        setResultData(data);
      } catch (err) {
        console.error(err);
        setResultData(null);
      } finally {
        setLoading(false);
      }
    }
    loadResultForClass();
  }, [selectedClassId]);

  const selectedClass = classes.find(c => c.id === selectedClassId);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Résultats Scolaires</h1>
        <p className="text-slate-600 mt-1">Sélectionnez votre classe pour consulter et télécharger les procès-verbaux de notes officiels.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1.5 w-full sm:w-80">
          <label className="text-xs font-bold uppercase text-slate-500">Sélectionner la Classe</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-900"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} — {c.series} ({c.academic_year})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Accès sécurisé par politiques RLS & URLs signées (Supabase Storage)</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !resultData?.result ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <p className="text-slate-500 font-medium">Aucun résultat officiel publié pour cette classe.</p>
          {selectedClass && <p className="text-xs text-slate-400">Classe sélectionnée : {selectedClass.name} — {selectedClass.academic_year}</p>}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                  <th className="py-4 px-6">Classe</th>
                  <th className="py-4 px-6">Type de Résultat</th>
                  <th className="py-4 px-6">Année Académique</th>
                  <th className="py-4 px-6">Date de Publication</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-brand-50 text-brand-900 rounded-xl">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <span>{resultData.result.class_name || resultData.result.class_id || selectedClass?.name || 'Classe'}</span>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-700">{resultData.result.result_type || '—'}</td>
                  <td className="py-4 px-6 text-slate-500">{resultData.result.academic_year || '—'}</td>
                  <td className="py-4 px-6 text-slate-500">
                    {resultData.result.published_at ? new Date(resultData.result.published_at).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-brand-900 hover:bg-brand-950 text-white font-medium rounded-xl text-xs shadow-sm transition-all"
                    >
                      <Eye className="w-4 h-4 text-amber-400" />
                      <span>Ouvrir la Visionneuse</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Viewer Modal */}
      {modalOpen && resultData && (
        <PDFViewerModal result={resultData.result} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
};
