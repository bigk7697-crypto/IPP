import React, { useEffect, useState } from 'react';
import { Plus, Trash2, ShieldCheck, FileSpreadsheet, Upload } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { ResultItem, SchoolClass } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';

export const AdminResults: React.FC = () => {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [resultType, setResultType] = useState<any>('Trimestre 1');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [resData, clsData] = await Promise.all([
      adminService.getResults(),
      adminService.getClasses()
    ]);
    setResults(resData);
    setClasses(clsData);
    if (clsData.length > 0) setSelectedClassId(clsData[0].id);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!selectedFile) { setError('Veuillez sélectionner un fichier PDF ou Excel'); return; }
    if (!selectedClassId) { setError('Veuillez sélectionner une classe'); return; }
    try {
      await adminService.createResult({
        class_id: selectedClassId,
        academic_year: academicYear,
        result_type: resultType,
        file: selectedFile,
        status: 'published'
      });
      setSuccess('Résultat publié ! Notification privée envoyée aux élèves.');
      setSelectedFile(null); setIsUploading(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Échec upload');
    }
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminService.deleteResult(deleteId);
      setDeleteId(null);
      loadData();
    } finally {
      setDeleting(false);
    }
  };

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="space-y-8">
      <div className={`p-8 rounded-3xl shadow-sm flex items-center justify-between border ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Gestion des Résultats</h1>
          <p className="text-slate-500 mt-1">Uploadez les fichiers de notes officiels (PDF, XLSX) pour consultation sécurisée.</p>
        </div>
        <button
          onClick={() => setIsUploading(!isUploading)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isUploading ? 'Fermer' : 'Uploader un Résultat'}</span>
        </button>
      </div>

      {isUploading && (
        <form onSubmit={handleUpload} className={`border p-8 rounded-3xl space-y-6 shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Publier un nouveau fichier de notes</span>
          </h2>
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">{error}</div>}
          {success && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200">{success}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Classe concernée</label>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.series})</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Type d'évaluation</label>
              <select
                value={resultType}
                onChange={e => setResultType(e.target.value as any)}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="Trimestre 1">Trimestre 1</option>
                <option value="Trimestre 2">Trimestre 2</option>
                <option value="Trimestre 3">Trimestre 3</option>
                <option value="Résultats Annuels">Résultats Annuels</option>
                <option value="Examen Blanc">Examen Blanc</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Année Académique</label>
              <input
                type="text"
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">Fichier de notes (PDF, Excel)</label>
            <div className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
              isDark ? 'border-slate-800 bg-slate-950/50 hover:border-brand-600' : 'border-slate-300 bg-slate-50 hover:border-brand-600'
            }`}>
              <input
                type="file"
                accept=".pdf,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="result-file-input"
              />
              <label htmlFor="result-file-input" className="cursor-pointer space-y-2 block">
                <Upload className="w-10 h-10 text-brand-600 mx-auto" />
                <p className="text-sm font-semibold">
                  {selectedFile ? selectedFile.name : 'Cliquez pour sélectionner un fichier PDF ou Excel'}
                </p>
                <p className="text-xs text-slate-400">Formats acceptés : .pdf, .xlsx, .xls (Stockage sécurisé)</p>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="px-8 py-3.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold rounded-xl text-sm shadow-md transition-all"
          >
            Publier et notifier les élèves
          </button>
        </form>
      )}

      <div className={`border rounded-3xl overflow-hidden shadow-sm ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b text-xs font-bold uppercase ${
              isDark ? 'border-slate-800 text-slate-400 bg-slate-950/50' : 'border-slate-200 text-slate-500 bg-slate-50'
            }`}>
              <th className="py-4 px-6">Classe</th>
              <th className="py-4 px-6">Type d'évaluation</th>
              <th className="py-4 px-6">Fichier Source</th>
              <th className="py-4 px-6">Date de Publication</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {results.map(res => (
              <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-4 px-6 font-semibold flex items-center gap-3">
                  <div className="p-2 bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 rounded-xl">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <span>{res.class_name}</span>
                </td>
                <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{res.result_type}</td>
                <td className="py-4 px-6 text-slate-500 font-mono text-xs">{res.file_name}</td>
                <td className="py-4 px-6 text-slate-500">{new Date(res.published_at).toLocaleDateString('fr-FR')}</td>
                <td className="py-4 px-6 text-right">
                  <button onClick={() => setDeleteId(res.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={deleteId !== null}
        title="Supprimer ce résultat ?"
        message="Le fichier de notes sera retiré de l'espace élèves. Cette action est irréversible."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setDeleteId(null)}
      />
    </div>
  );
};
