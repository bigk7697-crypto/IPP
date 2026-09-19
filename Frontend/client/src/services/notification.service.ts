import { NotificationItem, NotificationPreferences } from '../types';
import { apiFetch } from './apiClient';

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    const remote = await apiFetch<NotificationItem[]>('/notifications');
    return remote || [];
  },

  async markAsRead(id: string): Promise<void> {
    await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllAsRead(): Promise<void> {
    await apiFetch('/notifications/read-all', { method: 'PATCH' });
  },

  async getPreferences(): Promise<NotificationPreferences | null> {
    const remote = await apiFetch<NotificationPreferences>('/notification-preferences');
    return remote || null;
  },

  async updatePreferences(data: Partial<NotificationPreferences>): Promise<NotificationPreferences | null> {
    const remote = await apiFetch<NotificationPreferences>('/notification-preferences', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return remote || null;
  }
};
