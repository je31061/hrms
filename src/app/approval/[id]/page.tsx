'use client';

import { use } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ApprovalFlow } from '@/components/approval/approval-flow';
import { ApprovalActionForm } from '@/components/approval/approval-form';
import { Separator } from '@/components/ui/separator';

const demoApproval = {
  id: '1',
  title: '연차 신청 - 김철수',
  type: 'leave',
  requester: '김철수',
  department: '개발1팀',
  status: 'in_progress',
  createdAt: '2026-02-18',
  content: {
    leaveType: '연차',
    startDate: '2026-02-20',
    endDate: '2026-02-20',
    days: 1,
    reason: '개인 사유',
  },
};

const demoLines = [
  { id: 'l1', approval_id: '1', approver_id: 'a1', step: 1, status: 'approved' as const, comment: '승인합니다.', acted_at: '2026-02-18T14:00:00', approverName: '이팀장', approverRank: '과장' },
  { id: 'l2', approval_id: '1', approver_id: 'a2', step: 2, status: 'pending' as const, comment: null, acted_at: null, approverName: '최본부장', approverRank: '부장' },
];

export default function ApprovalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">{demoApproval.title}</h1>
        <Badge variant="secondary">진행중</Badge>
      </div>

      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">결재 라인</CardTitle>
          </CardHeader>
          <CardContent>
            <ApprovalFlow lines={demoLines} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">결재 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">신청자:</span> <strong>{demoApproval.requester}</strong></div>
              <div><span className="text-muted-foreground">부서:</span> <strong>{demoApproval.department}</strong></div>
              <div><span className="text-muted-foreground">신청일:</span> <strong>{demoApproval.createdAt}</strong></div>
              <div><span className="text-muted-foreground">유형:</span> <Badge variant="outline">휴가</Badge></div>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold">결재 내용</h4>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">휴가 유형:</span> {demoApproval.content.leaveType}</div>
                <div><span className="text-muted-foreground">기간:</span> {demoApproval.content.startDate} ~ {demoApproval.content.endDate} ({demoApproval.content.days}일)</div>
                <div className="col-span-2"><span className="text-muted-foreground">사유:</span> {demoApproval.content.reason}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">결재 처리</CardTitle>
          </CardHeader>
          <CardContent>
            <ApprovalActionForm approvalId={id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
