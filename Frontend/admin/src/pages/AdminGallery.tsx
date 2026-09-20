import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { GalleryAlbum } from '../types';
import { supabase } from '../services/supabaseClient';
import { ConfirmModal } from '../components/ConfirmModal';

export const AdminGallery: React.FC = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    loadAlbums();
  }, []);

  async function loadAlbums() {
    const data = await adminService.getAlbums();
    setAlbums(data);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      let cover_image_path: string | undefined = undefined;
      if (coverFile) {
        const ext = coverFile.name.split('.').pop() || 'jpg';
        const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
        const { error: upErr } = await supabase.storage.from('public-assets').upload(path, coverFile, { upsert: false });
        if (upErr) throw new Error('Upload couverture échoué: ' + upErr.message);
        cover_image_path = `public-assets/${path}`;
      }
      await adminService.createAlbum({ title, description, cover_image_path } as any);
      setSuccess('Album créé !');
      setTitle(''); setDescription(''); setCoverFile(null); setIsCreating(false);
      loadAlbums();
    } catch (err: any) {
      setError(err.message || 'Échec création');
    }
  };

  const handleImageUpload = async (albumId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(''); setSuccess('');
    setUploadingId(albumId);
    try {
      await adminService.uploadAlbumImage(albumId, file);
      setSuccess('Image uploadée !');
      loadAlbums();
    } catch (err: any) {
      setError(err.message || 'Échec upload');
    } finally {
      setUploadingId(null);
    }
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminService.deleteAlbum(deleteId);
      setDeleteId(null);
      loadAlbums();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion de la Galerie Photo</h1>
          <p className="text-slate-600 mt-1">Créez des albums et gérez les photos de l'établissement.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Fermer' : 'Nouvel Album'}</span>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Créer un album</h2>
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">{error}</div>}
          {success && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200">{success}</div>}
          <input
            type="text"
            required
            placeholder="Titre de l'album"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
          />
          <textarea
            required
            rows={3}
            placeholder="Description..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
          ></textarea>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Image de couverture (optionnel)</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-sm font-medium cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>{coverFile ? coverFile.name : 'Choisir une image'}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => setCoverFile(e.target.files?.[0] || null)} />
              </label>
              {coverFile && <button type="button" onClick={() => setCoverFile(null)} className="text-xs text-red-600">Retirer</button>}
            </div>
            <p className="text-[11px] text-slate-400">JPEG/PNG/WebP, 5Mo max. Laissez vide pour album sans couverture.</p>
          </div>
          <button type="submit" className="px-6 py-2.5 bg-brand-900 text-white font-semibold rounded-xl text-sm">
            Créer l'album
          </button>
        </form>
      )}

      {error && !isCreating && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">{error}</div>}
      {success && !isCreating && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200">{success}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((alb: any) => (
          <div key={alb.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden p-6 space-y-4 shadow-sm">
            <div className="h-40 rounded-2xl overflow-hidden relative bg-slate-100 flex items-center justify-center">
              {(alb.cover_image || alb.cover_image_path) ? (
                <img src={alb.cover_image || alb.cover_image_path} alt={alb.title} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-lg">{alb.title}</h3>
              <p className="text-xs text-slate-500">{alb.description}</p>
              <p className="text-xs text-brand-700 font-mono pt-2">{(alb.photos?.length ?? alb.images?.length ?? 0)} photos</p>
            </div>
            <div className="space-y-2">
              <label className="block w-full py-2 bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-semibold rounded-xl transition-colors text-center cursor-pointer">
                {uploadingId === alb.id ? 'Upload...' : 'Ajouter une image'}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => handleImageUpload(alb.id, e)} disabled={uploadingId === alb.id} />
              </label>
              <button onClick={() => setDeleteId(alb.id)} className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold rounded-xl transition-colors">
                Supprimer l'album
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={deleteId !== null}
        title="Supprimer cet album ?"
        message="L'album et toutes ses photos seront définitivement supprimés de la galerie."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setDeleteId(null)}
      />
    </div>
  );
};
