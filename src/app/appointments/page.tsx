import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { APPOINTMENT_TYPES } from '@/lib/constants/codes';

const appointments = [
  { id: '1', employee: '이과장', type: 'promotion', effectiveDate: '2026-02-17', prevRank: '과장', newRank: '차장', prevDept: '개발2팀', newDept: '개발2팀', reason: '정기 승진' },
  { id: '2', employee: '박대리', type: 'transfer', effectiveDate: '2026-02-01', prevRank: '대리', newRank: '대리', prevDept: '인사팀', newDept: '개발1팀', reason: '조직 개편' },
  { id: '3', employee: '김신입', type: 'hire', effectiveDate: '2026-02-19', prevRank: null, newRank: '사원', prevDept: null, newDept: '개발1팀', reason: '신규 입사' },
  { id: '4', employee: '한부장', type: 'title_change', effectiveDate: '2026-01-15', prevRank: '부장', newRank: '부장', prevDept: 'QA팀', newDept: 'QA팀', reason: '팀장 임명', prevTitle: '팀원', newTitle: '팀장' },
  { id: '5', employee: '송차장', type: 'resignation', effectiveDate: '2026-01-31', prevRank: '차장', newRank: null, prevDept: '영업팀', newDept: null, reason: '일신상의 사유' },
];

const typeVariant = (type: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (type) {
    case 'promotion': return 'default';
    case 'hire': return 'default';
    case 'transfer': return 'secondary';
    case 'title_change': return 'outline';
    case 'resignation': return 'destructive';
    default: return 'outline';
  }
};

export default function AppointmentsPage() {
  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">인사발령</h1>
        <Link href="/appointments/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            발령 등록
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">발령 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>발령일</TableHead>
                  <TableHead>성명</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>변경 전</TableHead>
                  <TableHead>변경 후</TableHead>
                  <TableHead>사유</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.effectiveDate}</TableCell>
                    <TableCell className="font-medium">{a.employee}</TableCell>
                    <TableCell>
                      <Badge variant={typeVariant(a.type)} className="text-xs">
                        {APPOINTMENT_TYPES[a.type as keyof typeof APPOINTMENT_TYPES] ?? a.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {a.prevDept && a.prevRank ? `${a.prevDept} / ${a.prevRank}` : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {a.newDept && a.newRank ? `${a.newDept} / ${a.newRank}` : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
