'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ChangeHistoryEntry,
  ChangeHistorySettings,
  ChangeHistoryEntityType,
  ChangeHistoryActionType,
  FieldChange,
} from '@/types';

interface ChangeHistoryState {
  entries: ChangeHistoryEntry[];
  settings: ChangeHistorySettings;
}

interface ChangeHistoryActions {
  addEntry: (entry: Omit<ChangeHistoryEntry, 'id' | 'changed_at'>) => void;
  getByEntity: (entityType: ChangeHistoryEntityType, entityId: string) => ChangeHistoryEntry[];
  getByEntityType: (entityType: ChangeHistoryEntityType) => ChangeHistoryEntry[];
  getAllEntries: () => ChangeHistoryEntry[];
  clearOldEntries: () => void;
  clearAll: () => void;
  updateSettings: (data: Partial<ChangeHistorySettings>) => void;
}

export type ChangeHistoryStore = ChangeHistoryState & ChangeHistoryActions;

export const useChangeHistoryStore = create<ChangeHistoryStore>()(
  persist(
    (set, get) => ({
      entries: [],
      settings: {
        enabled: true,
        max_entries: 5000,
        retention_days: 365,
      },

      addEntry: (entry) => {
        const { settings } = get();
        if (!settings.enabled) return;

        const newEntry: ChangeHistoryEntry = {
          ...entry,
          id: `ch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          changed_at: new Date().toISOString(),
        };

        set((s) => {
          let entries = [newEntry, ...s.entries];
          // Enforce max entries
          if (entries.length > s.settings.max_entries) {
            entries = entries.slice(0, s.settings.max_entries);
          }
          return { entries };
        });
      },

      getByEntity: (entityType, entityId) =>
        get()
          .entries.filter(
            (e) => e.entity_type === entityType && e.entity_id === entityId,
          )
          .sort((a, b) => b.changed_at.localeCompare(a.changed_at)),

      getByEntityType: (entityType) =>
        get()
          .entries.filter((e) => e.entity_type === entityType)
          .sort((a, b) => b.changed_at.localeCompare(a.changed_at)),

      getAllEntries: () =>
        get().entries.sort((a, b) => b.changed_at.localeCompare(a.changed_at)),

      clearOldEntries: () => {
        const { settings } = get();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - settings.retention_days);
        const cutoffStr = cutoff.toISOString();

        set((s) => ({
          entries: s.entries.filter((e) => e.changed_at >= cutoffStr),
        }));
      },

      clearAll: () => set({ entries: [] }),

      updateSettings: (data) =>
        set((s) => ({ settings: { ...s.settings, ...data } })),
    }),
    {
      name: 'hrms-change-history',
    },
  ),
);
