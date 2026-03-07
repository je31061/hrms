'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PayrollItemConfig, SavedPayroll, PayrollStatus } from '@/types';

// ---- Demo employee salary data ----

export const demoEmployeeSalaries: Record<string, number> = {
  // 대표이사실
  e001: 15000000, e002: 12000000, e003: 12000000,
  // 경영지원본부
  e004: 9000000,
  // 인사팀
  e010: 5000000, e011: 3800000, e012: 3200000, e032: 3700000, e033: 3000000,
  // 재무회계팀
  e013: 5000000, e014: 3800000, e034: 3600000, e035: 3000000,
  // 총무팀
  e015: 5000000, e036: 3500000, e037: 2900000,
  // 영업본부
  e016: 9000000,
  // 국내영업팀
  e017: 6000000, e018: 3800000, e038: 3700000, e039: 3100000, e040: 3000000,
  // 해외영업팀
  e019: 5000000, e020: 3200000, e041: 4800000, e042: 3700000, e043: 3800000, e044: 3100000,
  // 기술연구소
  e021: 9000000,
  // 연구개발팀
  e022: 6000000, e023: 3800000, e045: 4600000, e046: 3700000, e047: 3600000, e048: 3100000, e049: 2900000, e050: 2800000,
  // 스크러버사업부
  e024: 7000000, e051: 5500000, e052: 4500000, e053: 3700000, e054: 3600000, e055: 3100000, e056: 2900000,
  // BWTS사업부
  e025: 7000000, e057: 4800000, e058: 4400000, e059: 3700000, e060: 3500000, e061: 3100000, e062: 2900000,
  // 연료공급사업부
  e063: 5500000, e064: 4500000, e065: 3600000, e066: 3100000, e067: 2900000,
  // 계측제어사업부
  e068: 5500000, e069: 4400000, e070: 3600000, e071: 3100000, e072: 2900000,
  // 생산본부
  e026: 9000000,
  // 생산1팀
  e027: 5000000, e073: 4600000, e074: 3700000, e075: 3600000, e076: 3500000, e077: 3100000, e078: 3000000, e079: 2900000, e080: 2400000,
  // 생산2팀
  e028: 5000000, e081: 4500000, e082: 3700000, e083: 3600000, e084: 3100000, e085: 3000000, e086: 2900000, e087: 2400000,
  // 품질관리팀
  e029: 6000000, e088: 4500000, e089: 3700000, e090: 3100000, e091: 2900000,
  // 조달구매본부
  e092: 7000000, e093: 4800000, e094: 3600000, e095: 3000000,
  // 스마트서비스본부
  e096: 7000000, e097: 4800000, e098: 3700000, e099: 3100000, e100: 2800000,
  // HSE실
  e030: 7000000,
  // 안전팀
  e031: 5000000, e101: 3700000, e102: 3000000,
  // 공무팀
  e103: 5000000, e104: 3600000, e105: 2900000,
};

// ---- 월 소정근로시간 (근로기준법) ----
export const MONTHLY_WORK_HOURS = 209;

// ---- Default payroll item configs ----

