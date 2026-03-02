'use client';

import { useMemo } from 'react';
import { Users, Clock, CalendarDays, Briefcase } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { HeadcountChart } from '@/components/dashboard/headcount-chart';
import { RecentEvents } from '@/components/dashboard/recent-events';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import { useAttendanceStore } from '@/lib/stores/attendance-store';
import { useLeaveStore } from '@/lib/stores/leave-store';
import { useAppointmentStore } from '@/lib/stores/appointment-store';

export default function DashboardPage() {
  const activeEmployees = useEmployeeStore((s) => s.getActiveEmployees());
  const departments = useEmployeeStore((s) => s.departments);
  const attendanceRecords = useAttendanceStore((s) => s.records);
  const leaveRequests = useLeaveStore((s) => s.leaveRequests);
  const appointments = useAppointmentStore((s) => s.appointments);

  const today = new Date().toISOString().split('T')[0];

  // Stats
  const regularCount = activeEmployees.filter((e) => e.employment_type === 'regular').length;
  const contractCount = activeEmployees.filter((e) => e.employment_type !== 'regular').length;
  const todayAttendance = attendanceRecords.filter((r) => r.date === today);
  const attendanceRate = activeEmployees.length > 0
    ? Math.round((todayAttendance.length / activeEmployees.length) * 1000) / 10
    : 0;

  // Count employees on approved leave today
  const onLeaveToday = useMemo(() => {
    return leaveRequests.filter((r) =>
      r.status === 'approved' && r.start_date <= today && r.end_date >= today,
    ).length;
  }, [leaveRequests, today]);

  const statsData = [
    { title: '전체 임직원', value: String(activeEmployees.length), icon: Users, description: `정규직 ${regularCount} / 계약직 ${contractCount}` },
    { title: '금일 출근', value: String(todayAttendance.length), icon: Clock, description: `출근율 ${attendanceRate}%` },
    { title: '휴가 중', value: String(onLeaveToday), icon: CalendarDays, description: '승인된 휴가 기준' },
    { title: '진행 중 채용', value: '3', icon: Briefcase, description: '총 지원자 45명' },
  ];

  // Department headcount — level 2 departments
  const headcountData = useMemo(() => {
    const level2Depts = departments.filter((d) => d.level === 2);
    return level2Depts.map((dept) => {
      const count = activeEmployees.filter((e) => e.department_id === dept.id).length;
      return { department: dept.name, count };
    }).filter((d) => d.count > 0);
  }, [departments, activeEmployees]);

  // Recent events — appointments + leave requests, most recent 5
  const recentEvents = useMemo(() => {
    const events: { id: string; type: 'hire' | 'appointment' | 'leave' | 'birthday'; title: string; date: string; description: string }[] = [];

    // From appointments
    for (const a of appointments.slice(0, 10)) {
      const emp = activeEmployees.find((e) => e.id === a.employee_id) ??
        useEmployeeStore.getState().employees.find((e) => e.id === a.employee_id);
      const empName = emp?.name ?? a.employee_id;
      if (a.type === 'hire') {
        events.push({ id: a.id, type: 'hire', title: `${empName} 입사`, date: a.effective_date, description: emp?.department?.name ?? '' });
      } else if (a.type === 'promotion') {
        const newRank = useEmployeeStore.getState().positionRanks.find((r) => r.id === a.new_position_rank_id)?.name ?? '';
        events.push({ id: a.id, type: 'appointment', title: `${empName} → ${newRank} 승진`, date: a.effective_date, description: emp?.department?.name ?? '' });
      } else if (a.type === 'transfer') {
        const newDept = useEmployeeStore.getState().departments.find((d) => d.id === a.new_department_id)?.name ?? '';
        events.push({ id: a.id, type: 'appointment', title: `${empName} ${newDept} 전보`, date: a.effective_date, description: '' });
      }
    }

    // From leave requests (approved, recent)
    for (const lr of leaveRequests.filter((r) => r.status === 'approved').slice(0, 5)) {
      const emp = activeEmployees.find((e) => e.id === lr.employee_id);
      events.push({
        id: lr.id, type: 'leave',
        title: `${emp?.name ?? lr.employee_id} 연차 사용`,
        date: lr.start_date,
        description: lr.start_date === lr.end_date ? lr.start_date : `${lr.start_date} ~ ${lr.end_date}`,
      });
    }

    // Sort desc by date and take 5
    return events.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [appointments, leaveRequests, activeEmployees]);

  return (
    <div>
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {statsData.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <HeadcountChart data={headcountData} />
        <RecentEvents events={recentEvents} />
      </div>
    </div>
  );
}
