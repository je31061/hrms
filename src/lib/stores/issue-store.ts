'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HrIssue, IssueType, IssuePriority, IssueStatus } from '@/types';

// ---------------------------------------------------------------------------
// Seed data — 8 HR issues
// ---------------------------------------------------------------------------

const seedIssues: HrIssue[] = [
  {
    id: 'issue-001',
    title: '야간근무 수당 미지급 건',
    description: '2월 야간근무에 대한 수당이 급여에 반영되지 않았습니다. 해당 기간 야간근무 기록은 근태관리 시스템에 정상적으로 등록되어 있으나 급여 명세서에는 야간수당 항목이 0원으로 표시되어 있습니다.',
    type: 'payroll_dispute',
    priority: 'high',
    status: 'in_progress',
    reporter_id: 'e022',
    assignee_id: 'e010',
    created_at: '2026-02-15',
    updated_at: '2026-02-18',
    resolved_at: null,
  },
  {
    id: 'issue-002',
    title: '생산동 3층 안전난간 파손',
    description: '생산동 3층 동쪽 통로의 안전난간이 파손되어 있어 추락 위험이 있습니다. 즉시 보수가 필요합니다. 임시 차단 조치는 완료했으나 항구적 수리가 필요합니다.',
    type: 'safety',
    priority: 'critical',
    status: 'open',
    reporter_id: 'e080',
    assignee_id: null,
    created_at: '2026-03-01',
    updated_at: '2026-03-01',
    resolved_at: null,
  },
  {
    id: 'issue-003',
    title: '부서 내 직원 간 갈등 조정 요청',
    description: '같은 팀 내 두 직원 사이에 업무 분장과 관련된 지속적인 갈등이 있어 중재를 요청합니다. 상호 간 커뮤니케이션이 원활하지 않아 팀 전체의 업무 효율에 영향을 주고 있습니다.',
    type: 'grievance',
    priority: 'medium',
    status: 'under_review',
    reporter_id: 'e026',
    assignee_id: 'e010',
    created_at: '2026-02-20',
    updated_at: '2026-02-25',
    resolved_at: null,
  },
  {
    id: 'issue-004',
    title: '개인정보 관리 지침 미흡',
    description: '인사 서류 보관함의 잠금장치가 고장나 있으며 일부 직원의 개인정보가 포함된 서류가 방치되어 있습니다. 개인정보보호법 위반 소지가 있어 시정이 필요합니다.',
    type: 'policy_violation',
    priority: 'high',
    status: 'resolved',
    reporter_id: 'e030',
    assignee_id: 'e004',
    created_at: '2026-01-10',
    updated_at: '2026-01-20',
    resolved_at: '2026-01-20',
  },
  {
    id: 'issue-005',
    title: '1월 급여 계산 오류 정정 요청',
    description: '1월 급여에서 초과근무 수당이 실제 근무 시간보다 적게 계산되었습니다. 근태 기록 상 25시간 초과근무를 했으나 급여 명세서에는 15시간으로 반영되어 있습니다.',
    type: 'payroll_dispute',
    priority: 'medium',
    status: 'closed',
    reporter_id: 'e045',
    assignee_id: 'e010',
    created_at: '2026-02-05',
    updated_at: '2026-02-12',
    resolved_at: '2026-02-12',
  },
  {
    id: 'issue-006',
    title: '작업장 소음 기준 초과 신고',
    description: '생산 2라인 구역의 소음 수준이 법적 기준치를 초과하는 것으로 측정되었습니다. 작업자 청력 보호를 위한 방음 시설 설치 또는 방음 장비 지급이 필요합니다.',
    type: 'safety',
    priority: 'high',
    status: 'in_progress',
    reporter_id: 'e087',
    assignee_id: 'e030',
    created_at: '2026-02-28',
    updated_at: '2026-03-02',
    resolved_at: null,
  },
  {
    id: 'issue-007',
    title: '의무 교육 미이수자 다수 발생',
    description: '성희롱 예방 교육 및 산업안전 교육 의무 이수 기한이 지났으나 미이수 직원이 15명 이상 확인됩니다. 법적 의무 교육 미이수 시 과태료 부과 대상입니다.',
    type: 'policy_violation',
    priority: 'medium',
    status: 'open',
    reporter_id: 'e010',
    assignee_id: null,
    created_at: '2026-03-05',
    updated_at: '2026-03-05',
    resolved_at: null,
  },
  {
    id: 'issue-008',
    title: '주차장 내 차량 접촉사고 보고',
    description: '사내 주차장에서 직원 차량 간 접촉사고가 발생했습니다. CCTV 확인 결과 양측 모두 직원 차량이며, 사내 주차장 관리 규정에 따른 처리가 필요합니다.',
    type: 'other',
    priority: 'low',
    status: 'resolved',
    reporter_id: 'e058',
    assignee_id: 'e004',
    created_at: '2026-02-10',
    updated_at: '2026-02-15',
    resolved_at: '2026-02-15',
  },
];

// ---------------------------------------------------------------------------
// Store types
// ---------------------------------------------------------------------------

interface IssueState {
  issues: HrIssue[];
}

interface IssueActions {
  addIssue: (issue: HrIssue) => void;
  updateIssue: (id: string, data: Partial<HrIssue>) => void;
  deleteIssue: (id: string) => void;
}

interface IssueGetters {
  getIssueById: (id: string) => HrIssue | undefined;
  getAllIssues: () => HrIssue[];
}

export type IssueStore = IssueState & IssueActions & IssueGetters;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useIssueStore = create<IssueStore>()(
  persist(
    (set, get) => ({
      issues: seedIssues,

      addIssue: (issue) =>
        set((s) => ({ issues: [...s.issues, issue] })),

      updateIssue: (id, data) =>
        set((s) => ({
          issues: s.issues.map((issue) =>
            issue.id === id ? { ...issue, ...data, updated_at: new Date().toISOString().split('T')[0] } : issue
          ),
        })),

      deleteIssue: (id) =>
        set((s) => ({ issues: s.issues.filter((issue) => issue.id !== id) })),

      getIssueById: (id) => get().issues.find((issue) => issue.id === id),

      getAllIssues: () =>
        [...get().issues].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    }),
    { name: 'hrms-issues', version: 1, migrate: () => ({}) },
  ),
);