const defaultPayrollItems: PayrollItemConfig[] = [
  // === Earnings ===
  { id: 'pi-base', name: '기본급', code: 'base_salary', category: 'earning', calc_type: 'fixed', is_taxable: true, is_active: true, rate_multiplier: null, formula_description: '근로계약 기본급', default_amount: 0, sort_order: 1 },
  { id: 'pi-meal', name: '식대', code: 'meal_allowance', category: 'earning', calc_type: 'fixed', is_taxable: false, is_active: true, rate_multiplier: null, formula_description: '비과세 식대 (월 20만원 한도)', default_amount: 200000, sort_order: 2 },
  { id: 'pi-transport', name: '교통비', code: 'transport_allowance', category: 'earning', calc_type: 'fixed', is_taxable: false, is_active: true, rate_multiplier: null, formula_description: '비과세 교통비 (월 20만원 한도)', default_amount: 200000, sort_order: 3 },
  { id: 'pi-position', name: '직책수당', code: 'position_allowance', category: 'earning', calc_type: 'fixed', is_taxable: true, is_active: true, rate_multiplier: null, formula_description: '직책에 따른 고정 수당', default_amount: 0, sort_order: 4 },
  { id: 'pi-overtime', name: '연장근로수당', code: 'overtime_pay', category: 'earning', calc_type: 'hours_rate', is_taxable: true, is_active: true, rate_multiplier: 1.5, formula_description: '통상시급 × 1.5 × 연장근로시간', default_amount: 0, sort_order: 5 },
  { id: 'pi-night', name: '야간근로수당', code: 'night_pay', category: 'earning', calc_type: 'hours_rate', is_taxable: true, is_active: true, rate_multiplier: 0.5, formula_description: '통상시급 × 0.5 × 야간근로시간', default_amount: 0, sort_order: 6 },
  { id: 'pi-holiday', name: '휴일근로수당', code: 'holiday_pay', category: 'earning', calc_type: 'hours_rate', is_taxable: true, is_active: true, rate_multiplier: 1.5, formula_description: '통상시급 × 1.5 × 휴일근로시간', default_amount: 0, sort_order: 7 },
  { id: 'pi-qualification', name: '자격수당', code: 'qualification_allowance', category: 'earning', calc_type: 'fixed', is_taxable: true, is_active: false, rate_multiplier: null, formula_description: '자격증 보유에 따른 수당', default_amount: 0, sort_order: 8 },
  { id: 'pi-family', name: '가족수당', code: 'family_allowance', category: 'earning', calc_type: 'fixed', is_taxable: true, is_active: false, rate_multiplier: null, formula_description: '부양가족에 따른 수당', default_amount: 0, sort_order: 9 },
  { id: 'pi-bonus', name: '상여금', code: 'bonus', category: 'earning', calc_type: 'fixed', is_taxable: true, is_active: false, rate_multiplier: null, formula_description: '성과 또는 정기 상여금', default_amount: 0, sort_order: 10 },

  // === Deductions (auto-calculated) ===
  { id: 'pi-pension', name: '국민연금', code: 'national_pension', category: 'deduction', calc_type: 'auto', is_taxable: false, is_active: true, rate_multiplier: null, formula_description: 'min(과세소득, 상한액) × 요율', default_amount: 0, sort_order: 1 },
  { id: 'pi-health', name: '건강보험', code: 'health_insurance', category: 'deduction', calc_type: 'auto', is_taxable: false, is_active: true, rate_multiplier: null, formula_description: '과세소득 × 요율', default_amount: 0, sort_order: 2 },
  { id: 'pi-longterm', name: '장기요양보험', code: 'long_term_care', category: 'deduction', calc_type: 'auto', is_taxable: false, is_active: true, rate_multiplier: null, formula_description: '건강보험료 × 요율', default_amount: 0, sort_order: 3 },
  { id: 'pi-employment', name: '고용보험', code: 'employment_insurance', category: 'deduction', calc_type: 'auto', is_taxable: false, is_active: true, rate_multiplier: null, formula_description: '과세소득 × 요율', default_amount: 0, sort_order: 4 },
  { id: 'pi-incometax', name: '소득세', code: 'income_tax', category: 'deduction', calc_type: 'auto', is_taxable: false, is_active: true, rate_multiplier: null, formula_description: '간이세액표 기반 (연환산 → 세율적용 → 월할)', default_amount: 0, sort_order: 5 },
  { id: 'pi-localtax', name: '지방소득세', code: 'local_tax', category: 'deduction', calc_type: 'auto', is_taxable: false, is_active: true, rate_multiplier: null, formula_description: '소득세 × 10%', default_amount: 0, sort_order: 6 },
];

// ---- Demo saved payrolls (January 2026 - paid) ----

