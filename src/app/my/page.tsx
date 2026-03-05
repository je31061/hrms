'use client';

import { useMemo } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { useLeaveStore } from '@/lib/stores/leave-store';
import { usePayrollStore } from '@/lib/stores/payroll-store';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import { useAttendanceStore } from '@/lib/stores/attendance-store';
import { useAppointmentStore } from '@/lib/stores/appointment-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  LEAVE_REQUEST_STATUS,
  PAYROLL_STATUS,
  APPOINTMENT_TYPES,
  ATTENDANCE_STATUS,
  TRAINING_STATUS,
} from '@/lib/constants/codes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  User,
  Briefcase,
  CalendarDays,
  Banknote,
  Clock,
  GraduationCap,
  ArrowRight,
  FileText,
  Award,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Hardcoded data (training/evaluation — no store yet)
// ---------------------------------------------------------------------------

const myTrainings = [
  { id: 'tr-1', title: '정보보안 교육', category: '법정교육', startDate: '2026-02-10', endDate: '2026-02-10', status: 'completed', score: 92 },
  { id: 'tr-2', title: 'React/Next.js 심화', category: '직무교육', startDate: '2026-02-17', endDate: '2026-02-21', status: 'in_progress', score: null },
  { id: 'tr-3', title: '신입사원 OJT 교육', category: '직무교육', startDate: '2026-03-02', endDate: '2026-03-06', status: 'planned', score: null },
];

const myEvaluations = [
  { id: 'ev-1', period: '2025년 하반기', grade: 'A', totalScore: 88, evaluator: '문팀장', comment: '업무 수행 능력 우수, 팀 내 협업 적극적', completedAt: '2025-12-28' },
  { id: 'ev-2', period: '2025년 상반기', grade: 'B', totalScore: 78, evaluator: '문팀장', comment: '꾸준한 성장세, 기술 역량 향상 필요', completedAt: '2025-06-30' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtWon = (n: number) => new Intl.NumberFormat('ko-KR').format(n) + '원';

function getYearsMonths(hireDate: string): string {
  const hire = new Date(hireDate);
  const now = new Date();
  let years = now.getFullYear() - hire.getFullYear();
  let months = now.getMonth() - hire.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years === 0) return `${months}개월`;
  if (months === 0) return `${years}년`;
  return `${years}년 ${months}개월`;
}

const appointmentTypeVariant = (type: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (type) {
    case 'promotion':
    case 'hire':
      return 'default';
    case 'transfer':
      return 'secondary';
    case 'title_change':
      return 'outline';
    case 'resignation':
      return 'destructive';
    default:
      return 'outline';
  }
};

const leaveStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'approved':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'rejected':
      return 'destructive';
    case 'cancelled':
      return 'outline';
    default:
      return 'outline';
  }
};

const payrollStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'paid':
      return 'default';
    case 'confirmed':
      return 'secondary';
    case 'draft':
      return 'outline';
    default:
      return 'outline';
  }
};

const attendanceStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'normal':
      return 'default';
    case 'late':
    case 'absent':
      return 'destructive';
    case 'early_leave':
      return 'secondary';
    case 'leave':
      return 'outline';
    default:
      return 'outline';
  }
};

const trainingStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'in_progress':
      return 'secondary';
    case 'planned':
      return 'outline';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const gradeVariant = (grade: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (grade) {
    case 'S':
    case 'A':
      return 'default';
    case 'B':
      return 'secondary';
    case 'C':
      return 'outline';
    case 'D':
      return 'destructive';
    default:
      return 'outline';
  }
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function MyPage() {
  const session = useAuthStore((s) => s.session);
  const MY_ID = session?.employee_id ?? 'e022';

  const employees = useEmployeeStore((s) => s.employees);
  const departments = useEmployeeStore((s) => s.departments);
  const positionRanks = useEmployeeStore((s) => s.positionRanks);
  const positionTitles = useEmployeeStore((s) => s.positionTitles);

  const rawEmp = employees.find((e) => e.id === MY_ID);
  const myEmployee = rawEmp ? {
    ...rawEmp,
    department: departments.find((d) => d.id === rawEmp.department_id),
    position_rank: positionRanks.find((r) => r.id === rawEmp.position_rank_id),
    position_title: positionTitles.find((t) => t.id === rawEmp.position_title_id),
  } : undefined;

  // Leave store
  const leaveTypes = useLeaveStore((s) => s.leaveTypes);
  const leaveBalances = useLeaveStore((s) => s.leaveBalances);
  const leaveRequests = useLeaveStore((s) => s.leaveRequests);

  // Payroll store
  const savedPayrolls = usePayrollStore((s) => s.savedPayrolls);

  // Attendance store
  const attendanceRecords = useAttendanceStore((s) => s.records);

  // Appointment store
  const appointments = useAppointmentStore((s) => s.appointments);

  // Derived data
  const myBalances = useMemo(
    () => leaveBalances.filter((b) => b.employee_id === MY_ID && b.year === 2026),
    [leaveBalances, MY_ID],
  );

  const myRequests = useMemo(
    () =>
      leaveRequests
        .filter((r) => r.employee_id === MY_ID)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [leaveRequests, MY_ID],
  );

  const myPayrolls = useMemo(
    () =>
      savedPayrolls
        .filter((p) => p.employee_id === MY_ID)
        .sort((a, b) => (b.year !== a.year ? b.year - a.year : b.month - a.month)),
    [savedPayrolls, MY_ID],
  );

  const annualBalance = useMemo(
    () => myBalances.find((b) => b.leave_type_id === 'lt-annual'),
    [myBalances],
  );

  const latestPayroll = useMemo(() => (myPayrolls.length > 0 ? myPayrolls[0] : null), [myPayrolls]);

  const activeBalances = useMemo(
    () =>
      myBalances.filter((b) => {
        const lt = leaveTypes.find((t) => t.id === b.leave_type_id);
        return lt?.is_active;
      }),
    [myBalances, leaveTypes],
  );

  const myAppointments = useMemo(
    () => appointments
      .filter((a) => a.employee_id === MY_ID)
      .sort((a, b) => b.effective_date.localeCompare(a.effective_date)),
    [appointments, MY_ID],
  );

  const myAttendance = useMemo(
    () => attendanceRecords
      .filter((r) => r.employee_id === MY_ID)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10),
    [attendanceRecords, MY_ID],
  );

  // Attendance summary
  const attendanceSummary = useMemo(() => {
    const total = myAttendance.length;
    const normal = myAttendance.filter((a) => a.status === 'normal').length;
    const late = myAttendance.filter((a) => a.status === 'late').length;
    const other = myAttendance.filter(
      (a) => a.status === 'early_leave' || a.status === 'absent' || a.status === 'leave',
    ).length;
    return { total, normal, late, other };
  }, [myAttendance]);

  // Fallback if no employee found
  if (!myEmployee) {
    return (
      <div>
        <Breadcrumb />
        <h1 className="text-2xl font-bold mb-6">마이페이지</h1>
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>로그인 후 이용해주세요.</p>
            <Link href="/login">
              <Button className="mt-4">로그인</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const yearsOfService = getYearsMonths(myEmployee.hire_date);
  const baseSalary = myEmployee.base_salary;

  const formatClockTime = (isoStr: string | null) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return isoStr;
    }
  };

  return (
    <div>
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-6">마이페이지</h1>

      {/* ------------------------------------------------------------------ */}
      {/* Profile Card                                                        */}
      {/* ------------------------------------------------------------------ */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Avatar + Name */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(myEmployee.name)}`} alt={myEmployee.name} />
                <AvatarFallback className="text-xl font-bold">
                  {myEmployee.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">
                  {myEmployee.name}{' '}
                  <span className="text-base font-normal text-muted-foreground">
                    {myEmployee.position_rank?.name ?? ''}
                  </span>
                </h2>
                <p className="text-sm text-muted-foreground">{myEmployee.department?.name ?? ''}</p>
              </div>
            </div>

            {/* Right: Quick Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-accent-blue-subtle text-accent-blue">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">근속</p>
                  <p className="text-sm font-semibold">{yearsOfService}</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-10 hidden md:block" />
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-accent-green-subtle text-accent-green">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">연차 잔여</p>
                  <p className="text-sm font-semibold">
                    {annualBalance
                      ? `${annualBalance.remaining_days} / ${annualBalance.total_days}일`
                      : '-'}
                  </p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-10 hidden md:block" />
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-accent-amber-subtle text-accent-amber">
                  <Banknote className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">이번달 급여</p>
                  <p className="text-sm font-semibold">
                    {latestPayroll ? fmtWon(latestPayroll.net_pay) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Tabs                                                                */}
      {/* ------------------------------------------------------------------ */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="basic" className="gap-1">
            <User className="h-3.5 w-3.5" />
            기본정보
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            인사발령
          </TabsTrigger>
          <TabsTrigger value="leave" className="gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            연차/휴가
          </TabsTrigger>
          <TabsTrigger value="payroll" className="gap-1">
            <Banknote className="h-3.5 w-3.5" />
            급여
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-1">
            <Clock className="h-3.5 w-3.5" />
            근태
          </TabsTrigger>
          <TabsTrigger value="training" className="gap-1">
            <GraduationCap className="h-3.5 w-3.5" />
            교육/평가
          </TabsTrigger>
        </TabsList>

        {/* ============================================================== */}
        {/* Tab 1: 기본정보                                                 */}
        {/* ============================================================== */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">기본 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: '사원번호', value: myEmployee.employee_number },
                  { label: '이름', value: myEmployee.name },
                  { label: '부서', value: myEmployee.department?.name ?? '-' },
                  { label: '직급', value: myEmployee.position_rank?.name ?? '-' },
                  { label: '입사일', value: myEmployee.hire_date },
                  { label: '근속연수', value: yearsOfService },
                  { label: '고용형태', value: myEmployee.employment_type === 'regular' ? '정규직' : '계약직' },
                  { label: '이메일', value: myEmployee.email },
                  { label: '연락처', value: myEmployee.phone ?? '-' },
                  { label: '은행', value: `${myEmployee.bank_name ?? '-'} ${myEmployee.bank_account ?? ''}` },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 증명서 발급 */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-accent-purple-subtle text-accent-purple">
                  <Award className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">증명서 발급</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Link href={`/employees/${MY_ID}/certificates/employment`}>
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    재직증명서
                  </Button>
                </Link>
                <Link href={`/employees/${MY_ID}/certificates/career`}>
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    경력증명서
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* Tab 2: 인사발령 내역                                            */}
        {/* ============================================================== */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">인사발령 내역</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>발령일</TableHead>
                      <TableHead>유형</TableHead>
                      <TableHead>변경 전</TableHead>
                      <TableHead>변경 후</TableHead>
                      <TableHead>사유</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myAppointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">인사발령 내역이 없습니다.</TableCell>
                      </TableRow>
                    ) : myAppointments.map((a) => {
                      const prevDept = a.prev_department_id ? departments.find((d) => d.id === a.prev_department_id)?.name : null;
                      const prevRank = a.prev_position_rank_id ? positionRanks.find((r) => r.id === a.prev_position_rank_id)?.name : null;
                      const newDept = a.new_department_id ? departments.find((d) => d.id === a.new_department_id)?.name : null;
                      const newRank = a.new_position_rank_id ? positionRanks.find((r) => r.id === a.new_position_rank_id)?.name : null;
                      return (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.effective_date}</TableCell>
                          <TableCell>
                            <Badge variant={appointmentTypeVariant(a.type)} className="text-xs">
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
        </TabsContent>

        {/* ============================================================== */}
        {/* Tab 3: 연차/휴가                                                */}
        {/* ============================================================== */}
        <TabsContent value="leave">
          {/* Balance cards */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-6">
            {activeBalances.map((b, idx) => {
              const lt = leaveTypes.find((t) => t.id === b.leave_type_id);
              const rate = b.total_days > 0 ? Math.round((b.used_days / b.total_days) * 100) : 0;
              const colorSet = [
                { bg: 'bg-accent-blue-subtle', fg: 'text-accent-blue' },
                { bg: 'bg-accent-amber-subtle', fg: 'text-accent-amber' },
                { bg: 'bg-accent-purple-subtle', fg: 'text-accent-purple' },
                { bg: 'bg-accent-green-subtle', fg: 'text-accent-green' },
              ][idx % 4];
              return (
                <Card key={b.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">{lt?.name ?? '-'}</p>
                      <div className={`p-1.5 rounded-lg ${colorSet.bg} ${colorSet.fg}`}>
                        <CalendarDays className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold">{b.remaining_days}</span>
                      <span className="text-sm text-muted-foreground">
                        / {b.total_days}일 (사용: {b.used_days})
                      </span>
                    </div>
                    <Progress value={rate} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Leave request history */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">휴가 신청 내역</CardTitle>
              <Link href="/leave">
                <Button size="sm">
                  휴가 신청하기
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>신청일</TableHead>
                      <TableHead>유형</TableHead>
                      <TableHead>기간</TableHead>
                      <TableHead>일수</TableHead>
                      <TableHead>사유</TableHead>
                      <TableHead>상태</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          휴가 신청 내역이 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      myRequests.map((req) => {
                        const lt = leaveTypes.find((t) => t.id === req.leave_type_id);
                        return (
                          <TableRow key={req.id}>
                            <TableCell className="text-sm">{req.created_at}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {lt?.name ?? '-'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {req.start_date === req.end_date
                                ? req.start_date
                                : `${req.start_date} ~ ${req.end_date}`}
                            </TableCell>
                            <TableCell className="text-sm">{req.days}일</TableCell>
                            <TableCell className="text-sm">{req.reason}</TableCell>
                            <TableCell>
                              <Badge
                                variant={leaveStatusVariant(req.status)}
                                className="text-xs"
                              >
                                {LEAVE_REQUEST_STATUS[req.status as keyof typeof LEAVE_REQUEST_STATUS] ?? req.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* Tab 4: 급여 내역                                                */}
        {/* ============================================================== */}
        <TabsContent value="payroll">
          {/* Base salary card */}
          <Card className="mb-6">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground mb-1">현재 기본급</p>
              <p className="text-2xl font-bold">{fmtWon(baseSalary)}</p>
            </CardContent>
          </Card>

          {/* Payroll history */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">급여 내역</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>기간</TableHead>
                      <TableHead className="text-right">기본급</TableHead>
                      <TableHead className="text-right">총 지급액</TableHead>
                      <TableHead className="text-right">총 공제액</TableHead>
                      <TableHead className="text-right">실수령액</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>명세서</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myPayrolls.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          급여 내역이 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      myPayrolls.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">
                            {p.year}년 {String(p.month).padStart(2, '0')}월
                          </TableCell>
                          <TableCell className="text-right text-sm">{fmtWon(p.base_salary)}</TableCell>
                          <TableCell className="text-right text-sm">{fmtWon(p.total_earnings)}</TableCell>
                          <TableCell className="text-right text-sm">{fmtWon(p.total_deductions)}</TableCell>
                          <TableCell className="text-right text-sm font-semibold">
                            {fmtWon(p.net_pay)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={payrollStatusVariant(p.status)} className="text-xs">
                              {PAYROLL_STATUS[p.status as keyof typeof PAYROLL_STATUS] ?? p.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Link href={`/payroll/payslip/${p.id}`}>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                                보기
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* Tab 5: 근태 현황                                                */}
        {/* ============================================================== */}
        <TabsContent value="attendance">
          {/* Summary cards */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">최근 근무일</p>
                  <div className="p-1.5 rounded-lg bg-accent-blue-subtle text-accent-blue">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{attendanceSummary.total}일</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">정상출근</p>
                  <div className="p-1.5 rounded-lg bg-accent-green-subtle text-accent-green">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{attendanceSummary.normal}일</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">지각</p>
                  <div className="p-1.5 rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{attendanceSummary.late}일</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">조퇴/결근/휴가</p>
                  <div className="p-1.5 rounded-lg bg-accent-amber-subtle text-accent-amber">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{attendanceSummary.other}일</p>
              </CardContent>
            </Card>
          </div>

          {/* Attendance table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">근태 기록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>날짜</TableHead>
                      <TableHead>출근</TableHead>
                      <TableHead>퇴근</TableHead>
                      <TableHead>근무시간</TableHead>
                      <TableHead>상태</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myAttendance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">근태 기록이 없습니다.</TableCell>
                      </TableRow>
                    ) : myAttendance.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.date}</TableCell>
                        <TableCell className="text-sm">{formatClockTime(a.clock_in)}</TableCell>
                        <TableCell className="text-sm">{formatClockTime(a.clock_out)}</TableCell>
                        <TableCell className="text-sm">
                          {a.work_hours != null ? `${a.work_hours.toFixed(2)}h` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={attendanceStatusVariant(a.status)}
                            className="text-xs"
                          >
                            {ATTENDANCE_STATUS[a.status as keyof typeof ATTENDANCE_STATUS] ?? a.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* Tab 6: 교육/평가                                                */}
        {/* ============================================================== */}
        <TabsContent value="training">
          {/* Training history */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">교육 이력</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>교육명</TableHead>
                      <TableHead>분류</TableHead>
                      <TableHead>기간</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>점수</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myTrainings.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.title}</TableCell>
                        <TableCell className="text-sm">{t.category}</TableCell>
                        <TableCell className="text-sm">
                          {t.startDate === t.endDate
                            ? t.startDate
                            : `${t.startDate} ~ ${t.endDate}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant={trainingStatusVariant(t.status)} className="text-xs">
                            {TRAINING_STATUS[t.status as keyof typeof TRAINING_STATUS] ?? t.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {t.score != null ? `${t.score}점` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-6" />

          {/* Evaluation results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">평가 결과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>평가기간</TableHead>
                      <TableHead>등급</TableHead>
                      <TableHead>점수</TableHead>
                      <TableHead>평가자</TableHead>
                      <TableHead>코멘트</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myEvaluations.map((ev) => (
                      <TableRow key={ev.id}>
                        <TableCell className="font-medium">{ev.period}</TableCell>
                        <TableCell>
                          <Badge variant={gradeVariant(ev.grade)} className="text-xs">
                            {ev.grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{ev.totalScore}점</TableCell>
                        <TableCell className="text-sm">{ev.evaluator}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                          {ev.comment}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
