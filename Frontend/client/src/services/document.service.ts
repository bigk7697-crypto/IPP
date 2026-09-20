import { DocumentItem } from '../types';
import { apiFetch } from './apiClient';

export const documentService = {
  async getDocuments(): Promise<DocumentItem[]> {
    const remote = await apiFetch<DocumentItem[]>('/documents');
    return remote || [];
  }
};
