'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateAnnualLeave } from '@/lib/utils/leave-calculator';
import type {
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  LeaveBalanceAdjustment,
} from '@/types';

// ---- Demo employees (matches organization/page.tsx) ----

export interface DemoEmployee {
  id: string;
  name: string;
  department: string;
  hire_date: string;
  position_rank: string;
}

export const demoEmployees: DemoEmployee[] = [
  { id: 'e001', name: '김대표', department: '대표이사', hire_date: '2020-01-01', position_rank: '대표이사' },
  { id: 'e002', name: '이본부장', department: '경영지원본부', hire_date: '2020-01-01', position_rank: '이사' },
  { id: 'e003', name: '박부장', department: '경영지원본부', hire_date: '2020-01-01', position_rank: '부장' },
  { id: 'e004', name: '최본부장', department: '개발본부', hire_date: '2020-01-01', position_rank: '이사' },
  { id: 'e005', name: '정부장', department: '개발본부', hire_date: '2020-01-01', position_rank: '부장' },
  { id: 'e006', name: '한차장', department: '개발본부', hire_date: '2020-01-01', position_rank: '차장' },
  { id: 'e007', name: '강본부장', department: '영업본부', hire_date: '2020-01-01', position_rank: '이사' },
  { id: 'e008', name: '윤부장', department: '영업본부', hire_date: '2020-01-01', position_rank: '부장' },
  { id: 'e010', name: '서팀장', department: '인사팀', hire_date: '2020-01-01', position_rank: '과장' },
  { id: 'e011', name: '임대리', department: '인사팀', hire_date: '2020-01-01', position_rank: '대리' },
  { id: 'e012', name: '조사원', department: '인사팀', hire_date: '2020-01-01', position_rank: '사원' },
  { id: 'e013', name: '장팀장', department: '재무팀', hire_date: '2020-01-01', position_rank: '과장' },
  { id: 'e014', name: '유대리', department: '재무팀', hire_date: '2020-01-01', position_rank: '대리' },
  { id: 'e015', name: '오팀장', department: '총무팀', hire_date: '2020-01-01', position_rank: '과장' },
  { id: 'e016', name: '배사원', department: '총무팀', hire_date: '2020-01-01', position_rank: '사원' },
  { id: 'e020', name: '문팀장', department: '개발1팀', hire_date: '2020-01-01', position_rank: '차장' },
  { id: 'e021', name: '신과장', department: '개발1팀', hire_date: '2020-01-01', position_rank: '과장' },
  { id: 'e022', name: '권대리', department: '개발1팀', hire_date: '2020-01-01', position_rank: '대리' },
  { id: 'e025', name: '황팀장', department: '개발2팀', hire_date: '2020-01-01', position_rank: '차장' },
  { id: 'e026', name: '안과장', department: '개발2팀', hire_date: '2020-01-01', position_rank: '과장' },
  { id: 'e030', name: '송팀장', department: 'QA팀', hire_date: '2020-01-01', position_rank: '과장' },
  { id: 'e031', name: '전대리', department: 'QA팀', hire_date: '2020-01-01', position_rank: '대리' },
  { id: 'e035', name: '홍팀장', department: '국내영업팀', hire_date: '2020-01-01', position_rank: '차장' },
  { id: 'e036', name: '고대리', department: '국내영업팀', hire_date: '2020-01-01', position_rank: '대리' },
  { id: 'e040', name: '노팀장', department: '해외영업팀', hire_date: '2020-01-01', position_rank: '과장' },
  { id: 'e041', name: '하사원', department: '해외영업팀', hire_date: '2020-01-01', position_rank: '사원' },
];

// ---- Default leave types ----

const defaultLeaveTypes: LeaveType[] = [
  { id: 'lt-annual', name: '연차', code: 'annual', is_paid: true, max_days: 25, is_active: true },
  { id: 'lt-sick', name: '병가', code: 'sick', is_paid: true, max_days: 60, is_active: true },
  { id: 'lt-condolence', name: '경조사휴가', code: 'condolence', is_paid: true, max_days: null, is_active: true },
  { id: 'lt-maternity', name: '출산휴가', code: 'maternity', is_paid: true, max_days: 90, is_active: true },
  { id: 'lt-paternity', name: '배우자출산휴가', code: 'paternity', is_paid: true, max_days: 10, is_active: true },
  { id: 'lt-other', name: '기타', code: 'other', is_paid: false, max_days: null, is_active: true },
];

// ---- Default balances (25 employees × 2026, all hired 2020-01-01 → 17 days annual) ----

