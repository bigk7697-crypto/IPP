import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { NewsItem } from '../types';
import { supabase } from '../services/supabaseClient';

export const AdminNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadNews();
  }, []);

  async function loadNews() {
    const data = await adminService.getNews();
    setNews(data);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      let image_path: string | undefined = undefined;
      if (selectedImage) {
        const ext = selectedImage.name.split('.').pop() || 'jpg';
        const path = `news/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
        const { error: upErr } = await supabase.storage.from('public-assets').upload(path, selectedImage, { upsert: false });
        if (upErr) throw new Error('Upload image échoué: ' + upErr.message);
        image_path = `public-assets/${path}`;
      }
      await adminService.createNews({ title, content, status, image_path });
      setSuccess('Actualité publiée avec succès ! Visible côté client et notification envoyée.');
      setTitle(''); setContent(''); setSelectedImage(null); setIsCreating(false);
      loadNews();
    } catch (err: any) {
      setError(err.message || 'Échec de publication');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous supprimer cette actualité ?')) {
      await adminService.deleteNews(id);
      loadNews();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion des Actualités</h1>
          <p className="text-slate-600 mt-1">Publiez ou modifiez les actualités visibles sur le site public.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Fermer' : 'Nouvelle Actualité'}</span>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Créer une actualité</h2>
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">{error}</div>}
          {success && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200">{success}</div>}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Titre</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              placeholder="Titre de l'actualité..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Contenu</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              placeholder="Contenu détaillé..."
            ></textarea>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Statut de publication</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
            >
              <option value="published">Publié (Visible sur le site public)</option>
              <option value="draft">Brouillon (Non visible)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Image (optionnel)</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-sm font-medium cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>{selectedImage ? selectedImage.name : 'Choisir une image'}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => setSelectedImage(e.target.files?.[0] || null)} />
              </label>
              {selectedImage && <button type="button" onClick={() => setSelectedImage(null)} className="text-xs text-red-600">Retirer</button>}
            </div>
            <p className="text-[11px] text-slate-400">JPEG/PNG/WebP, 5Mo max. Laissez vide pour une actualité texte seule.</p>
          </div>
          <button type="submit" className="px-6 py-2.5 bg-brand-900 text-white font-semibold rounded-xl text-sm">
            Enregistrer et Publier
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50">
              <th className="py-4 px-6">Titre</th>
              <th className="py-4 px-6">Statut</th>
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {news.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900">{item.title}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-500">{new Date(item.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="py-4 px-6 text-right">
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
