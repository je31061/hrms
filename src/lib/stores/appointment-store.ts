'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Appointment, AppointmentType } from '@/types';
import { useEmployeeStore } from './employee-store';

// ---------------------------------------------------------------------------
// Seed data — 5 appointments
// ---------------------------------------------------------------------------

// Helper for concise appointment creation
function appt(id: string, empId: string, type: AppointmentType, date: string, prevDept: string | null, prevRank: string | null, prevTitle: string | null, newDept: string | null, newRank: string | null, newTitle: string | null, reason: string): Appointment {
  return { id, employee_id: empId, type, effective_date: date, prev_department_id: prevDept, prev_position_rank_id: prevRank, prev_position_title_id: prevTitle, new_department_id: newDept, new_position_rank_id: newRank, new_position_title_id: newTitle, reason, approval_id: null, created_at: date };
}

const seedAppointments: Appointment[] = [
  // ── 입사발령 (주요 직원) ──
  appt('appt-h01', 'e001', 'hire', '2005-03-02', null, null, null, 'dept-01', 'rank-7', 'title-7', '신규 입사'),
  appt('appt-h02', 'e002', 'hire', '2008-01-02', null, null, null, 'dept-01', 'rank-5', 'title-5', '신규 입사'),
  appt('appt-h03', 'e003', 'hire', '2010-03-01', null, null, null, 'dept-01', 'rank-5', 'title-5', '신규 입사'),
  appt('appt-h04', 'e004', 'hire', '2012-02-01', null, null, null, 'dept-02', 'rank-5', 'title-5', '신규 입사'),
  appt('appt-h05', 'e010', 'hire', '2017-03-02', null, null, null, 'dept-14', 'rank-2', 'title-1', '신규 입사'),
  appt('appt-h06', 'e016', 'hire', '2011-04-01', null, null, null, 'dept-03', 'rank-4', 'title-3', '신규 입사'),
  appt('appt-h07', 'e021', 'hire', '2010-06-01', null, null, null, 'dept-04', 'rank-4', 'title-3', '신규 입사'),
  appt('appt-h08', 'e022', 'hire', '2014-09-01', null, null, null, 'dept-19', 'rank-1', 'title-1', '신규 입사'),
  appt('appt-h09', 'e024', 'hire', '2013-02-01', null, null, null, 'dept-05', 'rank-3', 'title-2', '신규 입사'),
  appt('appt-h10', 'e025', 'hire', '2013-06-03', null, null, null, 'dept-06', 'rank-3', 'title-2', '신규 입사'),
  appt('appt-h11', 'e026', 'hire', '2011-01-03', null, null, null, 'dept-09', 'rank-4', 'title-3', '신규 입사'),
  appt('appt-h12', 'e030', 'hire', '2013-09-02', null, null, null, 'dept-13', 'rank-3', 'title-2', '신규 입사'),
  appt('appt-h13', 'e092', 'hire', '2013-04-01', null, null, null, 'dept-11', 'rank-3', 'title-2', '신규 입사'),
  appt('appt-h14', 'e096', 'hire', '2014-01-02', null, null, null, 'dept-12', 'rank-3', 'title-2', '신규 입사'),
  // 2025년 입사 (최근)
  appt('appt-h15', 'e040', 'hire', '2025-03-03', null, null, null, 'dept-17', 'rank-1', 'title-1', '신규 입사'),
  appt('appt-h16', 'e062', 'hire', '2025-01-02', null, null, null, 'dept-06', 'rank-1', 'title-1', '신규 입사'),
  appt('appt-h17', 'e067', 'hire', '2025-01-02', null, null, null, 'dept-07', 'rank-1', 'title-1', '신규 입사'),
  appt('appt-h18', 'e072', 'hire', '2025-07-01', null, null, null, 'dept-08', 'rank-1', 'title-1', '신규 입사'),
  appt('appt-h19', 'e080', 'hire', '2025-03-03', null, null, null, 'dept-20', 'rank-1', 'title-1', '신규 입사'),
  appt('appt-h20', 'e087', 'hire', '2025-07-01', null, null, null, 'dept-21', 'rank-1', 'title-1', '신규 입사'),
  appt('appt-h21', 'e091', 'hire', '2025-03-03', null, null, null, 'dept-10', 'rank-1', 'title-1', '신규 입사'),
  appt('appt-h22', 'e105', 'hire', '2025-01-02', null, null, null, 'dept-23', 'rank-1', 'title-1', '신규 입사'),
  appt('appt-h23', 'e050', 'hire', '2025-09-01', null, null, null, 'dept-19', 'rank-1', 'title-1', '인턴 입사'),
  appt('appt-h24', 'e100', 'hire', '2025-09-01', null, null, null, 'dept-12', 'rank-1', 'title-1', '인턴 입사'),

  // ── 퇴사발령 (10건) ──
  appt('appt-r01', 'e201', 'resignation', '2025-02-28', 'dept-20', 'rank-2', 'title-1', null, null, null, '일신상의 사유'),
  appt('appt-r02', 'e202', 'resignation', '2025-04-30', 'dept-14', 'rank-1', 'title-1', null, null, null, '이직'),
  appt('appt-r03', 'e203', 'resignation', '2025-05-31', 'dept-05', 'rank-2', 'title-1', null, null, null, '개인 사유'),
  appt('appt-r04', 'e204', 'resignation', '2025-06-30', 'dept-18', 'rank-1', 'title-1', null, null, null, '학업 복귀'),
  appt('appt-r05', 'e205', 'resignation', '2025-08-31', 'dept-19', 'rank-1', 'title-1', null, null, null, '이직'),
  appt('appt-r06', 'e206', 'resignation', '2025-09-30', 'dept-21', 'rank-1', 'title-1', null, null, null, '일신상의 사유'),
  appt('appt-r07', 'e207', 'resignation', '2025-10-31', 'dept-17', 'rank-1', 'title-1', null, null, null, '계약 만료'),
  appt('appt-r08', 'e208', 'resignation', '2025-11-30', 'dept-06', 'rank-2', 'title-1', null, null, null, '이직'),
  appt('appt-r09', 'e209', 'resignation', '2025-12-31', 'dept-10', 'rank-1', 'title-1', null, null, null, '개인 사유'),
  appt('appt-r10', 'e210', 'resignation', '2026-01-31', 'dept-07', 'rank-1', 'title-1', null, null, null, '정년 퇴직'),

  // ── 승진발령 (10건) ──
  appt('appt-p01', 'e001', 'promotion', '2015-01-01', 'dept-01', 'rank-7', 'title-7', 'dept-01', 'rank-8', 'title-8', '회장 취임'),
  appt('appt-p02', 'e002', 'promotion', '2015-01-01', 'dept-01', 'rank-5', 'title-5', 'dept-01', 'rank-7', 'title-7', '대표이사 선임'),
  appt('appt-p03', 'e004', 'promotion', '2018-01-01', 'dept-02', 'rank-5', 'title-5', 'dept-02', 'rank-6', 'title-5', '이사 승진'),
  appt('appt-p04', 'e016', 'promotion', '2018-01-01', 'dept-03', 'rank-4', 'title-3', 'dept-03', 'rank-6', 'title-5', '이사 승진'),
  appt('appt-p05', 'e021', 'promotion', '2017-01-01', 'dept-04', 'rank-4', 'title-3', 'dept-04', 'rank-6', 'title-6', '소장 승진'),
  appt('appt-p06', 'e022', 'promotion', '2020-01-01', 'dept-19', 'rank-1', 'title-1', 'dept-19', 'rank-2', 'title-1', '정기 승진'),
  appt('appt-p07', 'e022', 'promotion', '2024-01-01', 'dept-19', 'rank-2', 'title-1', 'dept-19', 'rank-3', 'title-2', '정기 승진'),
  appt('appt-p08', 'e022', 'promotion', '2026-01-01', 'dept-19', 'rank-3', 'title-2', 'dept-19', 'rank-4', 'title-3', '정기 승진'),
  appt('appt-p09', 'e010', 'promotion', '2022-01-01', 'dept-14', 'rank-2', 'title-1', 'dept-14', 'rank-3', 'title-3', '과장 승진·팀장 임명'),
  appt('appt-p10', 'e024', 'promotion', '2020-01-01', 'dept-05', 'rank-3', 'title-2', 'dept-05', 'rank-5', 'title-5', '부장 승진'),

  // ── 전보/직위변경 (5건) ──
  appt('appt-t01', 'e030', 'title_change', '2025-01-01', 'dept-13', 'rank-3', 'title-2', 'dept-13', 'rank-5', 'title-4', '실장 임명'),
  appt('appt-t02', 'e045', 'transfer', '2022-07-01', 'dept-05', 'rank-2', 'title-1', 'dept-19', 'rank-3', 'title-2', '연구개발팀 전보'),
  appt('appt-t03', 'e058', 'transfer', '2023-01-01', 'dept-05', 'rank-2', 'title-1', 'dept-06', 'rank-3', 'title-2', 'BWTS사업부 전보'),
  appt('appt-t04', 'e093', 'transfer', '2024-01-01', 'dept-03', 'rank-2', 'title-1', 'dept-11', 'rank-3', 'title-3', '조달구매본부 전보'),
  appt('appt-t05', 'e097', 'title_change', '2025-07-01', 'dept-12', 'rank-3', 'title-1', 'dept-12', 'rank-3', 'title-3', '팀장 임명'),
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
    { name: 'hrms-appointments', version: 2, migrate: () => ({}) },
  ),
);
