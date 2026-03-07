'use client';

import { useMemo } from 'react';
import { Users, Clock, CalendarDays, UserRoundPlus } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { HeadcountChart } from '@/components/dashboard/headcount-chart';
import { HireResignChart } from '@/components/dashboard/hire-resign-chart';
import { RecentEvents } from '@/components/dashboard/recent-events';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import { useAttendanceStore } from '@/lib/stores/attendance-store';
import { useLeaveStore } from '@/lib/stores/leave-store';
import { useAppointmentStore } from '@/lib/stores/appointment-store';

export default function DashboardPage() {
  const employees = useEmployeeStore((s) => s.employees);
  const departments = useEmployeeStore((s) => s.departments);
  const positionRanks = useEmployeeStore((s) => s.positionRanks);
  const attendanceRecords = useAttendanceStore((s) => s.records);
  const leaveRequests = useLeaveStore((s) => s.leaveRequests);
  const appointments = useAppointmentStore((s) => s.appointments);

  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();

  const activeEmployees = useMemo(
    () => employees.filter((e) => e.status === 'active'),
    [employees],
  );

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

  // Hire / resign stats for current year
  const { hiresThisYear, resignsThisYear, turnoverRate } = useMemo(() => {
    const yearStr = String(currentYear);
    const hires = employees.filter(
      (e) => e.hire_date.startsWith(yearStr),
    ).length;
    const resigns = employees.filter(
      (e) => e.resignation_date && e.resignation_date.startsWith(yearStr),
    ).length;
    const avgHeadcount = activeEmployees.length + resigns / 2;
    const rate = avgHeadcount > 0 ? Math.round((resigns / avgHeadcount) * 1000) / 10 : 0;
    return { hiresThisYear: hires, resignsThisYear: resigns, turnoverRate: rate };
  }, [employees, activeEmployees, currentYear]);

  const statsData = [
    { title: '전체 임직원', value: String(activeEmployees.length), icon: Users, color: 'blue' as const, description: `정규직 ${regularCount} / 비정규 ${contractCount}` },
    { title: '금일 출근', value: String(todayAttendance.length), icon: Clock, color: 'green' as const, description: `출근율 ${attendanceRate}%` },
    { title: '휴가 중', value: String(onLeaveToday), icon: CalendarDays, color: 'amber' as const, description: '승인된 휴가 기준' },
    { title: '금년 입퇴사', value: `+${hiresThisYear} / -${resignsThisYear}`, icon: UserRoundPlus, color: 'purple' as const, description: `이직률 ${turnoverRate}%` },
  ];

  // Department headcount — level 2 departments
  const headcountData = useMemo(() => {
    const level2Depts = departments.filter((d) => d.level === 2);
    return level2Depts.map((dept) => {
      const count = activeEmployees.filter((e) => e.department_id === dept.id).length;
      return { department: dept.name, count };
    }).filter((d) => d.count > 0);
  }, [departments, activeEmployees]);

  // Hire-resign trend (last 12 months)
  const hireResignData = useMemo(() => {
    const now = new Date();
    const months: { month: string; hires: number; resignations: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${d.getMonth() + 1}월`;
      const hires = employees.filter((e) => e.hire_date.startsWith(ym)).length;
      const resignations = employees.filter((e) => e.resignation_date?.startsWith(ym)).length;
      months.push({ month: label, hires, resignations });
    }
    return months;
  }, [employees]);

  // Recent events — appointments + leave requests, most recent 5
  const recentEvents = useMemo(() => {
    const events: { id: string; type: 'hire' | 'appointment' | 'leave' | 'birthday'; title: string; date: string; description: string }[] = [];

    // From appointments (sorted desc, take recent)
    const sortedAppts = [...appointments].sort((a, b) => b.effective_date.localeCompare(a.effective_date));
    for (const a of sortedAppts.slice(0, 15)) {
      const emp = activeEmployees.find((e) => e.id === a.employee_id) ??
        employees.find((e) => e.id === a.employee_id);
      const empName = emp?.name ?? a.employee_id;
      const empDeptName = emp?.department_id ? departments.find((d) => d.id === emp.department_id)?.name ?? '' : '';
      if (a.type === 'hire') {
        events.push({ id: a.id, type: 'hire', title: `${empName} 입사`, date: a.effective_date, description: empDeptName });
      } else if (a.type === 'promotion') {
        const newRank = positionRanks.find((r) => r.id === a.new_position_rank_id)?.name ?? '';
        events.push({ id: a.id, type: 'appointment', title: `${empName} → ${newRank} 승진`, date: a.effective_date, description: empDeptName });
      } else if (a.type === 'transfer') {
        const newDept = departments.find((d) => d.id === a.new_department_id)?.name ?? '';
        events.push({ id: a.id, type: 'appointment', title: `${empName} ${newDept} 전보`, date: a.effective_date, description: '' });
      } else if (a.type === 'resignation') {
        events.push({ id: a.id, type: 'appointment', title: `${empName} 퇴사`, date: a.effective_date, description: a.reason ?? '' });
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
  }, [appointments, leaveRequests, activeEmployees, employees, departments, positionRanks]);

  return (
    <div>
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {statsData.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <HeadcountChart data={headcountData} />
        <HireResignChart data={hireResignData} />
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <RecentEvents events={recentEvents} />
      </div>
    </div>
  );
}
