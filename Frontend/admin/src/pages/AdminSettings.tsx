import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, CheckCircle2, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const AdminSettings: React.FC = () => {
  const [schoolName, setSchoolName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/settings`);
        const json = await res.json();
        const data = json.data || json;
        if (data) {
          setSchoolName(data.school_name || '');
          setAcademicYear(data.academic_year || '2025-2026');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('school_token');
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ school_name: schoolName, academic_year: academicYear }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || 'Échec enregistrement');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
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
              required
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
              placeholder="IPP La Paix"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Année Académique Courante</label>
            <input
              type="text"
              required
              pattern="^\d{4}-\d{4}$"
              placeholder="2025-2026"
              value={academicYear}
              onChange={e => setAcademicYear(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
            />
            <p className="text-[11px] text-slate-400">Format : 2025-2026 — utilisé pour les classes et résultats.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-brand-900 hover:bg-brand-950 text-white font-semibold rounded-xl text-sm shadow-sm transition-all disabled:opacity-50"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </button>
      </form>
    </div>
  );
};
