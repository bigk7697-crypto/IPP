import { GalleryAlbum } from '../types';
import { apiFetch } from './apiClient';

export const galleryService = {
  async getAlbums(): Promise<GalleryAlbum[]> {
    const remote = await apiFetch<GalleryAlbum[]>('/gallery');
    return remote || [];
  }
};
