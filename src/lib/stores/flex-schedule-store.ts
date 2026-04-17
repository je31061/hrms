'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkSchedule } from '@/types';

// 직원별 근무유형 배정
export interface EmployeeScheduleAssignment {
  id: string;
  employee_id: string;
  work_schedule_id: string;
  start_date: string;
  end_date: string | null;
  approved_by: string | null;
  approved_by_name: string | null;
  note: string | null;
  created_at: string;
}

// 유연근무 신청
export interface FlexWorkRequest {
  id: string;
  employee_id: string;
  request_type: 'schedule_change' | 'temporary';
  work_schedule_id: string;
  start_date: string;
  end_date: string | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  review_comment: string | null;
  created_at: string;
}

// Demo data
function buildDemoAssignments(): EmployeeScheduleAssignment[] {
  const now = new Date().toISOString();
  return [
    // 고정근무(ws-1) 배정 직원들
    ...['e010','e011','e012','e013','e014','e015','e027','e028','e029','e031'].map((empId, i) => ({
      id: `esa-${i+1}`,
      employee_id: empId,
      work_schedule_id: 'ws-1',
      start_date: '2025-01-01',
      end_date: null,
      approved_by: 'e004',
      approved_by_name: '김영수',
      note: '기본 고정근무 배정',
      created_at: now,
    })),
    // 유연근무(ws-2) 배정 직원들
    ...['e022','e023','e045','e046','e017','e018'].map((empId, i) => ({
      id: `esa-${20+i}`,
      employee_id: empId,
      work_schedule_id: 'ws-2',
      start_date: '2025-07-01',
      end_date: null,
      approved_by: 'e004',
      approved_by_name: '김영수',
      note: '유연근무제 전환',
      created_at: now,
    })),
    // 선택적근로(ws-3) 배정
    ...['e051','e052','e057'].map((empId, i) => ({
      id: `esa-${30+i}`,
      employee_id: empId,
      work_schedule_id: 'ws-3',
      start_date: '2026-01-01',
      end_date: null,
      approved_by: 'e004',
      approved_by_name: '김영수',
      note: '선택적 근로시간제 적용',
      created_at: now,
    })),
  ];
}

interface FlexScheduleState {
  assignments: EmployeeScheduleAssignment[];
  requests: FlexWorkRequest[];
}

interface FlexScheduleActions {
  // Assignments
  assignSchedule: (assignment: EmployeeScheduleAssignment) => void;
  updateAssignment: (id: string, data: Partial<EmployeeScheduleAssignment>) => void;
  endAssignment: (id: string, endDate: string) => void;
  getActiveAssignment: (employeeId: string) => EmployeeScheduleAssignment | undefined;
  getAssignmentHistory: (employeeId: string) => EmployeeScheduleAssignment[];

  // Requests
  addRequest: (req: FlexWorkRequest) => void;
  reviewRequest: (id: string, status: 'approved' | 'rejected', reviewedBy: string, reviewedByName: string, comment?: string) => void;
  getPendingRequests: () => FlexWorkRequest[];
}

export type FlexScheduleStore = FlexScheduleState & FlexScheduleActions;

export const useFlexScheduleStore = create<FlexScheduleStore>()(
  persist(
    (set, get) => ({
      assignments: buildDemoAssignments(),
      requests: [],

      assignSchedule: (assignment) =>
        set((s) => {
          // 기존 active 배정 종료
          const updated = s.assignments.map((a) =>
            a.employee_id === assignment.employee_id && !a.end_date
              ? { ...a, end_date: assignment.start_date }
              : a
          );
          return { assignments: [...updated, assignment] };
        }),

      updateAssignment: (id, data) =>
        set((s) => ({
          assignments: s.assignments.map((a) => (a.id === id ? { ...a, ...data } : a)),
        })),

      endAssignment: (id, endDate) =>
        set((s) => ({
          assignments: s.assignments.map((a) => (a.id === id ? { ...a, end_date: endDate } : a)),
        })),

      getActiveAssignment: (employeeId) => {
        const today = new Date().toISOString().split('T')[0];
        return get().assignments.find(
          (a) => a.employee_id === employeeId && a.start_date <= today && (!a.end_date || a.end_date >= today),
        );
      },

      getAssignmentHistory: (employeeId) =>
        get().assignments
          .filter((a) => a.employee_id === employeeId)
          .sort((a, b) => b.start_date.localeCompare(a.start_date)),

      addRequest: (req) =>
        set((s) => ({ requests: [req, ...s.requests] })),

      reviewRequest: (id, status, reviewedBy, reviewedByName, comment) =>
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === id
              ? { ...r, status, reviewed_by: reviewedBy, reviewed_by_name: reviewedByName, reviewed_at: new Date().toISOString(), review_comment: comment ?? null }
              : r
          ),
        })),

      getPendingRequests: () =>
        get().requests.filter((r) => r.status === 'pending'),
    }),
    { name: 'hrms-flex-schedule', version: 1 },
  ),
);
