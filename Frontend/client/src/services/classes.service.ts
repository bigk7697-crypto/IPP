import { SchoolClass } from '../types';
import { apiFetch } from './apiClient';

export const classesService = {
  async getClasses(): Promise<SchoolClass[]> {
    const remote = await apiFetch<SchoolClass[]>('/classes');
    return remote || [];
  },

  async createClass(data: Omit<SchoolClass, 'id' | 'created_at'>): Promise<SchoolClass> {
    const remote = await apiFetch<SchoolClass>('/admin/classes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!remote) throw new Error('Échec de création de la classe via l’API');
    return remote;
  },

  async updateClass(id: string, data: Partial<SchoolClass>): Promise<SchoolClass> {
    const remote = await apiFetch<SchoolClass>(`/admin/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!remote) throw new Error('Échec de mise à jour de la classe via l’API');
    return remote;
  },

  async deleteClass(id: string): Promise<void> {
    await apiFetch(`/admin/classes/${id}`, { method: 'DELETE' });
  }
};
