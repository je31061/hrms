import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { APPROVAL_STATUS } from '@/lib/constants/codes';
import Link from 'next/link';

const pendingApprovals = [
  { id: '1', title: '연차 신청 - 김철수', type: 'leave', requester: '김철수', department: '개발1팀', status: 'pending', createdAt: '2026-02-18' },
  { id: '2', title: '인사발령 - 이과장 승진', type: 'appointment', requester: '인사팀', department: '인사팀', status: 'in_progress', createdAt: '2026-02-15' },
];

const completedApprovals = [
  { id: '3', title: '연차 신청 - 박대리', type: 'leave', requester: '박대리', department: '인사팀', status: 'approved', createdAt: '2026-02-10' },
  { id: '4', title: '경비 청구 - 최지은', type: 'expense', requester: '최지은', department: '재무팀', status: 'approved', createdAt: '2026-02-08' },
  { id: '5', title: '출장 신청 - 정우진', type: 'general', requester: '정우진', department: '개발1팀', status: 'rejected', createdAt: '2026-02-05' },
];

const statusVariant = (s: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (s) {
    case 'approved': return 'default';
    case 'pending': return 'secondary';
    case 'in_progress': return 'outline';
    case 'rejected': return 'destructive';
    default: return 'outline';
  }
};

const typeLabels: Record<string, string> = {
  leave: '휴가',
  appointment: '인사발령',
  expense: '경비',
  general: '일반',
};

function ApprovalTable({ items }: { items: typeof pendingApprovals }) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>제목</TableHead>
            <TableHead>유형</TableHead>
            <TableHead>신청자</TableHead>
            <TableHead>부서</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>신청일</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                결재 건이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Link href={`/approval/${item.id}`} className="font-medium hover:underline">
                    {item.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{typeLabels[item.type] ?? item.type}</Badge>
                </TableCell>
                <TableCell>{item.requester}</TableCell>
                <TableCell>{item.department}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(item.status)} className="text-xs">
                    {APPROVAL_STATUS[item.status as keyof typeof APPROVAL_STATUS] ?? item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.createdAt}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ApprovalPage() {
  return (
    <div>
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-6">전자결재</h1>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">결재 대기 ({pendingApprovals.length})</TabsTrigger>
          <TabsTrigger value="completed">처리 완료 ({completedApprovals.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <ApprovalTable items={pendingApprovals} />
        </TabsContent>
        <TabsContent value="completed">
          <ApprovalTable items={completedApprovals} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
