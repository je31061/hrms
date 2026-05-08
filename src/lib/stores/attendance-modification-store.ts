'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 근태 수정요청 (사후결재)
export interface AttendanceModificationRequest {
  id: string;
  attendance_id: string;
  employee_id: string;
  // 변경 전 값
  before: {
    clock_in: string | null;
    clock_out: string | null;
    work_hours: number | null;
    status: string;
    note: string | null;
    attendance_type?: string;
  };
  // 변경 후 값
  after: {
    clock_in: string | null;
    clock_out: string | null;
    work_hours: number | null;
    status: string;
    note: string | null;
    attendance_type?: string;
  };
  reason: string;            // 수정 사유 (필수)
  status: 'pending' | 'approved' | 'rejected';
  approval_id: string | null;
  reviewed_by: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  review_comment: string | null;
  attachment_name: string | null;
  created_at: string;
}

interface State {
  modifications: AttendanceModificationRequest[];
}

interface Actions {
  addModification: (m: AttendanceModificationRequest) => void;
  reviewModification: (
    id: string,
    status: 'approved' | 'rejected',
    reviewedBy: string,
    reviewedByName: string,
    comment?: string,
  ) => void;
  getByAttendance: (attendanceId: string) => AttendanceModificationRequest[];
  getByEmployee: (employeeId: string) => AttendanceModificationRequest[];
  getPending: () => AttendanceModificationRequest[];
  getAll: () => AttendanceModificationRequest[];
}

export type AttendanceModificationStore = State & Actions;

export const useAttendanceModificationStore = create<AttendanceModificationStore>()(
  persist(
    (set, get) => ({
      modifications: [],

      addModification: (m) =>
        set((s) => ({ modifications: [m, ...s.modifications] })),

      reviewModification: (id, status, reviewedBy, reviewedByName, comment) =>
        set((s) => ({
          modifications: s.modifications.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status,
                  reviewed_by: reviewedBy,
                  reviewed_by_name: reviewedByName,
                  reviewed_at: new Date().toISOString(),
                  review_comment: comment ?? null,
                }
              : m,
          ),
        })),

      getByAttendance: (attendanceId) =>
        get().modifications
          .filter((m) => m.attendance_id === attendanceId)
          .sort((a, b) => b.created_at.localeCompare(a.created_at)),

      getByEmployee: (employeeId) =>
        get().modifications
          .filter((m) => m.employee_id === employeeId)
          .sort((a, b) => b.created_at.localeCompare(a.created_at)),

      getPending: () =>
        get().modifications
          .filter((m) => m.status === 'pending')
          .sort((a, b) => b.created_at.localeCompare(a.created_at)),

      getAll: () =>
        get().modifications.sort((a, b) => b.created_at.localeCompare(a.created_at)),
    }),
    { name: 'hrms-attendance-modifications', version: 1 },
  ),
);
