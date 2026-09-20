import React, { useEffect, useState } from 'react';
import { Plus, Trash2, FolderOpen } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { DocumentItem } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';

export const AdminDocuments: React.FC = () => {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('Administratif');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadDocs();
  }, []);

  async function loadDocs() {
    const data = await adminService.getDocuments();
    setDocs(data);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!selectedFile) { setError('Veuillez sélectionner un fichier'); return; }
    try {
      await adminService.createDocument({
        title,
        description,
        category,
        visibility,
        status: 'published',
        file: selectedFile
      });
      setSuccess('Document publié !');
      setTitle(''); setDescription(''); setSelectedFile(null); setIsCreating(false);
      loadDocs();
    } catch (err: any) {
      setError(err.message || 'Échec publication');
    }
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminService.deleteDocument(deleteId);
      setDeleteId(null);
      loadDocs();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion des Documents</h1>
          <p className="text-slate-600 mt-1">Ajoutez ou supprimez les règlements intérieurs et formulaires administratifs.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Fermer' : 'Nouveau Document'}</span>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Ajouter un document</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Titre du document"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
            />
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
            >
              <option value="Règlement">Règlement</option>
              <option value="Administratif">Administratif</option>
              <option value="Pédagogique">Pédagogique</option>
              <option value="Formulaire">Formulaire</option>
            </select>
          </div>
          <textarea
            required
            rows={3}
            placeholder="Description..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
          ></textarea>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500">Fichier (PDF, Word, Excel)</label>
              <input type="file" required accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full text-sm" />
              {selectedFile && <p className="text-xs text-emerald-600 mt-1">{selectedFile.name}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Visibilité</label>
              <select value={visibility} onChange={e => setVisibility(e.target.value as any)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                <option value="public">Public (visible sans connexion)</option>
                <option value="private">Privé (connexion requise)</option>
              </select>
            </div>
          </div>
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">{error}</div>}
          {success && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200">{success}</div>}
          <button type="submit" className="px-6 py-2.5 bg-brand-900 text-white font-semibold rounded-xl text-sm">
            Enregistrer le document
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50">
              <th className="py-4 px-6">Titre</th>
              <th className="py-4 px-6">Catégorie</th>
              <th className="py-4 px-6">Fichier</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {docs.map(doc => (
              <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-brand-700" />
                  <span>{doc.title}</span>
                </td>
                <td className="py-4 px-6 text-slate-700">{doc.category}</td>
                <td className="py-4 px-6 text-slate-500 font-mono text-xs">{doc.file_name}</td>
                <td className="py-4 px-6 text-right">
                  <button onClick={() => setDeleteId(doc.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
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
        title="Supprimer ce document ?"
        message="Le document ne sera plus accessible ni côté public ni côté élèves."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setDeleteId(null)}
      />
    </div>
  );
};
