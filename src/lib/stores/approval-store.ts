'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Approval, ApprovalLine, ApprovalStatus, ApprovalLineStatus, ApprovalLineType } from '@/types';

// ---------------------------------------------------------------------------
// Seed data — 5 approvals + 10 lines
// ---------------------------------------------------------------------------

const seedApprovals: Approval[] = [
  {
    id: 'apr-1', title: '연차 신청 - 권대리', type: 'leave', requester_id: 'e022',
    content: { leaveType: '연차', startDate: '2026-03-05', endDate: '2026-03-05', days: 1, reason: '개인 사유' },
    status: 'pending', created_at: '2026-02-25', completed_at: null,
  },
  {
    id: 'apr-2', title: '인사발령 - 안과장 승진', type: 'appointment', requester_id: 'e010',
    content: { appointmentType: 'promotion', targetEmployee: 'e026', reason: '정기 승진' },
    status: 'in_progress', created_at: '2026-02-15', completed_at: null,
  },
  {
    id: 'apr-3', title: '연차 신청 - 임대리', type: 'leave', requester_id: 'e011',
    content: { leaveType: '연차', startDate: '2026-02-02', endDate: '2026-02-03', days: 2, reason: '개인 사유' },
    status: 'approved', created_at: '2026-01-28', completed_at: '2026-01-30',
  },
  {
    id: 'apr-4', title: '경비 청구 - 장팀장', type: 'expense', requester_id: 'e013',
    content: { amount: 150000, description: '고객사 미팅 식대' },
    status: 'approved', created_at: '2026-02-08', completed_at: '2026-02-10',
  },
  {
    id: 'apr-5', title: '출장 신청 - 홍팀장', type: 'general', requester_id: 'e035',
    content: { destination: '부산', period: '2026-02-20 ~ 2026-02-21', reason: '고객사 미팅' },
    status: 'rejected', created_at: '2026-02-05', completed_at: '2026-02-07',
  },
];

const seedApprovalLines: ApprovalLine[] = [
  // apr-1: pending (waiting for step 1)
  { id: 'apl-1', approval_id: 'apr-1', approver_id: 'e020', step: 1, status: 'pending', comment: null, acted_at: null, line_type: 'approval' },
  { id: 'apl-2', approval_id: 'apr-1', approver_id: 'e004', step: 2, status: 'pending', comment: null, acted_at: null, line_type: 'approval' },

  // apr-2: in_progress (step 1 approved, step 2 pending)
  { id: 'apl-3', approval_id: 'apr-2', approver_id: 'e010', step: 1, status: 'approved', comment: '승인합니다.', acted_at: '2026-02-16T10:00:00', line_type: 'agreement' },
  { id: 'apl-4', approval_id: 'apr-2', approver_id: 'e004', step: 2, status: 'pending', comment: null, acted_at: null, line_type: 'approval' },

  // apr-3: approved (both steps approved)
  { id: 'apl-5', approval_id: 'apr-3', approver_id: 'e010', step: 1, status: 'approved', comment: '확인했습니다.', acted_at: '2026-01-29T09:00:00', line_type: 'agreement' },
  { id: 'apl-6', approval_id: 'apr-3', approver_id: 'e002', step: 2, status: 'approved', comment: '승인합니다.', acted_at: '2026-01-30T14:00:00', line_type: 'approval' },

  // apr-4: approved
  { id: 'apl-7', approval_id: 'apr-4', approver_id: 'e015', step: 1, status: 'approved', comment: '확인.', acted_at: '2026-02-09T11:00:00', line_type: 'approval' },
  { id: 'apl-8', approval_id: 'apr-4', approver_id: 'e002', step: 2, status: 'approved', comment: '승인.', acted_at: '2026-02-10T09:00:00', line_type: 'approval' },

  // apr-5: rejected (step 1 rejected)
  { id: 'apl-9', approval_id: 'apr-5', approver_id: 'e016', step: 1, status: 'rejected', comment: '해당 기간 출장 불가합니다.', acted_at: '2026-02-07T15:00:00', line_type: 'approval' },
  { id: 'apl-10', approval_id: 'apr-5', approver_id: 'e004', step: 2, status: 'pending', comment: null, acted_at: null, line_type: 'approval' },
];

// ---------------------------------------------------------------------------
// Store types
// ---------------------------------------------------------------------------

interface ApprovalState {
  approvals: Approval[];
  approvalLines: ApprovalLine[];
}

interface ApprovalActions {
  createApproval: (approval: Approval, lines: ApprovalLine[]) => void;
  approveStep: (approvalId: string, approverId: string, comment?: string) => void;
  rejectStep: (approvalId: string, approverId: string, comment?: string) => void;
  cancelApproval: (approvalId: string) => void;
}

