import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { SchoolClass } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';

export const AdminClasses: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [level, setLevel] = useState<any>('Terminale');
  const [series, setSeries] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    const data = await adminService.getClasses();
    setClasses(data);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.createClass({
      name,
      level,
      series: series || 'Scientifique',
      academic_year: '2025-2026',
      is_active: true
    });
    setName('');
    setSeries('');
    setIsCreating(false);
    loadClasses();
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminService.deleteClass(deleteId);
      setDeleteId(null);
      loadClasses();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion des Classes</h1>
          <p className="text-slate-600 mt-1">Définissez les classes et séries disponibles pour les résultats et inscriptions.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Fermer' : 'Nouvelle Classe'}</span>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Ajouter une classe</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              required
              placeholder="Nom (ex: Terminale D1)"
              value={name}
              onChange={e => setName(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
            />
            <select
              value={level}
              onChange={e => setLevel(e.target.value as any)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
            >
              <option value="Seconde">Seconde</option>
              <option value="Première">Première</option>
              <option value="Terminale">Terminale</option>
            </select>
            <input
              type="text"
              placeholder="Série (ex: Scientifique D)"
              value={series}
              onChange={e => setSeries(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
            />
          </div>
          <button type="submit" className="px-6 py-2.5 bg-brand-900 text-white font-semibold rounded-xl text-sm">
            Enregistrer la classe
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50">
              <th className="py-4 px-6">Classe</th>
              <th className="py-4 px-6">Niveau</th>
              <th className="py-4 px-6">Série</th>
              <th className="py-4 px-6">Année</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {classes.map(cls => (
              <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-700" />
                  <span>{cls.name}</span>
                </td>
                <td className="py-4 px-6 text-slate-700">{cls.level}</td>
                <td className="py-4 px-6 text-slate-500">{cls.series}</td>
                <td className="py-4 px-6 text-slate-500">{cls.academic_year}</td>
                <td className="py-4 px-6 text-right">
                  <button onClick={() => setDeleteId(cls.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
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
        title="Supprimer cette classe ?"
        message="La classe et son accès aux résultats seront retirés. Impossible si des résultats y sont liés."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setDeleteId(null)}
      />
    </div>
  );
};
