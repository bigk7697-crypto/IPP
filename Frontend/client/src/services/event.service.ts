import { EventItem } from '../types';
import { apiFetch } from './apiClient';

export const eventService = {
  async getEvents(): Promise<EventItem[]> {
    const remote = await apiFetch<EventItem[]>('/events');
    return remote || [];
  },

  async getEventById(id: string): Promise<EventItem | undefined> {
    const remote = await apiFetch<EventItem>(`/events/${id}`);
    return remote || undefined;
  },

  async createEvent(data: Omit<EventItem, 'id' | 'created_at'>): Promise<EventItem> {
    const remote = await apiFetch<EventItem>('/admin/events', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!remote) throw new Error('Échec de création de l’événement via l’API');
    return remote;
  },

  async updateEvent(id: string, data: Partial<EventItem>): Promise<EventItem> {
    const remote = await apiFetch<EventItem>(`/admin/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!remote) throw new Error('Échec de mise à jour de l’événement via l’API');
    return remote;
  },

  async deleteEvent(id: string): Promise<void> {
    await apiFetch(`/admin/events/${id}`, { method: 'DELETE' });
  }
};
