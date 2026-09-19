import { NewsItem } from '../types';
import { apiFetch } from './apiClient';

export const newsService = {
  async getNews(): Promise<NewsItem[]> {
    const remote = await apiFetch<NewsItem[]>('/news');
    return remote || [];
  },

  async getAllNewsAdmin(): Promise<NewsItem[]> {
    const remote = await apiFetch<NewsItem[]>('/admin/news');
    return remote || [];
  },

  async getNewsById(id: string): Promise<NewsItem | undefined> {
    const remote = await apiFetch<NewsItem>(`/news/${id}`);
    return remote || undefined;
  },

  async createNews(data: Omit<NewsItem, 'id' | 'created_at'>): Promise<NewsItem> {
    const remote = await apiFetch<NewsItem>('/admin/news', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!remote) throw new Error('Échec de création de l’actualité via l’API');
    return remote;
  },

  async updateNews(id: string, data: Partial<NewsItem>): Promise<NewsItem> {
    const remote = await apiFetch<NewsItem>(`/admin/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!remote) throw new Error('Échec de mise à jour de l’actualité via l’API');
    return remote;
  },

  async deleteNews(id: string): Promise<void> {
    await apiFetch(`/admin/news/${id}`, { method: 'DELETE' });
  }
};
