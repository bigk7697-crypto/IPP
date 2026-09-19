import { DocumentItem } from '../types';
import { apiFetch } from './apiClient';

export const documentService = {
  async getDocuments(): Promise<DocumentItem[]> {
    const remote = await apiFetch<DocumentItem[]>('/documents');
    return remote || [];
  },

  async createDocument(data: Omit<DocumentItem, 'id' | 'created_at'>): Promise<DocumentItem> {
    const remote = await apiFetch<DocumentItem>('/admin/documents', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!remote) throw new Error('Échec d’ajout du document via l’API');
    return remote;
  },

  async deleteDocument(id: string): Promise<void> {
    await apiFetch(`/admin/documents/${id}`, { method: 'DELETE' });
  }
};
