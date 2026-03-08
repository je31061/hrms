'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WorkSchedule,
  Holiday,
  ApprovalTemplate,
  EvaluationCriterion,
  CondolenceLeaveRule,
  AttendanceTypeConfig,
  UserRole,
} from '@/types';

// ---- Display & Print Template types ----

export interface DisplayState {
  theme: 'system' | 'light' | 'dark';
  font_size: 'small' | 'medium' | 'large';
  content_density: 'compact' | 'comfortable' | 'spacious';
  sidebar_compact: boolean;
  rows_per_page: number;
  date_format: 'yyyy-MM-dd' | 'yyyy.MM.dd' | 'yyyy년 MM월 dd일';
  number_format: 'comma' | 'plain';
}

export interface PrintTemplateState {
  header_title: string;
  company_name_visible: boolean;
  company_logo_text: string;
  show_department: boolean;
  show_position: boolean;
  show_dependents: boolean;
  show_formula: boolean;
  show_tax_badge: boolean;
  header_note: string;
  footer_note: string;
  page_size: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margin: 'normal' | 'narrow' | 'wide';
}

// ---- State shape ----

interface SettingsState {
  // Company info
  company: {
    name: string;
    business_number: string;
    ceo_name: string;
    address: string;
    industry: string;
    phone: string;
    fax: string;
    website: string;
  };

  // Work schedule
  work: {
    default_start_time: string;
    default_end_time: string;
    lunch_break_minutes: number;
    weekly_hours: number;
    enforce_52h_rule: boolean;
    max_weekly_hours: number;
    overtime_limit_weekly: number;
    overtime_warning_hours: number;
    overtime_rate: number;
    night_rate: number;
    holiday_rate: number;
    holiday_overtime_rate: number;
  };
  workSchedules: WorkSchedule[];

  // Leave
  leave: {
    auto_grant_annual: boolean;
    allow_half_day: boolean;
    allow_quarter_day: boolean;
    unused_leave_policy: 'carryover' | 'payout';
    carryover_limit: number;
  };
  condolenceLeaveRules: CondolenceLeaveRule[];

  // Payroll
  payroll: {
    pay_day: number;
    national_pension_rate: number;
    health_insurance_rate: number;
    long_term_care_rate: number;
    employment_insurance_rate: number;
    meal_allowance_limit: number;
    transport_allowance_limit: number;
  };

  // Approval
  approvalTemplates: ApprovalTemplate[];

  // Evaluation
  evaluation: {
    self_weight: number;
    manager_weight: number;
    peer_weight: number;
    grade_s_ratio: number;
    grade_a_ratio: number;
    grade_b_ratio: number;
    grade_c_ratio: number;
    grade_d_ratio: number;
  };
  evaluationCriteria: EvaluationCriterion[];

  // Notifications
  notifications: {
    approval_alert: boolean;
    leave_alert: boolean;
    birthday_alert: boolean;
    attendance_alert: boolean;
    payroll_alert: boolean;
  };

  // Security
  security: {
    session_timeout_minutes: number;
    min_password_length: number;
    require_special_char: boolean;
    require_number: boolean;
  };

  // Holidays
  holidays: Holiday[];
  holiday_auto_substitute: boolean;

  // Attendance Types
  attendanceTypes: AttendanceTypeConfig[];

  // Display
  display: DisplayState;

  // Print Template
  printTemplate: PrintTemplateState;

  // Menu Permissions (role → allowed menu href[])
  menuPermissions: Record<UserRole, string[]>;
}

interface SettingsActions {
  // Company
  updateCompany: (data: Partial<SettingsState['company']>) => void;

  // Work
  updateWork: (data: Partial<SettingsState['work']>) => void;
  addWorkSchedule: (schedule: WorkSchedule) => void;
  updateWorkSchedule: (id: string, schedule: Partial<WorkSchedule>) => void;
  deleteWorkSchedule: (id: string) => void;
  setDefaultWorkSchedule: (id: string) => void;

