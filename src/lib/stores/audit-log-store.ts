'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuditActionType, AuditLogEntry, AuditLogSettings } from '@/types';

const DEFAULT_SETTINGS: AuditLogSettings = {
  enabled: true,
  track_page_views: true,
  track_creates: true,
  track_updates: true,
  track_deletes: true,
  track_logins: true,
  retention_days: 90,
  max_entries: 1000,
};

const SEED_LOGS: AuditLogEntry[] = [
  {
    id: 'seed-01',
    timestamp: '2026-03-01T09:00:00.000Z',
    user_id: 'demo-admin',
    user_name: '김관리',
    user_role: 'admin',
    action_type: 'login',
    target_type: '/login',
    target_id: null,
    target_label: '로그인',
    details: { method: 'demo' },
    session_id: 'seed-session-01',
    ip_address: '192.168.1.100',
  },
  {
    id: 'seed-02',
    timestamp: '2026-03-01T09:01:00.000Z',
    user_id: 'demo-admin',
    user_name: '김관리',
    user_role: 'admin',
    action_type: 'page_view',
    target_type: '/',
    target_id: null,
    target_label: '대시보드',
    details: null,
    session_id: 'seed-session-01',
    ip_address: '192.168.1.100',
  },
  {
    id: 'seed-03',
    timestamp: '2026-03-01T09:05:00.000Z',
    user_id: 'demo-admin',
    user_name: '김관리',
    user_role: 'admin',
    action_type: 'page_view',
    target_type: '/employees',
    target_id: null,
    target_label: '인사정보',
    details: null,
    session_id: 'seed-session-01',
    ip_address: '192.168.1.100',
  },
  {
    id: 'seed-04',
    timestamp: '2026-03-01T09:10:00.000Z',
    user_id: 'demo-admin',
    user_name: '김관리',
    user_role: 'admin',
    action_type: 'create',
    target_type: 'employee',
    target_id: 'e030',
    target_label: '신규 직원 등록: 최신입',
    details: { name: '최신입', department: '마케팅팀' },
    session_id: 'seed-session-01',
    ip_address: '192.168.1.100',
  },
  {
    id: 'seed-05',
    timestamp: '2026-03-01T09:30:00.000Z',
    user_id: 'demo-hr',
    user_name: '이인사',
    user_role: 'hr_manager',
    action_type: 'login',
    target_type: '/login',
    target_id: null,
    target_label: '로그인',
    details: { method: 'demo' },
    session_id: 'seed-session-02',
    ip_address: '192.168.1.105',
  },
  {
    id: 'seed-06',
    timestamp: '2026-03-01T09:35:00.000Z',
    user_id: 'demo-hr',
    user_name: '이인사',
    user_role: 'hr_manager',
    action_type: 'page_view',
    target_type: '/leave',
    target_id: null,
    target_label: '휴가관리',
    details: null,
    session_id: 'seed-session-02',
    ip_address: '192.168.1.105',
  },
  {
    id: 'seed-07',
    timestamp: '2026-03-01T09:40:00.000Z',
    user_id: 'demo-hr',
    user_name: '이인사',
    user_role: 'hr_manager',
    action_type: 'approve',
    target_type: 'leave_request',
    target_id: 'lr-001',
    target_label: '휴가 승인: 정사원',
    details: { employee: '정사원', leave_type: '연차' },
    session_id: 'seed-session-02',
    ip_address: '192.168.1.105',
  },
  {
    id: 'seed-08',
    timestamp: '2026-03-01T10:00:00.000Z',
    user_id: 'demo-manager',
    user_name: '박부장',
    user_role: 'dept_manager',
    action_type: 'page_view',
    target_type: '/attendance',
    target_id: null,
    target_label: '근태관리',
    details: null,
    session_id: 'seed-session-03',
    ip_address: '10.0.0.22',
  },
  {
    id: 'seed-09',
    timestamp: '2026-03-01T10:15:00.000Z',
    user_id: 'demo-employee',
    user_name: '정사원',
    user_role: 'employee',
    action_type: 'page_view',
    target_type: '/my',
    target_id: null,
    target_label: '마이페이지',
    details: null,
    session_id: 'seed-session-04',
    ip_address: '10.0.0.55',
  },
  {
    id: 'seed-10',
    timestamp: '2026-03-01T10:20:00.000Z',
    user_id: 'demo-admin',
    user_name: '김관리',
    user_role: 'admin',
    action_type: 'update',
    target_type: 'settings',
    target_id: null,
    target_label: '시스템 설정 변경',
    details: { section: '근무설정' },
    session_id: 'seed-session-01',
    ip_address: '192.168.1.100',
  },
];

interface AuditLogState {
  logs: AuditLogEntry[];
  settings: AuditLogSettings;
  addLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  clearOldLogs: () => void;
  updateSettings: (partial: Partial<AuditLogSettings>) => void;
}

export const useAuditLogStore = create<AuditLogState>()(
  persist(
    (set, get) => ({
      logs: SEED_LOGS,
      settings: DEFAULT_SETTINGS,

      addLog: (entry) => {
        const { settings, logs } = get();
        if (!settings.enabled) return;

        // Action type gate
        const gateMap: Record<string, keyof AuditLogSettings> = {
          page_view: 'track_page_views',
          create: 'track_creates',
          update: 'track_updates',
          delete: 'track_deletes',
          login: 'track_logins',
          logout: 'track_logins',
        };
        const gate = gateMap[entry.action_type];
        if (gate && !settings[gate]) return;

        const newEntry: AuditLogEntry = {
          ...entry,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        };

        let newLogs = [newEntry, ...logs];
        if (newLogs.length > settings.max_entries) {
          newLogs = newLogs.slice(0, settings.max_entries);
        }

        set({ logs: newLogs });
      },

      clearLogs: () => set({ logs: [] }),

      clearOldLogs: () => {
        const { settings, logs } = get();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - settings.retention_days);
        const cutoffStr = cutoff.toISOString();
        set({ logs: logs.filter((l) => l.timestamp >= cutoffStr) });
      },

      updateSettings: (partial) => {
        set((state) => ({
          settings: { ...state.settings, ...partial },
        }));
      },
    }),
    { name: 'hrms-audit-log' }
  )
);
