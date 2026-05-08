'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TripExpenseRate, TripExpenseSettlement, TripExpenseSettlementStatus, TripExpenseGrade, TripScope } from '@/types';

// 파나시아 실제 출장비 기준 (HU093 + HU403~HU406)
const defaultRates: TripExpenseRate[] = [
  // 직무별 일비 (국내/해외)
  { id: 'tr-31I', job_code: '31', job_name: '연구/시험 직무',     grade: 'A', scope: 'domestic', daily_amount: 80000,  is_active: true },
  { id: 'tr-31O', job_code: '31', job_name: '연구/시험 직무',     grade: 'A', scope: 'overseas', daily_amount: 116000, is_active: true },
  { id: 'tr-32I', job_code: '32', job_name: 'AS/시운전 직무',     grade: 'A', scope: 'domestic', daily_amount: 80000,  is_active: true },
  { id: 'tr-32O', job_code: '32', job_name: 'AS/시운전 직무',     grade: 'A', scope: 'overseas', daily_amount: 116000, is_active: true },
  { id: 'tr-33I', job_code: '33', job_name: '설치/공사/감리 직무', grade: 'A', scope: 'domestic', daily_amount: 80000,  is_active: true },
  { id: 'tr-33O', job_code: '33', job_name: '설치/공사/감리 직무', grade: 'A', scope: 'overseas', daily_amount: 116000, is_active: true },
  { id: 'tr-34I', job_code: '34', job_name: '안전관리 직무',       grade: 'B', scope: 'domestic', daily_amount: 50000,  is_active: true },
  { id: 'tr-34O', job_code: '34', job_name: '안전관리 직무',       grade: 'B', scope: 'overseas', daily_amount: 72500,  is_active: true },
  { id: 'tr-35I', job_code: '35', job_name: '품질검사 직무',       grade: 'B', scope: 'domestic', daily_amount: 50000,  is_active: true },
  { id: 'tr-35O', job_code: '35', job_name: '품질검사 직무',       grade: 'B', scope: 'overseas', daily_amount: 72500,  is_active: true },
  { id: 'tr-36I', job_code: '36', job_name: '영업 직무',           grade: 'C', scope: 'domestic', daily_amount: 30000,  is_active: true },
  { id: 'tr-36O', job_code: '36', job_name: '영업 직무',           grade: 'C', scope: 'overseas', daily_amount: 43500,  is_active: true },
  { id: 'tr-37I', job_code: '37', job_name: '관리/기타 직무',      grade: 'C', scope: 'domestic', daily_amount: 30000,  is_active: true },
  { id: 'tr-37O', job_code: '37', job_name: '관리/기타 직무',      grade: 'C', scope: 'overseas', daily_amount: 43500,  is_active: true },
];

// 기본 단가
export const DEFAULT_MEAL_PER_DAY = 8000;
export const DEFAULT_ACCOMMODATION = 50000;
export const DEFAULT_FUEL_DAILY = 5000;

// 출장 유형 → 등급 매핑
export function tripTypeToGrade(tripType: string): TripExpenseGrade {
  if (tripType === 'business_trip_a') return 'A';
  if (tripType === 'business_trip_b') return 'B';
  if (tripType === 'business_trip_c') return 'C';
  if (tripType === 'field_work') return 'C';
  if (tripType.includes('overseas')) return 'A';
  return 'B';
}

// 출장 유형 → 국내/해외
export function tripTypeToScope(tripType: string, region?: string): TripScope {
  if (tripType.includes('overseas') || tripType === 'dispatch_overseas') return 'overseas';
  if (region) {
    const overseasMarkers = ['중국', '일본', '미국', '베트남', '인도네시아', '싱가포르', '말레이시아', 'UAE', '두바이'];
    if (overseasMarkers.some((m) => region.includes(m))) return 'overseas';
  }
  return 'domestic';
}