  // Leave
  updateLeave: (data: Partial<SettingsState['leave']>) => void;
  addCondolenceRule: (rule: CondolenceLeaveRule) => void;
  updateCondolenceRule: (id: string, rule: Partial<CondolenceLeaveRule>) => void;
  deleteCondolenceRule: (id: string) => void;

  // Payroll
  updatePayroll: (data: Partial<SettingsState['payroll']>) => void;

  // Approval
  addApprovalTemplate: (template: ApprovalTemplate) => void;
  updateApprovalTemplate: (id: string, template: Partial<ApprovalTemplate>) => void;
  deleteApprovalTemplate: (id: string) => void;

  // Evaluation
  updateEvaluation: (data: Partial<SettingsState['evaluation']>) => void;
  addEvaluationCriterion: (criterion: EvaluationCriterion) => void;
  updateEvaluationCriterion: (id: string, criterion: Partial<EvaluationCriterion>) => void;
  deleteEvaluationCriterion: (id: string) => void;

  // Notifications
  updateNotifications: (data: Partial<SettingsState['notifications']>) => void;

  // Security
  updateSecurity: (data: Partial<SettingsState['security']>) => void;

  // Holidays
  setHolidayAutoSubstitute: (value: boolean) => void;
  addHoliday: (holiday: Holiday) => void;
  deleteHoliday: (id: string) => void;

  // Attendance Types
  addAttendanceType: (type: AttendanceTypeConfig) => void;
  updateAttendanceType: (id: string, data: Partial<AttendanceTypeConfig>) => void;
  deleteAttendanceType: (id: string) => void;
  toggleAttendanceTypeActive: (id: string) => void;

  // Display
  updateDisplay: (data: Partial<DisplayState>) => void;

  // Print Template
  updatePrintTemplate: (data: Partial<PrintTemplateState>) => void;

  // Menu Permissions
  updateMenuPermissions: (role: UserRole, hrefs: string[]) => void;
}

export type SettingsStore = SettingsState & SettingsActions;

// ---- Default values ----