function generateDemoPayrolls(): SavedPayroll[] {
  const demoIds = [
    'e010', 'e011', 'e012', 'e013', 'e014', 'e017', 'e018', 'e019', 'e022', 'e023',
    'e027', 'e029', 'e031', 'e032', 'e038', 'e045', 'e051', 'e057', 'e063', 'e068',
    'e073', 'e081', 'e088', 'e092', 'e097',
  ];
  return demoIds.map((empId) => {
    const base = demoEmployeeSalaries[empId] ?? 3800000;
    const meal = 200000;
    const transport = 200000;
    const taxable = base;
    const pensionBase = Math.min(Math.max(taxable, 370000), 5900000);
    const pension = Math.round(pensionBase * 0.045);
    const health = Math.round(taxable * 0.03545);
    const longterm = Math.round(health * 0.1295);
    const employment = Math.round(taxable * 0.009);
    // Simplified tax calc
    const annualIncome = taxable * 12;
    let deduction = 0;
    if (annualIncome <= 5000000) deduction = annualIncome * 0.7;
    else if (annualIncome <= 15000000) deduction = 3500000 + (annualIncome - 5000000) * 0.4;
    else if (annualIncome <= 45000000) deduction = 7500000 + (annualIncome - 15000000) * 0.15;
    else if (annualIncome <= 100000000) deduction = 12000000 + (annualIncome - 45000000) * 0.05;
    else deduction = 14750000 + (annualIncome - 100000000) * 0.02;
    const taxableCalc = Math.max(annualIncome - deduction - 1500000, 0);
    let rate = 0.06, ded = 0;
    if (taxableCalc > 1000000000) { rate = 0.45; ded = 65940000; }
    else if (taxableCalc > 500000000) { rate = 0.42; ded = 35940000; }
    else if (taxableCalc > 300000000) { rate = 0.40; ded = 25940000; }
    else if (taxableCalc > 150000000) { rate = 0.38; ded = 19940000; }
    else if (taxableCalc > 88000000) { rate = 0.35; ded = 15440000; }
    else if (taxableCalc > 50000000) { rate = 0.24; ded = 5760000; }
    else if (taxableCalc > 14000000) { rate = 0.15; ded = 1260000; }
    const annualTax = Math.round(taxableCalc * rate - ded);
    const incomeTax = Math.max(Math.round(annualTax / 12), 0);
    const localTax = Math.round(incomeTax * 0.1);
    const totalEarnings = base + meal + transport;
    const totalDeductions = pension + health + longterm + employment + incomeTax + localTax;
    const fmtWon = (n: number) => new Intl.NumberFormat('ko-KR').format(n);

    return {
      id: `sp-${empId}-2026-01`,
      employee_id: empId,
      year: 2026,
      month: 1,
      base_salary: base,
      items: [
        { item_id: 'pi-base', name: '기본급', category: 'earning' as const, amount: base, is_taxable: true, formula: `${fmtWon(base)}원 (기본급)` },
        { item_id: 'pi-meal', name: '식대', category: 'earning' as const, amount: meal, is_taxable: false, formula: `${fmtWon(meal)}원 (비과세)` },
        { item_id: 'pi-transport', name: '교통비', category: 'earning' as const, amount: transport, is_taxable: false, formula: `${fmtWon(transport)}원 (비과세)` },
        { item_id: 'pi-pension', name: '국민연금', category: 'deduction' as const, amount: pension, is_taxable: false, formula: `min(${fmtWon(taxable)}, 5,900,000) × 4.5% = ${fmtWon(pension)}원` },
        { item_id: 'pi-health', name: '건강보험', category: 'deduction' as const, amount: health, is_taxable: false, formula: `${fmtWon(taxable)} × 3.545% = ${fmtWon(health)}원` },
        { item_id: 'pi-longterm', name: '장기요양보험', category: 'deduction' as const, amount: longterm, is_taxable: false, formula: `${fmtWon(health)} × 12.95% = ${fmtWon(longterm)}원` },
        { item_id: 'pi-employment', name: '고용보험', category: 'deduction' as const, amount: employment, is_taxable: false, formula: `${fmtWon(taxable)} × 0.9% = ${fmtWon(employment)}원` },
        { item_id: 'pi-incometax', name: '소득세', category: 'deduction' as const, amount: incomeTax, is_taxable: false, formula: `간이세액표 기반 월 ${fmtWon(incomeTax)}원` },
        { item_id: 'pi-localtax', name: '지방소득세', category: 'deduction' as const, amount: localTax, is_taxable: false, formula: `${fmtWon(incomeTax)} × 10% = ${fmtWon(localTax)}원` },
      ],
      total_earnings: totalEarnings,
      total_deductions: totalDeductions,
      net_pay: totalEarnings - totalDeductions,
      dependents: 1,
      status: 'paid' as PayrollStatus,
      created_at: '2026-01-25',
    };
  });
}

// ---- Store types ----

interface PayrollState {
  payrollItems: PayrollItemConfig[];
  savedPayrolls: SavedPayroll[];
}

interface PayrollActions {
  // Item CRUD
  addPayrollItem: (item: PayrollItemConfig) => void;
  updatePayrollItem: (id: string, data: Partial<PayrollItemConfig>) => void;
  deletePayrollItem: (id: string) => void;
  togglePayrollItem: (id: string) => void;

  // Payroll records
  savePayroll: (payroll: SavedPayroll) => void;
  updatePayrollStatus: (id: string, status: PayrollStatus) => void;
  deletePayroll: (id: string) => void;
}

export type PayrollStore = PayrollState & PayrollActions;

// ---- Store ----

export const usePayrollStore = create<PayrollStore>()(
  persist(
    (set) => ({
      payrollItems: defaultPayrollItems,
      savedPayrolls: generateDemoPayrolls(),

      addPayrollItem: (item) =>
        set((s) => ({ payrollItems: [...s.payrollItems, item] })),

      updatePayrollItem: (id, data) =>
        set((s) => ({
          payrollItems: s.payrollItems.map((pi) =>
            pi.id === id ? { ...pi, ...data } : pi
          ),
        })),

      deletePayrollItem: (id) =>
        set((s) => ({
          payrollItems: s.payrollItems.filter((pi) => pi.id !== id),
        })),

      togglePayrollItem: (id) =>
        set((s) => ({
          payrollItems: s.payrollItems.map((pi) =>
            pi.id === id ? { ...pi, is_active: !pi.is_active } : pi
          ),
        })),

      savePayroll: (payroll) =>
        set((s) => {
          const idx = s.savedPayrolls.findIndex(
            (p) =>
              p.employee_id === payroll.employee_id &&
              p.year === payroll.year &&
              p.month === payroll.month
          );
          if (idx >= 0) {
            const updated = [...s.savedPayrolls];
            updated[idx] = payroll;
            return { savedPayrolls: updated };
          }
          return { savedPayrolls: [...s.savedPayrolls, payroll] };
        }),

      updatePayrollStatus: (id, status) =>
        set((s) => ({
          savedPayrolls: s.savedPayrolls.map((p) =>
            p.id === id ? { ...p, status } : p
          ),
        })),

      deletePayroll: (id) =>
        set((s) => ({
          savedPayrolls: s.savedPayrolls.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'hrms-payroll',
      version: 2,
      migrate: () => ({}),
    }
  )
);
