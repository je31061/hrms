'use client';

import { useState, useMemo } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { ClockButton } from '@/components/attendance/clock-button';
import { AttendanceTable } from '@/components/attendance/attendance-table';
import { AttendanceRegisterDialog } from '@/components/attendance/attendance-register-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAttendanceStore } from '@/lib/stores/attendance-store';
import { useEmployeeStore } from '@/lib/stores/employee-store';

export default function AttendancePage() {
  const [registerOpen, setRegisterOpen] = useState(false);
  const records = useAttendanceStore((s) => s.records);
  const addRecord = useAttendanceStore((s) => s.addRecord);
  const employees = useEmployeeStore((s) => s.employees);
  const departments = useEmployeeStore((s) => s.departments);
  const positionRanks = useEmployeeStore((s) => s.positionRanks);
  const positionTitles = useEmployeeStore((s) => s.positionTitles);

  const today = new Date().toISOString().split('T')[0];

  const todayRecords = useMemo(() => {
    return records
      .filter((r) => r.date === today)
      .map((r) => {
        const emp = employees.find((e) => e.id === r.employee_id);
        return {
          ...r,
          employee: emp ? {
            ...emp,
            department: departments.find((d) => d.id === emp.department_id),
            position_rank: positionRanks.find((rk) => rk.id === emp.position_rank_id),
            position_title: positionTitles.find((t) => t.id === emp.position_title_id),
          } : undefined,
        };
      });
  }, [records, today, employees, departments, positionRanks, positionTitles]);

  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    let late = 0;
    let absent = 0;
    for (const r of todayRecords) {
      const t = r.attendance_type ?? 'office';
      byType[t] = (byType[t] ?? 0) + 1;
      if (r.status === 'late') late++;
      if (r.status === 'absent') absent++;
    }
    return {
      office: byType['office'] ?? 0,
      business_trip: byType['business_trip'] ?? 0,
      field_work: byType['field_work'] ?? 0,
      remote: byType['remote'] ?? 0,
      late,
      absent,
      leave: 0,
    };
  }, [todayRecords]);

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">근태관리</h1>
        <div className="flex gap-2">
          <Button onClick={() => setRegisterOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            근태 등록
          </Button>
          <Link href="/attendance/monthly">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              월별 현황
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <ClockButton />

        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">출근</p>
              <p className="text-2xl font-bold">{stats.office}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">출장</p>
              <p className="text-2xl font-bold">{stats.business_trip}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">외근</p>
              <p className="text-2xl font-bold">{stats.field_work}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">재택</p>
              <p className="text-2xl font-bold">{stats.remote}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">지각</p>
              <p className="text-2xl font-bold text-destructive">{stats.late}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">결근</p>
              <p className="text-2xl font-bold text-destructive">{stats.absent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">휴가</p>
              <p className="text-2xl font-bold">{stats.leave}</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">금일 근태 현황</h2>
          <AttendanceTable records={todayRecords} />
        </div>
      </div>

      <AttendanceRegisterDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onRegister={addRecord}
      />
    </div>
  );
}