const defaultWorkSchedules: WorkSchedule[] = [
  {
    id: 'ws-1',
    name: '기본 고정근무',
    type: 'fixed',
    start_time: '09:00',
    end_time: '18:00',
    core_start_time: null,
    core_end_time: null,
    break_minutes: 60,
    weekly_hours: 40,
    is_default: true,
    is_active: true,
    effective_from: null,
    effective_to: null,
    settings: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ws-2',
    name: '시차출퇴근제',
    type: 'staggered',
    start_time: '09:00',
    end_time: '18:00',
    core_start_time: '10:00',
    core_end_time: '16:00',
    break_minutes: 60,
    weekly_hours: 40,
    is_default: false,
    is_active: true,
    effective_from: null,
    effective_to: null,
    settings: { earliest_start: '07:00', latest_start: '10:00' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ws-3',
    name: '선택적 근로시간제',
    type: 'selective',
    start_time: '09:00',
    end_time: '18:00',
    core_start_time: '10:00',
    core_end_time: '16:00',
    break_minutes: 60,
    weekly_hours: 40,
    is_default: false,
    is_active: true,
    effective_from: null,
    effective_to: null,
    settings: { settlement_period: '1month' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const defaultCondolenceRules: CondolenceLeaveRule[] = [
  { id: 'cl-1', event_name: '본인 결혼', days: 5, is_paid: true, is_active: true, created_at: '', updated_at: '' },
  { id: 'cl-2', event_name: '자녀 결혼', days: 1, is_paid: true, is_active: true, created_at: '', updated_at: '' },
  { id: 'cl-3', event_name: '부모 사망', days: 5, is_paid: true, is_active: true, created_at: '', updated_at: '' },
  { id: 'cl-4', event_name: '배우자 사망', days: 5, is_paid: true, is_active: true, created_at: '', updated_at: '' },
  { id: 'cl-5', event_name: '자녀 사망', days: 5, is_paid: true, is_active: true, created_at: '', updated_at: '' },
  { id: 'cl-6', event_name: '배우자 부모 사망', days: 3, is_paid: true, is_active: true, created_at: '', updated_at: '' },
  { id: 'cl-7', event_name: '조부모 사망', days: 3, is_paid: true, is_active: true, created_at: '', updated_at: '' },
  { id: 'cl-8', event_name: '형제자매 사망', days: 3, is_paid: true, is_active: true, created_at: '', updated_at: '' },
  { id: 'cl-9', event_name: '배우자 조부모 사망', days: 1, is_paid: true, is_active: true, created_at: '', updated_at: '' },
  { id: 'cl-10', event_name: '배우자 형제자매 사망', days: 1, is_paid: true, is_active: true, created_at: '', updated_at: '' },
];

const defaultHolidays: Holiday[] = [
  { id: 'h-1', date: '2026-01-01', name: '신정', type: 'legal', is_active: true, created_at: '' },
  { id: 'h-2', date: '2026-02-16', name: '설날 전날', type: 'legal', is_active: true, created_at: '' },
  { id: 'h-3', date: '2026-02-17', name: '설날', type: 'legal', is_active: true, created_at: '' },
  { id: 'h-4', date: '2026-02-18', name: '설날 다음날', type: 'legal', is_active: true, created_at: '' },
  { id: 'h-5', date: '2026-03-01', name: '삼일절', type: 'legal', is_active: true, created_at: '' },
  { id: 'h-6', date: '2026-05-05', name: '어린이날', type: 'legal', is_active: true, created_at: '' },
  { id: 'h-7', date: '2026-05-24', name: '부처님오신날', type: 'legal', is_active: true, created_at: '' },
  { id: 'h-8', date: '2026-06-06', name: '현충일', type: 'legal', is_active: true, created_at: '' },
  { id: 'h-9', date: '2026-08-15', name: '광복절', type: 'legal', is_active: true, created_at: '' },
  { id: 'h-10', date: '2026-09-24', name: '추석 전날', type: 'legal', is_active: true, created_at: '' },
  { id: 'h-11', date: '2026-09-25', name: '추석', type: 'legal', is_active: true, created_at: '' },
  { id: 'h-12', date: '2026-09-26', name: '추석 다음날', type: 'legal', is_active: true, created_at: '' },
  { id: 'h-13', date: '2026-10-03', name: '개천절', type: 'legal', is_active: true, created_at: '' },
  { id: 'h-14', date: '2026-10-09', name: '한글날', type: 'legal', is_active: true, created_at: '' },
  { id: 'h-15', date: '2026-12-25', name: '크리스마스', type: 'legal', is_active: true, created_at: '' },
];

const defaultApprovalTemplates: ApprovalTemplate[] = [
  { id: 'at-1', name: '휴가 결재', document_type: 'leave', steps: [{ step: 1, role: 'dept_manager' }, { step: 2, role: 'hr_manager' }], is_active: true, created_at: '', updated_at: '' },
  { id: 'at-2', name: '경비 결재', document_type: 'expense', steps: [{ step: 1, role: 'dept_manager' }, { step: 2, role: 'hr_manager' }, { step: 3, role: 'admin' }], is_active: true, created_at: '', updated_at: '' },
  { id: 'at-3', name: '인사발령 결재', document_type: 'appointment', steps: [{ step: 1, role: 'hr_manager' }, { step: 2, role: 'admin' }], is_active: true, created_at: '', updated_at: '' },
];

const defaultEvalCriteria: EvaluationCriterion[] = [
  { id: 'ec-1', name: '업무 성과', category: 'performance', weight: 30, description: '목표 달성도 및 업무 품질', is_active: true, created_at: '', updated_at: '' },
  { id: 'ec-2', name: '업무 역량', category: 'competency', weight: 25, description: '직무 수행에 필요한 전문 역량', is_active: true, created_at: '', updated_at: '' },
  { id: 'ec-3', name: '리더십', category: 'leadership', weight: 15, description: '팀워크 및 리더십 발휘', is_active: true, created_at: '', updated_at: '' },
  { id: 'ec-4', name: '태도', category: 'attitude', weight: 15, description: '근무 태도 및 조직 적응', is_active: true, created_at: '', updated_at: '' },
  { id: 'ec-5', name: '자기 개발', category: 'development', weight: 15, description: '자기 개발 및 학습 노력', is_active: true, created_at: '', updated_at: '' },
];

const defaultAttendanceTypes: AttendanceTypeConfig[] = [
  { id: 'atype-1', code: 'office', label: '사무실 출근', is_active: true, effective_from: null, effective_to: null, requires_approval: false, requires_location: false, requires_purpose: false, counts_as_work: true, sort_order: 1, is_system: true, created_at: '', updated_at: '' },
  { id: 'atype-2', code: 'business_trip', label: '출장', is_active: true, effective_from: null, effective_to: null, requires_approval: true, requires_location: true, requires_purpose: true, counts_as_work: true, sort_order: 2, is_system: true, created_at: '', updated_at: '' },
  { id: 'atype-3', code: 'field_work', label: '외근', is_active: true, effective_from: null, effective_to: null, requires_approval: true, requires_location: true, requires_purpose: true, counts_as_work: true, sort_order: 3, is_system: true, created_at: '', updated_at: '' },
  { id: 'atype-4', code: 'remote', label: '재택근무', is_active: true, effective_from: null, effective_to: null, requires_approval: true, requires_location: false, requires_purpose: false, counts_as_work: true, sort_order: 4, is_system: true, created_at: '', updated_at: '' },
  { id: 'atype-5', code: 'training', label: '교육/연수', is_active: true, effective_from: null, effective_to: null, requires_approval: true, requires_location: true, requires_purpose: true, counts_as_work: true, sort_order: 5, is_system: true, created_at: '', updated_at: '' },
  { id: 'atype-6', code: 'dispatch', label: '파견', is_active: true, effective_from: null, effective_to: null, requires_approval: true, requires_location: true, requires_purpose: true, counts_as_work: true, sort_order: 6, is_system: true, created_at: '', updated_at: '' },
  { id: 'atype-7', code: 'other', label: '기타', is_active: true, effective_from: null, effective_to: null, requires_approval: false, requires_location: false, requires_purpose: false, counts_as_work: false, sort_order: 7, is_system: false, created_at: '', updated_at: '' },
];

// ---- Store ----

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // --- Initial State ---
      company: {
        name: '주식회사 파나시아',
        business_number: '603-81-29289',
        ceo_name: '이수태 (회장), 이민걸·정진택 (공동대표이사)',
        address: '부산광역시 강서구 미음산단3로 55 (미음동)',
        industry: '선박 구성 부분품 제조업',
        phone: '051-831-1010',
        fax: '070-831-1399',
        website: 'www.worldpanasia.com',
      },
      work: {
        default_start_time: '09:00',
        default_end_time: '18:00',
        lunch_break_minutes: 60,
        weekly_hours: 40,
        enforce_52h_rule: true,
        max_weekly_hours: 52,
        overtime_limit_weekly: 12,
        overtime_warning_hours: 48,
        overtime_rate: 1.5,
        night_rate: 0.5,
        holiday_rate: 1.5,
        holiday_overtime_rate: 2.0,
      },
      workSchedules: defaultWorkSchedules,
      leave: {
        auto_grant_annual: true,
        allow_half_day: true,
        allow_quarter_day: false,
        unused_leave_policy: 'carryover',
        carryover_limit: 5,
      },
      condolenceLeaveRules: defaultCondolenceRules,
      payroll: {
        pay_day: 25,
        national_pension_rate: 4.5,
        health_insurance_rate: 3.545,
        long_term_care_rate: 12.95,
        employment_insurance_rate: 0.9,
        meal_allowance_limit: 200000,
        transport_allowance_limit: 200000,
      },
      approvalTemplates: defaultApprovalTemplates,
      evaluation: {
        self_weight: 20,
        manager_weight: 60,
        peer_weight: 20,
        grade_s_ratio: 5,
        grade_a_ratio: 20,
        grade_b_ratio: 50,
        grade_c_ratio: 20,
        grade_d_ratio: 5,
      },
      evaluationCriteria: defaultEvalCriteria,
      notifications: {
        approval_alert: true,
        leave_alert: true,
        birthday_alert: true,
        attendance_alert: true,
        payroll_alert: true,
      },
      security: {
        session_timeout_minutes: 30,
        min_password_length: 8,
        require_special_char: true,
        require_number: true,
      },
      attendanceTypes: defaultAttendanceTypes,
      holidays: defaultHolidays,
      holiday_auto_substitute: true,
      display: {
        theme: 'system',
        font_size: 'medium',
        content_density: 'comfortable',
        sidebar_compact: false,
        rows_per_page: 10,
        date_format: 'yyyy-MM-dd',
        number_format: 'comma',
      },
      menuPermissions: {
        admin: ['/', '/my', '/organization', '/employees', '/attendance', '/leave', '/payroll', '/appointments', '/approval', '/recruitment', '/training', '/evaluation', '/workflows', '/issues', '/audit-log', '/settings'],
        hr_manager: ['/', '/my', '/organization', '/employees', '/attendance', '/leave', '/payroll', '/appointments', '/approval', '/recruitment', '/training', '/evaluation', '/workflows', '/issues'],
        dept_manager: ['/', '/my', '/organization', '/employees', '/attendance', '/leave', '/approval', '/evaluation', '/issues'],
        employee: ['/', '/my', '/attendance', '/leave', '/approval', '/issues'],
      },
      printTemplate: {
        header_title: '급여명세서',
        company_name_visible: true,
        company_logo_text: '',
        show_department: true,
        show_position: true,
        show_dependents: true,
        show_formula: true,
        show_tax_badge: true,
        header_note: '',
        footer_note: '본 명세서는 급여 지급 내역을 안내하기 위한 문서입니다.',
        page_size: 'A4',
        orientation: 'portrait',
        margin: 'normal',
      },

      // --- Actions ---
      updateCompany: (data) =>
        set((s) => ({ company: { ...s.company, ...data } })),

      updateWork: (data) =>
        set((s) => ({ work: { ...s.work, ...data } })),

      addWorkSchedule: (schedule) =>
        set((s) => ({ workSchedules: [...s.workSchedules, schedule] })),

      updateWorkSchedule: (id, data) =>
        set((s) => ({
          workSchedules: s.workSchedules.map((ws) =>
            ws.id === id ? { ...ws, ...data, updated_at: new Date().toISOString() } : ws
          ),
        })),

      deleteWorkSchedule: (id) =>
        set((s) => ({
          workSchedules: s.workSchedules.map((ws) =>
            ws.id === id
              ? { ...ws, is_active: false, effective_to: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString() }
              : ws,
          ),
        })),

      setDefaultWorkSchedule: (id) =>
        set((s) => ({
          workSchedules: s.workSchedules.map((ws) => ({
            ...ws,
            is_default: ws.id === id,
          })),
        })),

      updateLeave: (data) =>
        set((s) => ({ leave: { ...s.leave, ...data } })),

      addCondolenceRule: (rule) =>
        set((s) => ({ condolenceLeaveRules: [...s.condolenceLeaveRules, rule] })),

      updateCondolenceRule: (id, data) =>
        set((s) => ({
          condolenceLeaveRules: s.condolenceLeaveRules.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      deleteCondolenceRule: (id) =>
        set((s) => ({
          condolenceLeaveRules: s.condolenceLeaveRules.filter((r) => r.id !== id),
        })),

      updatePayroll: (data) =>
        set((s) => ({ payroll: { ...s.payroll, ...data } })),

      addApprovalTemplate: (template) =>
        set((s) => ({ approvalTemplates: [...s.approvalTemplates, template] })),

      updateApprovalTemplate: (id, data) =>
        set((s) => ({
          approvalTemplates: s.approvalTemplates.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        })),

      deleteApprovalTemplate: (id) =>
        set((s) => ({
          approvalTemplates: s.approvalTemplates.filter((t) => t.id !== id),
        })),

      updateEvaluation: (data) =>
        set((s) => ({ evaluation: { ...s.evaluation, ...data } })),

      addEvaluationCriterion: (criterion) =>
        set((s) => ({ evaluationCriteria: [...s.evaluationCriteria, criterion] })),

      updateEvaluationCriterion: (id, data) =>
        set((s) => ({
          evaluationCriteria: s.evaluationCriteria.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),

      deleteEvaluationCriterion: (id) =>
        set((s) => ({
          evaluationCriteria: s.evaluationCriteria.filter((c) => c.id !== id),
        })),

      updateNotifications: (data) =>
        set((s) => ({ notifications: { ...s.notifications, ...data } })),

      updateSecurity: (data) =>
        set((s) => ({ security: { ...s.security, ...data } })),

      setHolidayAutoSubstitute: (value) =>
        set({ holiday_auto_substitute: value }),

      addHoliday: (holiday) =>
        set((s) => ({ holidays: [...s.holidays, holiday] })),

      deleteHoliday: (id) =>
        set((s) => ({
          holidays: s.holidays.filter((h) => h.id !== id),
        })),

      addAttendanceType: (type) =>
        set((s) => ({ attendanceTypes: [...s.attendanceTypes, type] })),

      updateAttendanceType: (id, data) =>
        set((s) => ({
          attendanceTypes: s.attendanceTypes.map((t) =>
            t.id === id ? { ...t, ...data, updated_at: new Date().toISOString() } : t
          ),
        })),

      deleteAttendanceType: (id) =>
        set((s) => ({
          attendanceTypes: s.attendanceTypes.map((t) =>
            t.id === id
              ? { ...t, is_active: false, effective_to: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString() }
              : t,
          ),
        })),

      toggleAttendanceTypeActive: (id) =>
        set((s) => ({
          attendanceTypes: s.attendanceTypes.map((t) =>
            t.id === id ? { ...t, is_active: !t.is_active, updated_at: new Date().toISOString() } : t
          ),
        })),

      updateDisplay: (data) =>
        set((s) => ({ display: { ...s.display, ...data } })),

      updatePrintTemplate: (data) =>
        set((s) => ({ printTemplate: { ...s.printTemplate, ...data } })),

      updateMenuPermissions: (role, hrefs) =>
        set((s) => ({ menuPermissions: { ...s.menuPermissions, [role]: hrefs } })),
    }),
    {
      name: 'hrms-settings',
      version: 5,
      migrate: (persisted: unknown, version: number) => {
        if (version < 2) {
          return {};
        }
        let state = persisted as Record<string, unknown>;
        if (version < 3) {
          state = {
            ...state,
            menuPermissions: {
              admin: ['/', '/my', '/organization', '/employees', '/attendance', '/leave', '/payroll', '/appointments', '/approval', '/recruitment', '/training', '/evaluation', '/workflows', '/audit-log', '/settings'],
              hr_manager: ['/', '/my', '/organization', '/employees', '/attendance', '/leave', '/payroll', '/appointments', '/approval', '/recruitment', '/training', '/evaluation', '/workflows'],
              dept_manager: ['/', '/my', '/organization', '/employees', '/attendance', '/leave', '/approval', '/evaluation'],
              employee: ['/', '/my', '/attendance', '/leave', '/approval'],
            },
          };
        }
        if (version < 4) {
          // v3→v4: Add effective_from/to to WorkSchedule and AttendanceTypeConfig
          const addEffective = (items: Record<string, unknown>[]) =>
            items.map((item) => ({
              ...item,
              effective_from: (item as Record<string, unknown>).effective_from ?? null,
              effective_to: (item as Record<string, unknown>).effective_to ?? null,
            }));
          state = {
            ...state,
            workSchedules: addEffective((state.workSchedules as Record<string, unknown>[]) ?? []),
            attendanceTypes: addEffective((state.attendanceTypes as Record<string, unknown>[]) ?? []),
          };
        }
        if (version < 5) {
          // v4→v5: Add /issues route to menu permissions for all roles
          const perms = state.menuPermissions as Record<string, string[]> | undefined;
          if (perms) {
            for (const role of Object.keys(perms)) {
              if (!perms[role].includes('/issues')) {
                perms[role] = [...perms[role], '/issues'];
              }
            }
            state = { ...state, menuPermissions: perms };
          }
        }
        return state;
      },
    }
  )
);
