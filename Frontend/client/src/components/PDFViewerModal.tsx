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
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function loadUrl() {
      setLoadingUrl(true);
      try {
        const res = await resultService.getResultsByClass(result!.class_id);
        if (mounted && res?.downloadUrl) setDownloadUrl(res.downloadUrl);
      } catch {}
      if (mounted) setLoadingUrl(false);
    }
    if (result) loadUrl();
    return () => { mounted = false; };
  }, [result?.class_id]);

  if (!result) return null;

  const isPdf = (result.file_name || '').toLowerCase().endsWith('.pdf');
  const isExcel = (result.file_name || '').toLowerCase().match(/\.xlsx?$/) !== null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const url = downloadUrl || (await resultService.getResultsByClass(result.class_id))?.downloadUrl;
      if (url) {
        window.open(url, '_blank');
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      } else {
        alert('Fichier introuvable : ' + (result.file_name || result.file_path));
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

        {/* Document Viewer — fichier réel depuis Storage privé */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-50">
          {loadingUrl ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-4 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500">Chargement du document sécurisé...</p>
            </div>
          ) : !downloadUrl ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <p className="text-sm text-slate-600">Impossible de charger le fichier. Vérifiez que le document a bien été uploadé.</p>
              <p className="text-xs text-slate-400 mt-2">Fichier : {result.file_name || result.file_path}</p>
            </div>
          ) : isPdf ? (
            <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 text-white px-4 py-2 text-xs flex justify-between items-center">
                <span>{result.file_name || 'document.pdf'}</span>
                <span className="text-slate-400">{result.class_name} — {result.result_type}</span>
              </div>
              <iframe src={downloadUrl} title="Aperçu PDF" className="w-full h-[65vh] border-0" />
            </div>
          ) : isExcel ? (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{result.file_name || 'resultats.xlsx'}</h3>
                  <p className="text-xs text-slate-500 mt-1">Fichier Excel — {result.class_name} — {result.result_type}</p>
                </div>
                <div className="flex justify-center gap-3">
                  <button onClick={handleDownload} className="px-6 py-2.5 bg-brand-900 text-white rounded-xl text-sm font-semibold flex items-center gap-2">
                    <Download className="w-4 h-4" /> Télécharger
                  </button>
                  <a href={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(downloadUrl)}`} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold">Aperçu Office</a>
                </div>
                <p className="text-[11px] text-slate-400">Le fichier s'ouvre dans un nouvel onglet via URL signée temporaire (1h). Ne pas partager.</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(downloadUrl)}`} title="Aperçu Excel" className="w-full h-[60vh] border-0" />
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-4">
              <p className="text-sm text-slate-700">Fichier : <strong>{result.file_name || result.file_path}</strong></p>
              <button onClick={handleDownload} className="px-6 py-2.5 bg-brand-900 text-white rounded-xl text-sm font-semibold">Télécharger</button>
            </div>
          )}
          <div className="pt-4 flex justify-between items-center text-xs text-slate-500">
            <span>Document certifié — Storage privé RLS</span>
            <span>{result.file_name || result.file_path}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