function generateDefaultBalances(): LeaveBalance[] {
  const balances: LeaveBalance[] = [];
  const usedDaysMap: Record<string, number> = {
    e001: 3, e002: 5, e003: 7, e004: 2, e005: 10, e006: 4, e007: 6, e008: 8,
    e010: 5, e011: 3, e012: 1, e013: 9, e014: 2, e015: 4, e016: 0,
    e020: 6, e021: 3, e022: 5, e025: 7, e026: 4,
    e030: 2, e031: 1, e035: 8, e036: 3, e040: 5, e041: 0,
  };

  for (const emp of demoEmployees) {
    const totalAnnual = calculateAnnualLeave(new Date(emp.hire_date), new Date('2026-02-26'));
    const used = usedDaysMap[emp.id] ?? 0;
    // Annual leave balance
    balances.push({
      id: `lb-${emp.id}-annual`,
      employee_id: emp.id,
      leave_type_id: 'lt-annual',
      year: 2026,
      total_days: totalAnnual,
      used_days: used,
      remaining_days: totalAnnual - used,
    });
    // Sick leave balance
    balances.push({
      id: `lb-${emp.id}-sick`,
      employee_id: emp.id,
      leave_type_id: 'lt-sick',
      year: 2026,
      total_days: 60,
      used_days: 0,
      remaining_days: 60,
    });
  }
  return balances;
}

// ---- Default requests (8 samples) ----

const defaultLeaveRequests: LeaveRequest[] = [
  { id: 'lr-001', employee_id: 'e022', leave_type_id: 'lt-annual', start_date: '2026-03-05', end_date: '2026-03-05', days: 1, reason: '개인 사유', status: 'pending', approval_id: null, created_at: '2026-02-25' },
  { id: 'lr-002', employee_id: 'e021', leave_type_id: 'lt-annual', start_date: '2026-03-09', end_date: '2026-03-10', days: 2, reason: '가족여행', status: 'pending', approval_id: null, created_at: '2026-02-24' },
  { id: 'lr-003', employee_id: 'e036', leave_type_id: 'lt-sick', start_date: '2026-03-02', end_date: '2026-03-02', days: 1, reason: '병원 진료', status: 'pending', approval_id: null, created_at: '2026-02-26' },
  { id: 'lr-004', employee_id: 'e022', leave_type_id: 'lt-annual', start_date: '2026-01-27', end_date: '2026-01-28', days: 2, reason: '가정 사정', status: 'approved', approval_id: null, created_at: '2026-01-20' },
  { id: 'lr-005', employee_id: 'e022', leave_type_id: 'lt-sick', start_date: '2026-01-10', end_date: '2026-01-10', days: 1, reason: '병원 진료', status: 'approved', approval_id: null, created_at: '2026-01-09' },
  { id: 'lr-006', employee_id: 'e011', leave_type_id: 'lt-annual', start_date: '2026-02-02', end_date: '2026-02-03', days: 2, reason: '개인 사유', status: 'approved', approval_id: null, created_at: '2026-01-28' },
  { id: 'lr-007', employee_id: 'e005', leave_type_id: 'lt-annual', start_date: '2026-02-16', end_date: '2026-02-17', days: 1, reason: '경조사', status: 'rejected', approval_id: null, created_at: '2026-02-10' },
  { id: 'lr-008', employee_id: 'e013', leave_type_id: 'lt-annual', start_date: '2026-02-09', end_date: '2026-02-10', days: 2, reason: '여행', status: 'cancelled', approval_id: null, created_at: '2026-02-01' },
];

// ---- Default adjustments ----

const defaultAdjustments: LeaveBalanceAdjustment[] = [
  { id: 'adj-001', employee_id: 'e005', leave_type_id: 'lt-annual', year: 2026, adjustment_days: 2, reason: '이월 연차', adjusted_by: 'HR', created_at: '2026-01-02' },
  { id: 'adj-002', employee_id: 'e035', leave_type_id: 'lt-annual', year: 2026, adjustment_days: -1, reason: '전년 미정산분 차감', adjusted_by: 'HR', created_at: '2026-01-05' },
];

// ---- Store types ----

interface LeaveState {
  leaveTypes: LeaveType[];
  leaveBalances: LeaveBalance[];
  leaveRequests: LeaveRequest[];
  balanceAdjustments: LeaveBalanceAdjustment[];
}

interface LeaveActions {
  // Leave type CRUD
  addLeaveType: (leaveType: LeaveType) => void;
  updateLeaveType: (id: string, data: Partial<LeaveType>) => void;
  deleteLeaveType: (id: string) => void;

  // Balance
  upsertLeaveBalance: (balance: LeaveBalance) => void;
  bulkGrantAnnualLeave: (employees: DemoEmployee[], year: number, refDate: Date) => void;

  // Adjustment
  addBalanceAdjustment: (adjustment: LeaveBalanceAdjustment) => void;

  // Requests
  addLeaveRequest: (request: LeaveRequest) => void;
  approveLeaveRequest: (id: string) => void;
  rejectLeaveRequest: (id: string) => void;
  cancelLeaveRequest: (id: string) => void;
}

export type LeaveStore = LeaveState & LeaveActions;

// ---- Store ----

