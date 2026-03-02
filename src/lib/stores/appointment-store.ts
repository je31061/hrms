'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Appointment, AppointmentType } from '@/types';
import { useEmployeeStore } from './employee-store';

// ---------------------------------------------------------------------------
// Seed data — 5 appointments
// ---------------------------------------------------------------------------

const seedAppointments: Appointment[] = [
  {
    id: 'appt-1', employee_id: 'e022', type: 'hire', effective_date: '2020-01-01',
    prev_department_id: null, prev_position_rank_id: null, prev_position_title_id: null,
    new_department_id: 'dept-08', new_position_rank_id: 'rank-1', new_position_title_id: 'title-1',
    reason: '신규 입사', approval_id: null, created_at: '2020-01-01',
  },
  {
    id: 'appt-2', employee_id: 'e022', type: 'promotion', effective_date: '2024-01-01',
    prev_department_id: 'dept-08', prev_position_rank_id: 'rank-1', prev_position_title_id: 'title-1',
    new_department_id: 'dept-08', new_position_rank_id: 'rank-2', new_position_title_id: 'title-1',
    reason: '정기 승진', approval_id: null, created_at: '2024-01-01',
  },
  {
    id: 'appt-3', employee_id: 'e026', type: 'promotion', effective_date: '2025-07-01',
    prev_department_id: 'dept-09', prev_position_rank_id: 'rank-2', prev_position_title_id: 'title-1',
    new_department_id: 'dept-09', new_position_rank_id: 'rank-3', new_position_title_id: 'title-1',
    reason: '정기 승진', approval_id: null, created_at: '2025-07-01',
  },
  {
    id: 'appt-4', employee_id: 'e036', type: 'transfer', effective_date: '2025-10-01',
    prev_department_id: 'dept-05', prev_position_rank_id: 'rank-2', prev_position_title_id: 'title-1',
    new_department_id: 'dept-11', new_position_rank_id: 'rank-2', new_position_title_id: 'title-1',
    reason: '조직 개편에 따른 전보', approval_id: null, created_at: '2025-10-01',
  },
  {
    id: 'appt-5', employee_id: 'e030', type: 'title_change', effective_date: '2025-01-01',
    prev_department_id: 'dept-10', prev_position_rank_id: 'rank-3', prev_position_title_id: 'title-1',
    new_department_id: 'dept-10', new_position_rank_id: 'rank-3', new_position_title_id: 'title-2',
    reason: '팀장 임명', approval_id: null, created_at: '2025-01-01',
  },
];

// ---------------------------------------------------------------------------
// Store types
// ---------------------------------------------------------------------------

interface AppointmentState {
  appointments: Appointment[];
}

interface AppointmentActions {
  addAppointment: (appointment: Appointment) => void;
  deleteAppointment: (id: string) => void;
}

interface AppointmentGetters {
  getAppointmentsByEmployee: (empId: string) => Appointment[];
  getAllAppointments: () => Appointment[];
}

export type AppointmentStore = AppointmentState & AppointmentActions & AppointmentGetters;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAppointmentStore = create<AppointmentStore>()(
  persist(
    (set, get) => ({
      appointments: seedAppointments,

      addAppointment: (appointment) => {
        set((s) => ({ appointments: [...s.appointments, appointment] }));

        // Auto-update employee record
        const empStore = useEmployeeStore.getState();
        const update: Record<string, unknown> = {};
        if (appointment.new_department_id) update.department_id = appointment.new_department_id;
        if (appointment.new_position_rank_id) update.position_rank_id = appointment.new_position_rank_id;
        if (appointment.new_position_title_id) update.position_title_id = appointment.new_position_title_id;
        if (appointment.type === 'resignation') {
          update.status = 'resigned';
          update.resignation_date = appointment.effective_date;
        }
        if (Object.keys(update).length > 0) {
          empStore.updateEmployee(appointment.employee_id, update as any);
        }
      },

      deleteAppointment: (id) =>
        set((s) => ({
          appointments: s.appointments.filter((a) => a.id !== id),
        })),

      getAppointmentsByEmployee: (empId) =>
        get()
          .appointments.filter((a) => a.employee_id === empId)
          .sort((a, b) => b.effective_date.localeCompare(a.effective_date)),

      getAllAppointments: () =>
        [...get().appointments].sort((a, b) => b.effective_date.localeCompare(a.effective_date)),
    }),
    { name: 'hrms-appointments' },
  ),
);
