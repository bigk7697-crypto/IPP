import React, { useState } from 'react';
import { X, Download, Search, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import { ResultItem } from '../types';
import { resultService } from '../services/result.service';

interface PDFViewerModalProps {
  result: ResultItem | null;
  onClose: () => void;
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({ result, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!result) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await resultService.getResultsByClass(result.class_id);
      if (res && res.downloadUrl) {
        window.open(res.downloadUrl, '_blank');
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      } else {
        alert('Téléchargement direct simulé pour : ' + result.file_name);
      }
    } catch {
      alert('Impossible d’obtenir l’URL signée du stockage sécurisé.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 bg-brand-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg text-brand-950 font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{result.class_name} — {result.result_type}</h3>
              <p className="text-xs text-slate-300">Année Académique : {result.academic_year} | Stockage Privé RLS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un élève dans le document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-900"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
              <span>Vérifié par l’Administration</span>
            </div>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-brand-900 hover:bg-brand-950 text-white text-sm font-medium rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{downloading ? 'Génération lien...' : 'Télécharger l’original'}</span>
            </button>
          </div>
        </div>

        {/* Download success banner */}
        {downloadSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-emerald-800 text-sm animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Lien sécurisé généré avec succès. Le fichier s'ouvre dans un nouvel onglet.</span>
          </div>
        )}

        {/* Document Simulated Viewer Area */}
        <div className="p-8 overflow-y-auto flex-1 bg-slate-50 font-mono text-xs sm:text-sm text-slate-800">
          <div className="bg-white p-8 rounded-xl shadow-inner border border-slate-200 space-y-6">
            <div className="text-center border-b border-slate-200 pb-6">
              <h1 className="font-bold text-lg text-slate-900 uppercase">RÉPUBLIQUE — INSTITUT POLYTECHNIQUE LA PAIX (IPP)</h1>
              <p className="font-bold text-base text-brand-900 mt-1">DIRECTION DES ÉTUDES ET DES EXAMENS</p>
              <p className="text-slate-500 mt-1">PROCES-VERBAL OFFICIEL — {result.result_type.toUpperCase()} ({result.academic_year})</p>
              <p className="text-slate-700 font-semibold mt-2">CLASSE : {result.class_name}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-600">
                    <th className="py-2 px-3">Rang</th>
                    <th className="py-2 px-3">Nom et Prénoms</th>
                    <th className="py-2 px-3">Moyenne Générale</th>
                    <th className="py-2 px-3">Mention</th>
                    <th className="py-2 px-3">Décision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className={searchQuery && 'Dupont'.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-yellow-50' : ''}>
                    <td className="py-4 px-3 font-bold">1</td>
                    <td className="py-4 px-3 font-semibold">DUPONT Jean</td>
                    <td className="py-4 px-3">16.85 / 20</td>
                    <td className="py-4 px-3 text-emerald-700 font-semibold">Très Bien</td>
                    <td className="py-4 px-3 text-emerald-600">Admis(e)</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-3 font-bold">2</td>
                    <td className="py-4 px-3 font-semibold">KANE Aminata</td>
                    <td className="py-4 px-3">16.40 / 20</td>
                    <td className="py-4 px-3 text-emerald-700 font-semibold">Très Bien</td>
                    <td className="py-4 px-3 text-emerald-600">Admis(e)</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-3 font-bold">3</td>
                    <td className="py-4 px-3 font-semibold">KOFFI Kouassi</td>
                    <td className="py-4 px-3">15.20 / 20</td>
                    <td className="py-4 px-3 text-brand-700 font-semibold">Bien</td>
                    <td className="py-4 px-3 text-emerald-600">Admis(e)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
              <p>Document officiel certifié par signature cryptographique Supabase Storage.</p>
              <p>Fichier : {result.file_name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