// 출장비 자동 계산
export function calcTripExpense(input: {
  grade: TripExpenseGrade;
  scope: TripScope;
  tripDays: number;
  rates: TripExpenseRate[];
  // 옵션
  withMeal?: boolean;
  mealCount?: number;        // 식수 (보통 일수 × 3)
  withAccommodation?: boolean;
  accommodationNights?: number; // 숙박 박수 (보통 일수 - 1)
  withFuel?: boolean;
}) {
  // 일비
  const matchingRate = input.rates.find((r) =>
    r.grade === input.grade && r.scope === input.scope && r.is_active,
  );
  const dailyAmount = matchingRate?.daily_amount ?? 0;
  const dailyAllowance = dailyAmount * input.tripDays;

  // 식대
  const mealAllowance = input.withMeal
    ? DEFAULT_MEAL_PER_DAY * (input.mealCount ?? input.tripDays * 3)
    : 0;

  // 숙박비 (마지막 날 제외)
  const accommodationAllowance = input.withAccommodation
    ? DEFAULT_ACCOMMODATION * (input.accommodationNights ?? Math.max(0, input.tripDays - 1))
    : 0;

  // 유류대 (국내만)
  const fuelAllowance = input.withFuel && input.scope === 'domestic'
    ? DEFAULT_FUEL_DAILY * input.tripDays
    : 0;

  return {
    dailyRate: dailyAmount,
    dailyAllowance,
    mealAllowance,
    accommodationAllowance,
    fuelAllowance,
    total: dailyAllowance + mealAllowance + accommodationAllowance + fuelAllowance,
  };
}

interface State {
  rates: TripExpenseRate[];
  settlements: TripExpenseSettlement[];
}

interface Actions {
  // Rates
  upsertRate: (r: TripExpenseRate) => void;
  deleteRate: (id: string) => void;
  // Settlements
  upsertSettlement: (s: TripExpenseSettlement) => void;
  updateStatus: (id: string, status: TripExpenseSettlementStatus, by?: string, byName?: string, comment?: string) => void;
  deleteSettlement: (id: string) => void;
  getByEmployee: (employeeId: string) => TripExpenseSettlement[];
  getByApproval: (approvalId: string) => TripExpenseSettlement | undefined;
  getAll: () => TripExpenseSettlement[];
}

export type TripExpenseStore = State & Actions;

export const useTripExpenseStore = create<TripExpenseStore>()(
  persist(
    (set, get) => ({
      rates: defaultRates,
      settlements: [],

      upsertRate: (r) =>
        set((s) => {
          const idx = s.rates.findIndex((x) => x.id === r.id);
          if (idx >= 0) {
            const next = [...s.rates];
            next[idx] = r;
            return { rates: next };
          }
          return { rates: [...s.rates, r] };
        }),

      deleteRate: (id) =>
        set((s) => ({ rates: s.rates.filter((r) => r.id !== id) })),

      upsertSettlement: (st) =>
        set((s) => {
          const idx = s.settlements.findIndex((x) => x.id === st.id);
          const updated = { ...st, updated_at: new Date().toISOString() };
          if (idx >= 0) {
            const next = [...s.settlements];
            next[idx] = updated;
            return { settlements: next };
          }
          return { settlements: [...s.settlements, updated] };
        }),

      updateStatus: (id, status, by, byName, comment) =>
        set((s) => ({
          settlements: s.settlements.map((x) =>
            x.id === id
              ? {
                  ...x,
                  status,
                  reviewed_at: status !== 'draft' && status !== 'submitted' ? new Date().toISOString() : x.reviewed_at,
                  reviewed_by: by ?? x.reviewed_by,
                  reviewed_by_name: byName ?? x.reviewed_by_name,
                  review_comment: comment ?? x.review_comment,
                  paid_at: status === 'paid' ? new Date().toISOString() : x.paid_at,
                  submitted_at: status === 'submitted' ? new Date().toISOString() : x.submitted_at,
                  updated_at: new Date().toISOString(),
                }
              : x,
          ),
        })),

      deleteSettlement: (id) =>
        set((s) => ({ settlements: s.settlements.filter((x) => x.id !== id) })),

      getByEmployee: (employeeId) =>
        get().settlements.filter((s) => s.employee_id === employeeId).sort((a, b) => b.start_date.localeCompare(a.start_date)),

      getByApproval: (approvalId) =>
        get().settlements.find((s) => s.approval_id === approvalId),

      getAll: () =>
        get().settlements.sort((a, b) => b.start_date.localeCompare(a.start_date)),
    }),
    { name: 'hrms-trip-expense', version: 1 },
  ),
);
