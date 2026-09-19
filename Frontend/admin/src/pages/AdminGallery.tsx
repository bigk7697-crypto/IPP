import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { GalleryAlbum } from '../types';

export const AdminGallery: React.FC = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadAlbums();
  }, []);

  async function loadAlbums() {
    const data = await adminService.getAlbums();
    setAlbums(data);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.createAlbum({
      title,
      description,
      cover_image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80'
    });
    setTitle('');
    setDescription('');
    setIsCreating(false);
    loadAlbums();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cet album ?')) {
      await adminService.deleteAlbum(id);
      loadAlbums();
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
          <button type="submit" className="px-6 py-2.5 bg-brand-900 text-white font-semibold rounded-xl text-sm">
            Créer l'album
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map(alb => (
          <div key={alb.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden p-6 space-y-4 shadow-sm">
            <div className="h-40 rounded-2xl overflow-hidden relative">
              <img src={alb.cover_image} alt={alb.title} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-lg">{alb.title}</h3>
              <p className="text-xs text-slate-500">{alb.description}</p>
              <p className="text-xs text-brand-700 font-mono pt-2">{alb.photos.length} photos</p>
            </div>
            <button onClick={() => handleDelete(alb.id)} className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold rounded-xl transition-colors">
              Supprimer l'album
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
