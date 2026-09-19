import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { galleryService } from '../../services/gallery.service';
import { GalleryAlbum } from '../../types';

export const Gallery: React.FC = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [activePhoto, setActivePhoto] = useState<{ url: string; caption: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await galleryService.getAlbums();
      setAlbums(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Galerie Photo</h1>
        <p className="text-lg text-slate-600">
          Plongez en images dans le quotidien, les activités et les grands moments de notre établissement.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-16">
          {albums.map((album) => (
            <div key={album.id} className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold text-slate-900">{album.title}</h2>
                <p className="text-slate-600 text-sm mt-1">{album.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {album.photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setActivePhoto(photo)}
                    className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer h-64 bg-slate-100"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <p className="text-white text-sm font-medium">{photo.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4">
          <button
            onClick={() => setActivePhoto(null)}
            className="absolute top-6 right-6 p-3 text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl w-full space-y-4 text-center">
            <img src={activePhoto.url} alt={activePhoto.caption} className="max-h-[75vh] mx-auto rounded-xl shadow-2xl object-contain" />
            <p className="text-white text-base font-medium">{activePhoto.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
};
