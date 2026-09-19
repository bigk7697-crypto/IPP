import React, { useState } from 'react';
import { Settings as SettingsIcon, CheckCircle2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [schoolName, setSchoolName] = useState('Lycée Scientifique et Technique Saint-Exupéry');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Paramètres de l'Établissement</h1>
        <p className="text-slate-600 mt-1">Configurez les informations générales de l'école et les options système.</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Paramètres mis à jour avec succès.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-slate-200 p-8 rounded-3xl space-y-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-brand-700" />
          <span>Informations Générales</span>
        </h2>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Nom de l'établissement</label>
            <input
              type="text"
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Année Académique Courante</label>
            <input
              type="text"
              value={academicYear}
              onChange={e => setAcademicYear(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-brand-900 hover:bg-brand-950 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
        >
          Enregistrer les paramètres
        </button>
      </form>
    </div>
  );
};
