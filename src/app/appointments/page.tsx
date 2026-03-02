'use client';

import { useMemo } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { APPOINTMENT_TYPES } from '@/lib/constants/codes';
import { useAppointmentStore } from '@/lib/stores/appointment-store';
import { useEmployeeStore } from '@/lib/stores/employee-store';

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
  const appointments = useAppointmentStore((s) => s.appointments);
  const employees = useEmployeeStore((s) => s.employees);
  const departments = useEmployeeStore((s) => s.departments);
  const positionRanks = useEmployeeStore((s) => s.positionRanks);

  const allAppointments = useMemo(
    () => [...appointments].sort((a, b) => b.effective_date.localeCompare(a.effective_date)),
    [appointments],
  );

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
                {allAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      발령 내역이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : allAppointments.map((a) => {
                  const emp = employees.find((e) => e.id === a.employee_id);
                  const empName = emp?.name ?? a.employee_id;
                  const prevDept = a.prev_department_id ? departments.find((d) => d.id === a.prev_department_id)?.name : null;
                  const prevRank = a.prev_position_rank_id ? positionRanks.find((r) => r.id === a.prev_position_rank_id)?.name : null;
                  const newDept = a.new_department_id ? departments.find((d) => d.id === a.new_department_id)?.name : null;
                  const newRank = a.new_position_rank_id ? positionRanks.find((r) => r.id === a.new_position_rank_id)?.name : null;
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.effective_date}</TableCell>
                      <TableCell className="font-medium">{empName}</TableCell>
                      <TableCell>
                        <Badge variant={typeVariant(a.type)} className="text-xs">
                          {APPOINTMENT_TYPES[a.type as keyof typeof APPOINTMENT_TYPES] ?? a.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {prevDept && prevRank ? `${prevDept} / ${prevRank}` : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {newDept && newRank ? `${newDept} / ${newRank}` : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.reason}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
