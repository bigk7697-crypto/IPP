import { ResultItem } from '../types';
import { apiFetch } from './apiClient';

export const resultService = {
  async getResultsByClass(classId: string): Promise<{ result: ResultItem; downloadUrl: string; expiresIn: number } | null> {
    const remote = await apiFetch<{ result: ResultItem; downloadUrl: string; expiresIn: number }>(`/results/${classId}`);
    return remote || null;
  },

  async getAllResultsAdmin(): Promise<ResultItem[]> {
    const remote = await apiFetch<ResultItem[]>('/admin/results');
    return remote || [];
  },

  async uploadResult(data: Omit<ResultItem, 'id' | 'created_at' | 'published_at'>): Promise<ResultItem> {
    const remote = await apiFetch<ResultItem>('/admin/results', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!remote) throw new Error('Échec d’upload du résultat via l’API');
    return remote;
  },

  async deleteResult(id: string): Promise<void> {
    await apiFetch(`/admin/results/${id}`, { method: 'DELETE' });
  }
};
