import { create } from 'zustand';
import { NotificationItem, NotificationPreferences } from '../types';
import { notificationService } from '../services/notification.service';

interface NotificationState {
  notifications: NotificationItem[];
  preferences: NotificationPreferences | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (data: Partial<NotificationPreferences>) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  preferences: null,
  fetchNotifications: async () => {
    const notifications = await notificationService.getNotifications();
    set({ notifications });
  },
  markAsRead: async (id) => {
    await notificationService.markAsRead(id);
    set({
      notifications: get().notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
    });
  },
  markAllAsRead: async () => {
    await notificationService.markAllAsRead();
    set({
      notifications: get().notifications.map(n => ({ ...n, is_read: true }))
    });
  },
  fetchPreferences: async () => {
    const preferences = await notificationService.getPreferences();
    set({ preferences });
  },
  updatePreferences: async (data) => {
    const preferences = await notificationService.updatePreferences(data);
    set({ preferences });
  }
}));
