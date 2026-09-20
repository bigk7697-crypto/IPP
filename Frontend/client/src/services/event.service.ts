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
  }
};
