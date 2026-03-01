'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ---- Interfaces ----

export interface CodeGroup {
  id: string;
  group_code: string;
  group_name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface CodeItem {
  id: string;
  group_id: string;
  code: string;
  label: string;
  sort_order: number;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

// ---- Seed Data ----

const now = new Date().toISOString();

function buildGroup(
  group_code: string,
  group_name: string,
  description: string,
  sort_order: number,
  items: Record<string, string>
): { group: CodeGroup; items: CodeItem[] } {
  const groupId = `cg-${group_code.toLowerCase()}`;
  return {
    group: {
      id: groupId,
      group_code,
      group_name,
      description,
      sort_order,
      is_active: true,
      is_system: true,
      created_at: now,
      updated_at: now,
    },
    items: Object.entries(items).map(([code, label], idx) => ({
      id: `ci-${group_code.toLowerCase()}-${code}`,
      group_id: groupId,
      code,
      label,
      sort_order: idx + 1,
      is_active: true,
      is_system: true,
      created_at: now,
      updated_at: now,
    })),
  };
}

const seedDefinitions = [
  // codes.ts (19개)
  buildGroup('ATTENDANCE_STATUS', '근태상태', '근태 상태 코드', 1, {
    normal: '정상', late: '지각', early_leave: '조퇴', absent: '결근', holiday: '휴일', leave: '휴가',
  }),
  buildGroup('LEAVE_REQUEST_STATUS', '휴가신청상태', '휴가 신청 상태 코드', 2, {
    pending: '대기', approved: '승인', rejected: '반려', cancelled: '취소',
  }),
  buildGroup('PAYROLL_STATUS', '급여상태', '급여 처리 상태 코드', 3, {
    draft: '작성중', confirmed: '확정', paid: '지급완료',
  }),
  buildGroup('APPOINTMENT_TYPES', '인사발령유형', '인사발령 유형 코드', 4, {
    promotion: '승진', transfer: '전보', title_change: '직책변경', hire: '입사', resignation: '퇴사', other: '기타',
  }),
  buildGroup('APPROVAL_STATUS', '결재상태', '결재 상태 코드', 5, {
    pending: '대기', in_progress: '진행중', approved: '승인', rejected: '반려', cancelled: '취소',
  }),
  buildGroup('JOB_POSTING_STATUS', '채용공고상태', '채용공고 상태 코드', 6, {
    draft: '작성중', open: '진행중', closed: '마감', cancelled: '취소',
  }),
  buildGroup('APPLICANT_STAGES', '지원자단계', '지원자 진행 단계 코드', 7, {
    applied: '지원', screening: '서류심사', interview: '면접', offer: '제안', hired: '채용', rejected: '불합격',
  }),
  buildGroup('TRAINING_STATUS', '교육상태', '교육 상태 코드', 8, {
    planned: '예정', in_progress: '진행중', completed: '완료', cancelled: '취소',
  }),
  buildGroup('EVALUATION_STATUS', '평가상태', '평가 상태 코드', 9, {
    draft: '작성중', in_progress: '진행중', completed: '완료',
  }),
  buildGroup('WORK_SCHEDULE_TYPES', '근무유형', '근무 스케줄 유형 코드', 10, {
    fixed: '고정근무', staggered: '시차출퇴근제', selective: '선택적 근로시간제', remote: '재택근무제', flexible: '탄력적 근로시간제', compressed: '집중근무제',
  }),
  buildGroup('HOLIDAY_TYPES', '공휴일유형', '공휴일 유형 코드', 11, {
    legal: '법정공휴일', substitute: '대체공휴일', company: '회사지정휴일',
  }),
  buildGroup('LEAVE_TYPE_CODES', '휴가유형', '휴가 유형 코드', 12, {
    annual: '연차', sick: '병가', condolence: '경조사휴가', maternity: '출산휴가', paternity: '배우자출산휴가', other: '기타',
  }),
  buildGroup('UNUSED_LEAVE_POLICIES', '미사용연차정책', '미사용 연차 처리 정책 코드', 13, {
    carryover: '이월', payout: '수당지급',
  }),
  buildGroup('WORKFLOW_TYPE', '워크플로우유형', '워크플로우 유형 코드', 14, {
    onboarding: '입사', offboarding: '퇴사', promotion: '승진', transfer: '전보', custom: '사용자정의',
  }),
  buildGroup('WORKFLOW_STATUS', '워크플로우상태', '워크플로우 상태 코드', 15, {
    pending: '대기', in_progress: '진행중', completed: '완료', cancelled: '취소',
  }),
  buildGroup('WORKFLOW_TASK_STATUS', '워크플로우태스크상태', '워크플로우 태스크 상태 코드', 16, {
    pending: '미완료', completed: '완료', skipped: '건너뜀',
  }),
  buildGroup('DOCUMENT_SUBMISSION_STATUS', '서류제출상태', '서류 제출 상태 코드', 17, {
    pending: '미제출', submitted: '제출완료', rejected: '반려',
  }),
  buildGroup('WORKFLOW_ASSIGNEE_ROLES', '워크플로우담당역할', '워크플로우 담당 역할 코드', 18, {
    hr: '인사담당자', it: 'IT담당자', manager: '부서장', admin: '총무담당자', employee: '본인', mentor: '멘토', finance: '재무담당자',
  }),
  buildGroup('APPROVAL_DOCUMENT_TYPES', '결재문서유형', '결재 문서 유형 코드', 19, {
    leave: '휴가', expense: '경비', appointment: '인사발령', overtime: '시간외근무', business_trip: '출장',
  }),
  // positions.ts (4개)
  buildGroup('EMPLOYMENT_TYPES', '고용유형', '고용 유형 코드', 20, {
    regular: '정규직', contract: '계약직', parttime: '시간제', intern: '인턴',
  }),
  buildGroup('EMPLOYEE_STATUS', '재직상태', '재직 상태 코드', 21, {
    active: '재직', on_leave: '휴직', resigned: '퇴직', retired: '정년퇴직',
  }),
  buildGroup('GENDER_LABELS', '성별', '성별 코드', 22, {
    M: '남성', F: '여성',
  }),
  buildGroup('DEGREE_LABELS', '학력', '학력 코드', 23, {
    high_school: '고등학교', associate: '전문학사', bachelor: '학사', master: '석사', doctorate: '박사',
  }),
];

const defaultGroups: CodeGroup[] = seedDefinitions.map((d) => d.group);
const defaultItems: CodeItem[] = seedDefinitions.flatMap((d) => d.items);

// ---- Store ----

interface CodeState {
  codeGroups: CodeGroup[];
  codeItems: CodeItem[];
}

interface CodeActions {
  // Group CRUD
  addCodeGroup: (group: Omit<CodeGroup, 'id' | 'created_at' | 'updated_at' | 'is_system'>) => void;
  updateCodeGroup: (id: string, data: Partial<Pick<CodeGroup, 'group_name' | 'description' | 'sort_order' | 'is_active'>>) => void;
  deleteCodeGroup: (id: string) => boolean;
  toggleCodeGroupActive: (id: string) => void;

  // Item CRUD
  addCodeItem: (item: Omit<CodeItem, 'id' | 'created_at' | 'updated_at' | 'is_system'>) => void;
  updateCodeItem: (id: string, data: Partial<Pick<CodeItem, 'label' | 'sort_order' | 'is_active'>>) => void;
  deleteCodeItem: (id: string) => boolean;
  toggleCodeItemActive: (id: string) => void;

  // Selectors
  getItemsByGroup: (groupId: string) => CodeItem[];
  getActiveItemsByGroupCode: (groupCode: string) => CodeItem[];
}

export type CodeStore = CodeState & CodeActions;

export const useCodeStore = create<CodeStore>()(
  persist(
    (set, get) => ({
      codeGroups: defaultGroups,
      codeItems: defaultItems,

      // ---- Group Actions ----

      addCodeGroup: (group) => {
        const now = new Date().toISOString();
        const id = `cg-${group.group_code.toLowerCase()}-${Date.now()}`;
        set((s) => ({
          codeGroups: [
            ...s.codeGroups,
            { ...group, id, is_system: false, created_at: now, updated_at: now },
          ],
        }));
      },

      updateCodeGroup: (id, data) =>
        set((s) => ({
          codeGroups: s.codeGroups.map((g) =>
            g.id === id ? { ...g, ...data, updated_at: new Date().toISOString() } : g
          ),
        })),

      deleteCodeGroup: (id) => {
        const group = get().codeGroups.find((g) => g.id === id);
        if (!group || group.is_system) return false;
        set((s) => ({
          codeGroups: s.codeGroups.filter((g) => g.id !== id),
          codeItems: s.codeItems.filter((i) => i.group_id !== id),
        }));
        return true;
      },

      toggleCodeGroupActive: (id) =>
        set((s) => ({
          codeGroups: s.codeGroups.map((g) =>
            g.id === id ? { ...g, is_active: !g.is_active, updated_at: new Date().toISOString() } : g
          ),
        })),

      // ---- Item Actions ----

      addCodeItem: (item) => {
        const now = new Date().toISOString();
        const id = `ci-${item.group_id.replace('cg-', '')}-${item.code}-${Date.now()}`;
        set((s) => ({
          codeItems: [
            ...s.codeItems,
            { ...item, id, is_system: false, created_at: now, updated_at: now },
          ],
        }));
      },

      updateCodeItem: (id, data) =>
        set((s) => ({
          codeItems: s.codeItems.map((i) =>
            i.id === id ? { ...i, ...data, updated_at: new Date().toISOString() } : i
          ),
        })),

      deleteCodeItem: (id) => {
        const item = get().codeItems.find((i) => i.id === id);
        if (!item || item.is_system) return false;
        set((s) => ({
          codeItems: s.codeItems.filter((i) => i.id !== id),
        }));
        return true;
      },

      toggleCodeItemActive: (id) =>
        set((s) => ({
          codeItems: s.codeItems.map((i) =>
            i.id === id ? { ...i, is_active: !i.is_active, updated_at: new Date().toISOString() } : i
          ),
        })),

      // ---- Selectors ----

      getItemsByGroup: (groupId) =>
        get().codeItems
          .filter((i) => i.group_id === groupId)
          .sort((a, b) => a.sort_order - b.sort_order),

      getActiveItemsByGroupCode: (groupCode) => {
        const group = get().codeGroups.find((g) => g.group_code === groupCode && g.is_active);
        if (!group) return [];
        return get().codeItems
          .filter((i) => i.group_id === group.id && i.is_active)
          .sort((a, b) => a.sort_order - b.sort_order);
      },
    }),
    {
      name: 'hrms-codes',
    }
  )
);
