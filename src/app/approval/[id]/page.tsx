'use client';

import { use, useMemo } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ApprovalFlow } from '@/components/approval/approval-flow';
import { ApprovalActionForm } from '@/components/approval/approval-form';
import { Separator } from '@/components/ui/separator';
import { useCodeMap, CODE } from '@/lib/hooks/use-code';
import { useApprovalStore } from '@/lib/stores/approval-store';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import { useAuthStore } from '@/lib/stores/auth-store';

export default function ApprovalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const APPROVAL_STATUS = useCodeMap(CODE.APPROVAL_STATUS);
  const { id } = use(params);

  const approvals = useApprovalStore((s) => s.approvals);
  const approvalLines = useApprovalStore((s) => s.approvalLines);
  const approveStep = useApprovalStore((s) => s.approveStep);
  const rejectStep = useApprovalStore((s) => s.rejectStep);
  const employees = useEmployeeStore((s) => s.employees);
  const departments = useEmployeeStore((s) => s.departments);
  const positionRanks = useEmployeeStore((s) => s.positionRanks);
  const session = useAuthStore((s) => s.session);

  const approval = approvals.find((a) => a.id === id);
  const lines = approvalLines.filter((l) => l.approval_id === id).sort((a, b) => a.step - b.step);

  const findEmployee = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return undefined;
    return {
      ...emp,
      department: departments.find((d) => d.id === emp.department_id),
      position_rank: positionRanks.find((r) => r.id === emp.position_rank_id),
    };
  };

  const hydratedLines = useMemo(() => {
    return lines.map((line) => {
      const approver = findEmployee(line.approver_id);
      return {
        ...line,
        approverName: approver?.name ?? line.approver_id,
        approverRank: approver?.position_rank?.name ?? '-',
      };
    });
  }, [lines, employees, departments, positionRanks]);

  if (!approval) {
    return (
      <div>
        <Breadcrumb />
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">결재 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const requester = findEmployee(approval.requester_id);
  const statusLabel = APPROVAL_STATUS[approval.status] ?? approval.status;

  const typeLabels: Record<string, string> = {
    leave: '휴가', appointment: '인사발령', expense: '경비', general: '일반',
  };

  // Check if current user can act on this approval
  const currentEmployeeId = session?.employee_id;
  const canAct = currentEmployeeId && lines.some(
    (l) => l.approver_id === currentEmployeeId && l.status === 'pending',
  ) && (approval.status === 'pending' || approval.status === 'in_progress');

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">{approval.title}</h1>
        <Badge variant={approval.status === 'approved' ? 'default' : approval.status === 'rejected' ? 'destructive' : 'secondary'}>
          {statusLabel}
        </Badge>
      </div>

      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">결재 라인</CardTitle>
          </CardHeader>
          <CardContent>
            <ApprovalFlow lines={hydratedLines} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">결재 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">신청자:</span> <strong>{requester?.name ?? approval.requester_id}</strong></div>
              <div><span className="text-muted-foreground">부서:</span> <strong>{requester?.department?.name ?? '-'}</strong></div>
              <div><span className="text-muted-foreground">신청일:</span> <strong>{approval.created_at}</strong></div>
              <div><span className="text-muted-foreground">유형:</span> <Badge variant="outline">{typeLabels[approval.type] ?? approval.type}</Badge></div>
            </div>
            {approval.content && (
              <>
                <Separator />
                <div className="space-y-2 text-sm">
                  <h4 className="font-semibold">결재 내용</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(approval.content).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-muted-foreground">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {canAct && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">결재 처리</CardTitle>
            </CardHeader>
            <CardContent>
              <ApprovalActionForm
                approvalId={id}
                onApprove={(comment) => approveStep(id, currentEmployeeId!, comment)}
                onReject={(comment) => rejectStep(id, currentEmployeeId!, comment)}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
