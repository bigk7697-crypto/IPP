import { ResultItem } from '../types';
import { apiFetch } from './apiClient';

export const resultService = {
  async getResultsByClass(classId: string): Promise<{ result: ResultItem; downloadUrl: string; expiresIn: number } | null> {
    const remote: any = await apiFetch<any>(`/results/${classId}`);
    if (!remote) return null;
    // Backend renvoie flat {id, class_id, ..., downloadUrl, expiresIn} ou nested {result, downloadUrl}
    if (remote.result && remote.downloadUrl) return remote;
    if (remote.downloadUrl && remote.id) {
      const { downloadUrl, expiresIn, ...rest } = remote;
      // Mapper classes.name -> class_name si présent
      const result: any = { ...rest };
      if (rest.classes?.name && !rest.class_name) result.class_name = rest.classes.name;
      if (rest.file_path && !rest.file_name) result.file_name = rest.file_path.split('/').pop();
      return { result, downloadUrl, expiresIn: expiresIn || 3600 };
    }
    return null;
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
