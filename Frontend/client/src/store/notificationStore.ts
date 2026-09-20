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

function playIppSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    o.start();
    setTimeout(() => { g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2); setTimeout(() => { o.stop(); ctx.close(); }, 250); }, 180);
    // second beep
    setTimeout(() => {
      const ctx2 = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o2 = ctx2.createOscillator();
      const g2 = ctx2.createGain();
      o2.frequency.value = 1320;
      o2.connect(g2); g2.connect(ctx2.destination);
      g2.gain.setValueAtTime(0, ctx2.currentTime);
      g2.gain.linearRampToValueAtTime(0.2, ctx2.currentTime + 0.02);
      o2.start();
      setTimeout(() => { g2.gain.linearRampToValueAtTime(0, ctx2.currentTime + 0.15); setTimeout(() => { o2.stop(); ctx2.close(); }, 200); }, 120);
    }, 220);
  } catch {}
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  preferences: null,
  fetchNotifications: async () => {
    const prevUnread = get().notifications.filter(n => !n.is_read).length;
    const notifications = await notificationService.getNotifications();
    const newUnread = notifications.filter(n => !n.is_read).length;
    if (newUnread > prevUnread) playIppSound();
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
