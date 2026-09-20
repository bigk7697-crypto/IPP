import { SchoolClass } from '../types';
import { apiFetch } from './apiClient';

export const classesService = {
  async getClasses(): Promise<SchoolClass[]> {
    const remote = await apiFetch<SchoolClass[]>('/classes');
    return remote || [];
  }
};