export const useLeaveStore = create<LeaveStore>()(
  persist(
    (set) => ({
      // --- Initial State ---
      leaveTypes: defaultLeaveTypes,
      leaveBalances: generateDefaultBalances(),
      leaveRequests: defaultLeaveRequests,
      balanceAdjustments: defaultAdjustments,

      // --- Actions ---

      addLeaveType: (leaveType) =>
        set((s) => ({ leaveTypes: [...s.leaveTypes, leaveType] })),

      updateLeaveType: (id, data) =>
        set((s) => ({
          leaveTypes: s.leaveTypes.map((lt) =>
            lt.id === id ? { ...lt, ...data } : lt
          ),
        })),

      deleteLeaveType: (id) =>
        set((s) => ({
          leaveTypes: s.leaveTypes.filter((lt) => lt.id !== id),
        })),

      upsertLeaveBalance: (balance) =>
        set((s) => {
          const idx = s.leaveBalances.findIndex(
            (b) =>
              b.employee_id === balance.employee_id &&
              b.leave_type_id === balance.leave_type_id &&
              b.year === balance.year
          );
          if (idx >= 0) {
            const updated = [...s.leaveBalances];
            updated[idx] = balance;
            return { leaveBalances: updated };
          }
          return { leaveBalances: [...s.leaveBalances, balance] };
        }),

      bulkGrantAnnualLeave: (employees, year, refDate) =>
        set((s) => {
          const newBalances = [...s.leaveBalances];
          for (const emp of employees) {
            const totalDays = calculateAnnualLeave(new Date(emp.hire_date), refDate);
            const idx = newBalances.findIndex(
              (b) => b.employee_id === emp.id && b.leave_type_id === 'lt-annual' && b.year === year
            );
            if (idx >= 0) {
              const existing = newBalances[idx];
              newBalances[idx] = {
                ...existing,
                total_days: totalDays,
                remaining_days: totalDays - existing.used_days,
              };
            } else {
              newBalances.push({
                id: `lb-${emp.id}-annual-${year}`,
                employee_id: emp.id,
                leave_type_id: 'lt-annual',
                year,
                total_days: totalDays,
                used_days: 0,
                remaining_days: totalDays,
              });
            }
          }
          return { leaveBalances: newBalances };
        }),

      addBalanceAdjustment: (adjustment) =>
        set((s) => {
          const newBalances = s.leaveBalances.map((b) => {
            if (
              b.employee_id === adjustment.employee_id &&
              b.leave_type_id === adjustment.leave_type_id &&
              b.year === adjustment.year
            ) {
              return {
                ...b,
                total_days: b.total_days + adjustment.adjustment_days,
                remaining_days: b.remaining_days + adjustment.adjustment_days,
              };
            }
            return b;
          });
          return {
            balanceAdjustments: [...s.balanceAdjustments, adjustment],
            leaveBalances: newBalances,
          };
        }),

      addLeaveRequest: (request) =>
        set((s) => ({ leaveRequests: [...s.leaveRequests, request] })),

      approveLeaveRequest: (id) =>
        set((s) => {
          const req = s.leaveRequests.find((r) => r.id === id);
          if (!req || req.status !== 'pending') return s;

          const newRequests = s.leaveRequests.map((r) =>
            r.id === id ? { ...r, status: 'approved' as const } : r
          );

          const newBalances = s.leaveBalances.map((b) => {
            if (
              b.employee_id === req.employee_id &&
              b.leave_type_id === req.leave_type_id &&
              b.year === new Date(req.start_date).getFullYear()
            ) {
              return {
                ...b,
                used_days: b.used_days + req.days,
                remaining_days: b.remaining_days - req.days,
              };
            }
            return b;
          });

          return { leaveRequests: newRequests, leaveBalances: newBalances };
        }),

      rejectLeaveRequest: (id) =>
        set((s) => ({
          leaveRequests: s.leaveRequests.map((r) =>
            r.id === id && r.status === 'pending'
              ? { ...r, status: 'rejected' as const }
              : r
          ),
        })),

      cancelLeaveRequest: (id) =>
        set((s) => {
          const req = s.leaveRequests.find((r) => r.id === id);
          if (!req) return s;

          const newRequests = s.leaveRequests.map((r) =>
            r.id === id ? { ...r, status: 'cancelled' as const } : r
          );

          // If was approved, restore used_days
          if (req.status === 'approved') {
            const newBalances = s.leaveBalances.map((b) => {
              if (
                b.employee_id === req.employee_id &&
                b.leave_type_id === req.leave_type_id &&
                b.year === new Date(req.start_date).getFullYear()
              ) {
                return {
                  ...b,
                  used_days: b.used_days - req.days,
                  remaining_days: b.remaining_days + req.days,
                };
              }
              return b;
            });
            return { leaveRequests: newRequests, leaveBalances: newBalances };
          }

          return { leaveRequests: newRequests };
        }),
    }),
    {
      name: 'hrms-leave',
    }
  )
);