interface ApprovalGetters {
  getApprovalById: (id: string) => Approval | undefined;
  getApprovalsByStatus: (status: ApprovalStatus) => Approval[];
  getPendingForApprover: (approverId: string) => Approval[];
  getLinesByApproval: (approvalId: string) => ApprovalLine[];
}

export type ApprovalStore = ApprovalState & ApprovalActions & ApprovalGetters;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useApprovalStore = create<ApprovalStore>()(
  persist(
    (set, get) => ({
      approvals: seedApprovals,
      approvalLines: seedApprovalLines,

      createApproval: (approval, lines) =>
        set((s) => ({
          approvals: [...s.approvals, approval],
          approvalLines: [...s.approvalLines, ...lines],
        })),

      approveStep: (approvalId, approverId, comment) => {
        set((s) => {
          const lines = s.approvalLines.filter((l) => l.approval_id === approvalId);

          // Find the current pending line for this approver (결재 or 합의, not 참조)
          const currentLine = lines.find(
            (l) => l.approver_id === approverId && l.status === 'pending' && l.line_type !== 'cc',
          );
          if (!currentLine) return s;

          const now = new Date().toISOString();
          const newLines = s.approvalLines.map((l) =>
            l.id === currentLine.id
              ? { ...l, status: 'approved' as ApprovalLineStatus, comment: comment ?? null, acted_at: now }
              : l,
          );

          // 결재 완료 판정:
          // 1) 모든 합의(agreement) 라인이 승인되어야 함
          // 2) 모든 결재(approval) 라인이 승인되어야 함
          // 3) 참조(cc)는 판정에서 제외
          const updatedLines = newLines.filter((l) => l.approval_id === approvalId);
          const agreementLines = updatedLines.filter((l) => l.line_type === 'agreement');
          const approvalLines = updatedLines.filter((l) => l.line_type === 'approval');

          const allAgreementsApproved = agreementLines.every((l) => l.status === 'approved');
          const allApprovalsApproved = approvalLines.every((l) => l.status === 'approved');
          const allDone = allAgreementsApproved && allApprovalsApproved;

          // 참조자는 최종결재 완료 시 자동으로 'approved'(열람 가능) 처리
          let finalLines = newLines;
          if (allDone) {
            finalLines = finalLines.map((l) =>
              l.approval_id === approvalId && l.line_type === 'cc' && l.status === 'pending'
                ? { ...l, status: 'approved' as ApprovalLineStatus, acted_at: now, comment: '참조 열람' }
                : l,
            );
          }

          const newApprovals = s.approvals.map((a) => {
            if (a.id !== approvalId) return a;
            if (allDone) {
              return { ...a, status: 'approved' as ApprovalStatus, completed_at: now };
            }
            return { ...a, status: 'in_progress' as ApprovalStatus };
          });

          return { approvals: newApprovals, approvalLines: finalLines };
        });
      },

      rejectStep: (approvalId, approverId, comment) => {
        set((s) => {
          const now = new Date().toISOString();
          const currentLine = s.approvalLines.find(
            (l) => l.approval_id === approvalId && l.approver_id === approverId && l.status === 'pending' && l.line_type !== 'cc',
          );
          if (!currentLine) return s;

          const newLines = s.approvalLines.map((l) =>
            l.id === currentLine.id
              ? { ...l, status: 'rejected' as ApprovalLineStatus, comment: comment ?? null, acted_at: now }
              : l,
          );

          const newApprovals = s.approvals.map((a) =>
            a.id === approvalId
              ? { ...a, status: 'rejected' as ApprovalStatus, completed_at: now }
              : a,
          );

          return { approvals: newApprovals, approvalLines: newLines };
        });
      },

      cancelApproval: (approvalId) =>
        set((s) => ({
          approvals: s.approvals.map((a) =>
            a.id === approvalId
              ? { ...a, status: 'cancelled' as ApprovalStatus, completed_at: new Date().toISOString() }
              : a,
          ),
        })),

      getApprovalById: (id) => get().approvals.find((a) => a.id === id),

      getApprovalsByStatus: (status) =>
        get().approvals.filter((a) => a.status === status),

      getPendingForApprover: (approverId) => {
        const s = get();
        // 결재/합의 대기건만 (참조는 제외)
        const pendingLineApprovalIds = s.approvalLines
          .filter((l) => l.approver_id === approverId && l.status === 'pending' && l.line_type !== 'cc')
          .map((l) => l.approval_id);
        return s.approvals.filter((a) => pendingLineApprovalIds.includes(a.id) && (a.status === 'pending' || a.status === 'in_progress'));
      },

      getLinesByApproval: (approvalId) =>
        get()
          .approvalLines.filter((l) => l.approval_id === approvalId)
          .sort((a, b) => a.step - b.step),
    }),
    { name: 'hrms-approvals' },
  ),
);
