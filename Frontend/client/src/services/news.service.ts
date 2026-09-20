import { NewsItem } from '../types';
import { apiFetch } from './apiClient';

export const newsService = {
  async getNews(): Promise<NewsItem[]> {
    const remote = await apiFetch<NewsItem[]>('/news');
    return remote || [];
  },

  async getNewsById(id: string): Promise<NewsItem | undefined> {
    const remote = await apiFetch<NewsItem>(`/news/${id}`);
    return remote || undefined;
  }
};
