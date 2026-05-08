'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 연차 사용계획서 (연차촉진 대응)
export interface LeaveUsagePlan {
  id: string;
  employee_id: string;
  year: number;
  total_planned_days: number;
  // 월별 계획 (1~12월)
  monthly_plan: Record<number, number>; // { 1: 0, 2: 1, ... 12: 2 }
  reason: string | null;
  status: 'draft' | 'submitted' | 'reviewed' | 'final';
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  reviewed_by_name: string | null;
  review_comment: string | null;
  created_at: string;
  updated_at: string;
}

// 연차촉진 알림
export interface LeavePromotionAlert {
  id: string;
  employee_id: string;
  year: number;
  alert_round: 1 | 2;          // 1차 / 2차
  remaining_days: number;
  sent_at: string;
  acknowledged: boolean;        // 직원이 확인했는지
  acknowledged_at: string | null;
  // 직원 응답 (사용계획 제출 or 회사에 위임)
  response: 'plan_submitted' | 'company_decision' | null;
  responded_at: string | null;
}

interface State {
  plans: LeaveUsagePlan[];
  alerts: LeavePromotionAlert[];
}

interface Actions {
  // Plans
  upsertPlan: (plan: LeaveUsagePlan) => void;
  reviewPlan: (id: string, reviewedBy: string, reviewedByName: string, comment?: string) => void;
  getPlanByEmployee: (employeeId: string, year: number) => LeaveUsagePlan | undefined;
  getAllPlans: (year?: number) => LeaveUsagePlan[];

  // Alerts
  addAlert: (alert: LeavePromotionAlert) => void;
  acknowledgeAlert: (id: string, response?: 'plan_submitted' | 'company_decision') => void;
  getAlertsByEmployee: (employeeId: string) => LeavePromotionAlert[];
  getPendingAlerts: () => LeavePromotionAlert[];

  // Generate alerts (관리자가 일괄 생성)
  generateAlerts: (
    round: 1 | 2,
    year: number,
    employees: { id: string; remaining_days: number }[],
    threshold: number,
  ) => number; // 생성된 건수
}

export type LeavePlanStore = State & Actions;

export const useLeavePlanStore = create<LeavePlanStore>()(
  persist(
    (set, get) => ({
      plans: [],
      alerts: [],

      upsertPlan: (plan) =>
        set((s) => {
          const idx = s.plans.findIndex((p) => p.id === plan.id);
          if (idx >= 0) {
            const next = [...s.plans];
            next[idx] = { ...plan, updated_at: new Date().toISOString() };
            return { plans: next };
          }
          return { plans: [...s.plans, plan] };
        }),

      reviewPlan: (id, reviewedBy, reviewedByName, comment) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: 'reviewed' as const,
                  reviewed_at: new Date().toISOString(),
                  reviewed_by: reviewedBy,
                  reviewed_by_name: reviewedByName,
                  review_comment: comment ?? null,
                  updated_at: new Date().toISOString(),
                }
              : p,
          ),
        })),

      getPlanByEmployee: (employeeId, year) =>
        get().plans.find((p) => p.employee_id === employeeId && p.year === year),

      getAllPlans: (year) =>
        get().plans
          .filter((p) => year ? p.year === year : true)
          .sort((a, b) => b.created_at.localeCompare(a.created_at)),

      addAlert: (alert) =>
        set((s) => ({ alerts: [alert, ...s.alerts] })),

      acknowledgeAlert: (id, response) =>
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === id
              ? {
                  ...a,
                  acknowledged: true,
                  acknowledged_at: new Date().toISOString(),
                  response: response ?? a.response,
                  responded_at: response ? new Date().toISOString() : a.responded_at,
                }
              : a,
          ),
        })),

      getAlertsByEmployee: (employeeId) =>
        get().alerts
          .filter((a) => a.employee_id === employeeId)
          .sort((a, b) => b.sent_at.localeCompare(a.sent_at)),

      getPendingAlerts: () =>
        get().alerts.filter((a) => !a.acknowledged).sort((a, b) => b.sent_at.localeCompare(a.sent_at)),

      generateAlerts: (round, year, employees, threshold) => {
        const now = new Date().toISOString();
        const newAlerts: LeavePromotionAlert[] = [];
        for (const emp of employees) {
          if (emp.remaining_days < threshold) continue;
          // 이미 같은 회차가 있으면 스킵
          const existing = get().alerts.find(
            (a) => a.employee_id === emp.id && a.year === year && a.alert_round === round,
          );
          if (existing) continue;
          newAlerts.push({
            id: `lpa-${Date.now()}-${emp.id}-${round}`,
            employee_id: emp.id,
            year,
            alert_round: round,
            remaining_days: emp.remaining_days,
            sent_at: now,
            acknowledged: false,
            acknowledged_at: null,
            response: null,
            responded_at: null,
          });
        }
        if (newAlerts.length > 0) {
          set((s) => ({ alerts: [...newAlerts, ...s.alerts] }));
        }
        return newAlerts.length;
      },
    }),
    { name: 'hrms-leave-plans', version: 1 },
  ),
);
