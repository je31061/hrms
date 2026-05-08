'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RetirementSettlement, RetirementSettlementStatus } from '@/types';

// === 퇴직금 계산 유틸 ===
// 법정 퇴직금 = (일평균임금 × 30일) × (근속일수 / 365)

export function calcRetirementPay(input: {
  baseSalaryAvg: number;
  bonusAvg: number;
  annualLeaveCompensation: number;
  hireDate: string;
  resignationDate: string;
}) {
  const hire = new Date(input.hireDate);
  const resign = new Date(input.resignationDate);
  const serviceDays = Math.max(0, Math.round((resign.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24)));
  const serviceYears = serviceDays / 365;

  // 평균임금 = (퇴직 전 3개월 임금 + 연간 상여 / 4 + 연차수당 / 4) / 3개월 일수(약 90일)
  // 단순화: 월 기준 → (월기본급 + 월상여) × 3 + 연차수당, 90일로 나눔
  const threeMonthWage = (input.baseSalaryAvg + input.bonusAvg) * 3 + input.annualLeaveCompensation;
  const dailyAvgWage = Math.round(threeMonthWage / 90);

  // 통상임금 비교 - 단순화: 월 기본급 / 30 (실무에서는 더 복잡)
  const dailyOrdinaryWage = Math.round(input.baseSalaryAvg / 30);
  const dailyForCalc = Math.max(dailyAvgWage, dailyOrdinaryWage); // 큰 쪽으로

  const retirementPay = Math.round(dailyForCalc * 30 * (serviceDays / 365));

  // 퇴직소득세 (간이 계산 - 실제는 근속연수공제 등 복잡)
  let taxRate = 0;
  if (serviceYears < 5) taxRate = 0.06;
  else if (serviceYears < 10) taxRate = 0.05;
  else if (serviceYears < 20) taxRate = 0.04;
  else taxRate = 0.03;
  const incomeTax = Math.round(retirementPay * taxRate);
  const localTax = Math.round(incomeTax * 0.1);
  const netPay = retirementPay - incomeTax - localTax;

  return {
    serviceDays,
    serviceYears: Math.round(serviceYears * 100) / 100,
    dailyAvgWage: dailyForCalc,
    retirementPay,
    incomeTax,
    localTax,
    netPay,
  };
}

interface State {
  settlements: RetirementSettlement[];
}

interface Actions {
  upsertSettlement: (s: RetirementSettlement) => void;
  updateStatus: (id: string, status: RetirementSettlementStatus, paidBy?: string, paidByName?: string) => void;
  deleteSettlement: (id: string) => void;
  getByEmployee: (employeeId: string) => RetirementSettlement | undefined;
  getAll: () => RetirementSettlement[];
}

export type RetirementStore = State & Actions;

export const useRetirementStore = create<RetirementStore>()(
  persist(
    (set, get) => ({
      settlements: [],

      upsertSettlement: (s) =>
        set((state) => {
          const idx = state.settlements.findIndex((x) => x.id === s.id);
          const now = new Date().toISOString();
          const updated = { ...s, updated_at: now };
          if (idx >= 0) {
            const next = [...state.settlements];
            next[idx] = updated;
            return { settlements: next };
          }
          return { settlements: [...state.settlements, updated] };
        }),

      updateStatus: (id, status, paidBy, paidByName) =>
        set((state) => ({
          settlements: state.settlements.map((s) =>
            s.id === id
              ? {
                  ...s,
                  status,
                  paid_at: status === 'paid' ? new Date().toISOString() : s.paid_at,
                  paid_by: status === 'paid' ? (paidBy ?? s.paid_by) : s.paid_by,
                  paid_by_name: status === 'paid' ? (paidByName ?? s.paid_by_name) : s.paid_by_name,
                  updated_at: new Date().toISOString(),
                }
              : s,
          ),
        })),

      deleteSettlement: (id) =>
        set((state) => ({ settlements: state.settlements.filter((s) => s.id !== id) })),

      getByEmployee: (employeeId) =>
        get().settlements.find((s) => s.employee_id === employeeId),

      getAll: () =>
        get().settlements.sort((a, b) => b.resignation_date.localeCompare(a.resignation_date)),
    }),
    { name: 'hrms-retirement', version: 1 },
  ),
);
