'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType =
  | 'approval_request'    // 결재 요청받음
  | 'approval_approved'   // 내 결재가 승인됨
  | 'approval_rejected'   // 내 결재가 반려됨
  | 'attendance_approved' // 근태신청 승인
  | 'attendance_rejected' // 근태신청 반려
  | 'leave_approved'      // 휴가 승인
  | 'leave_rejected'      // 휴가 반려
  | 'info';               // 일반 정보

export interface Notification {
  id: string;
  recipient_id: string;    // employee_id
  type: NotificationType;
  title: string;
  message: string;
  link?: string;           // 클릭 시 이동할 경로
  is_read: boolean;
  created_at: string;
  related_id?: string;     // 관련 approval_id, leave_request_id 등
}

interface NotificationState {
  notifications: Notification[];
}

interface NotificationActions {
  addNotification: (n: Omit<Notification, 'id' | 'is_read' | 'created_at'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (recipientId: string) => void;
  deleteNotification: (id: string) => void;
  clearAll: (recipientId: string) => void;
  getByRecipient: (recipientId: string) => Notification[];
  getUnreadCount: (recipientId: string) => number;
}

export type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (n) => {
        const notification: Notification = {
          ...n,
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          is_read: false,
          created_at: new Date().toISOString(),
        };
        set((s) => ({ notifications: [notification, ...s.notifications] }));
      },

      markAsRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        })),

      markAllAsRead: (recipientId) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.recipient_id === recipientId ? { ...n, is_read: true } : n,
          ),
        })),

      deleteNotification: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

      clearAll: (recipientId) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.recipient_id !== recipientId),
        })),

      getByRecipient: (recipientId) =>
        get()
          .notifications.filter((n) => n.recipient_id === recipientId)
          .sort((a, b) => b.created_at.localeCompare(a.created_at)),

      getUnreadCount: (recipientId) =>
        get().notifications.filter((n) => n.recipient_id === recipientId && !n.is_read).length,
    }),
    {
      name: 'hrms-notifications',
      version: 1,
    },
  ),
);
