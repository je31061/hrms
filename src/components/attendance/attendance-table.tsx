'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ATTENDANCE_STATUS } from '@/lib/constants/codes';
import type { Attendance } from '@/types';

interface AttendanceTableProps {
  records: Attendance[];
}

export function AttendanceTable({ records }: AttendanceTableProps) {
  const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'normal': return 'default';
      case 'late': return 'destructive';
      case 'early_leave': return 'secondary';
      case 'absent': return 'destructive';
      case 'holiday': return 'outline';
      case 'leave': return 'secondary';
      default: return 'outline';
    }
  };

  const formatTime = (ts: string | null) => {
    if (!ts) return '-';
    return new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>날짜</TableHead>
            <TableHead>이름</TableHead>
            <TableHead>출근</TableHead>
            <TableHead>퇴근</TableHead>
            <TableHead>근무시간</TableHead>
            <TableHead>연장근무</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>비고</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                근태 기록이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.date}</TableCell>
                <TableCell>{record.employee?.name ?? '-'}</TableCell>
                <TableCell>{formatTime(record.clock_in)}</TableCell>
                <TableCell>{formatTime(record.clock_out)}</TableCell>
                <TableCell>{record.work_hours ? `${record.work_hours}시간` : '-'}</TableCell>
                <TableCell>{record.overtime_hours > 0 ? `${record.overtime_hours}시간` : '-'}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(record.status)} className="text-xs">
                    {ATTENDANCE_STATUS[record.status as keyof typeof ATTENDANCE_STATUS] ?? record.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{record.note ?? ''}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
