import { GalleryAlbum } from '../types';
import { apiFetch } from './apiClient';

export const galleryService = {
  async getAlbums(): Promise<GalleryAlbum[]> {
    const remote = await apiFetch<GalleryAlbum[]>('/gallery');
    return remote || [];
  },

  async createAlbum(data: Omit<GalleryAlbum, 'id' | 'created_at' | 'photos'>): Promise<GalleryAlbum> {
    const remote = await apiFetch<GalleryAlbum>('/admin/gallery', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!remote) throw new Error('Échec de création de l’album via l’API');
    return remote;
  },

  async addPhotoToAlbum(albumId: string, photo: { url: string; caption: string }): Promise<void> {
    await apiFetch(`/admin/gallery/${albumId}/photos`, {
      method: 'POST',
      body: JSON.stringify(photo)
    });
  },

  async deleteAlbum(id: string): Promise<void> {
    await apiFetch(`/admin/gallery/${id}`, { method: 'DELETE' });
  }
};
