import { NewsItem, EventItem, SchoolClass, ResultItem, DocumentItem, GalleryAlbum } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function adminFetch<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.data || data;
  } catch {
    return null;
  }
}

export const adminService = {
  async getNews() {
    const remote = await adminFetch<NewsItem[]>('/admin/news');
    return remote || [];
  },
  async createNews(data: Omit<NewsItem, 'id' | 'created_at'>) {
    const remote = await adminFetch<NewsItem>('/admin/news', { method: 'POST', body: JSON.stringify(data) });
    if (!remote) throw new Error('Erreur API création actualité');
    return remote;
  },
  async updateNews(id: string, data: Partial<NewsItem>) {
    const remote = await adminFetch<NewsItem>(`/admin/news/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    if (!remote) throw new Error('Erreur API modification actualité');
    return remote;
  },
  async deleteNews(id: string) {
    await adminFetch(`/admin/news/${id}`, { method: 'DELETE' });
  },

  async getEvents() {
    const remote = await adminFetch<EventItem[]>('/admin/events');
    return remote || [];
  },
  async createEvent(data: Omit<EventItem, 'id' | 'created_at'>) {
    const remote = await adminFetch<EventItem>('/admin/events', { method: 'POST', body: JSON.stringify(data) });
    if (!remote) throw new Error('Erreur API création événement');
    return remote;
  },
  async updateEvent(id: string, data: Partial<EventItem>) {
    const remote = await adminFetch<EventItem>(`/admin/events/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    if (!remote) throw new Error('Erreur API modification événement');
    return remote;
  },
  async deleteEvent(id: string) {
    await adminFetch(`/admin/events/${id}`, { method: 'DELETE' });
  },

  async getClasses() {
    const remote = await adminFetch<SchoolClass[]>('/admin/classes');
    return remote || [];
  },
  async createClass(data: Omit<SchoolClass, 'id' | 'created_at'>) {
    const remote = await adminFetch<SchoolClass>('/admin/classes', { method: 'POST', body: JSON.stringify(data) });
    if (!remote) throw new Error('Erreur API création classe');
    return remote;
  },
  async updateClass(id: string, data: Partial<SchoolClass>) {
    const remote = await adminFetch<SchoolClass>(`/admin/classes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    if (!remote) throw new Error('Erreur API modification classe');
    return remote;
  },
  async deleteClass(id: string) {
    await adminFetch(`/admin/classes/${id}`, { method: 'DELETE' });
  },

  async getResults() {
    const remote = await adminFetch<ResultItem[]>('/admin/results');
    return remote || [];
  },
  async createResult(data: Omit<ResultItem, 'id' | 'created_at' | 'published_at'>) {
    const remote = await adminFetch<ResultItem>('/admin/results', { method: 'POST', body: JSON.stringify(data) });
    if (!remote) throw new Error('Erreur API publication résultat');
    return remote;
  },
  async deleteResult(id: string) {
    await adminFetch(`/admin/results/${id}`, { method: 'DELETE' });
  },

  async getDocuments() {
    const remote = await adminFetch<DocumentItem[]>('/admin/documents');
    return remote || [];
  },
  async createDocument(data: Omit<DocumentItem, 'id' | 'created_at'>) {
    const remote = await adminFetch<DocumentItem>('/admin/documents', { method: 'POST', body: JSON.stringify(data) });
    if (!remote) throw new Error('Erreur API ajout document');
    return remote;
  },
  async deleteDocument(id: string) {
    await adminFetch(`/admin/documents/${id}`, { method: 'DELETE' });
  },

  async getAlbums() {
    const remote = await adminFetch<GalleryAlbum[]>('/admin/gallery');
    return remote || [];
  },
  async createAlbum(data: Omit<GalleryAlbum, 'id' | 'created_at' | 'photos'>) {
    const remote = await adminFetch<GalleryAlbum>('/admin/gallery', { method: 'POST', body: JSON.stringify(data) });
    if (!remote) throw new Error('Erreur API création album');
    return remote;
  },
  async deleteAlbum(id: string) {
    await adminFetch(`/admin/gallery/${id}`, { method: 'DELETE' });
  }
};
