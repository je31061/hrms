'use client';

import { useMemo, useState, Fragment } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { useLeaveStore } from '@/lib/stores/leave-store';
import { usePayrollStore } from '@/lib/stores/payroll-store';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import { useAttendanceStore } from '@/lib/stores/attendance-store';
import { useAppointmentStore } from '@/lib/stores/appointment-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  LEAVE_REQUEST_STATUS,
  PAYROLL_STATUS,
  APPOINTMENT_TYPES,
  ATTENDANCE_STATUS,
  TRAINING_STATUS,
  LEAVE_TIME_PERIODS,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
  LogIn,
  LogOut,
  Timer,
  Plus,
  ChevronDown,
  ChevronUp,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import LeaveRequestForm from '@/components/leave/leave-request-form';
import { toast } from 'sonner';

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

function generateTimeOptions(min: string, max: string, intervalMin = 30): string[] {
  const [minH, minM] = min.split(':').map(Number);
  const [maxH, maxM] = max.split(':').map(Number);
  const options: string[] = [];
  let cur = minH * 60 + minM;
  const end = maxH * 60 + maxM;
  while (cur <= end) {
    const h = Math.floor(cur / 60);
    const m = cur % 60;
    options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    cur += intervalMin;
  }
  return options;
}

function calcEndTime(startTime: string, totalHours: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const endMin = h * 60 + m + totalHours * 60;
  const eh = Math.floor(endMin / 60);
  const em = endMin % 60;
  return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
}

const appointmentTypeVariant = (type: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (type) {
    case 'promotion': case 'hire': return 'default';
    case 'transfer': return 'secondary';
    case 'title_change': return 'outline';
    case 'resignation': return 'destructive';
    default: return 'outline';
  }
};

const leaveStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'approved': return 'default';
    case 'pending': return 'secondary';
    case 'rejected': return 'destructive';
    default: return 'outline';
  }
};

const payrollStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'paid': return 'default';
    case 'confirmed': return 'secondary';
    default: return 'outline';
  }
};

const attendanceStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'normal': return 'default';
    case 'late': case 'absent': return 'destructive';
    case 'early_leave': case 'half_day': case 'quarter_day': return 'secondary';
    default: return 'outline';
  }
};

const trainingStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'completed': return 'default';
    case 'in_progress': return 'secondary';
    case 'planned': return 'outline';
    default: return 'destructive';
  }
};

const gradeVariant = (grade: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (grade) {
    case 'S': case 'A': return 'default';
    case 'B': return 'secondary';
    case 'C': return 'outline';
    default: return 'destructive';
  }
};

// ---------------------------------------------------------------------------
// MyPayrollDetail sub-component
// ---------------------------------------------------------------------------

interface MyPayrollDetailProps {
  myPayrolls: import('@/types').SavedPayroll[];
  baseSalary: number;
  myId: string;
}

function MyPayrollDetail({ myPayrolls, baseSalary, myId }: MyPayrollDetailProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const payroll = useSettingsStore((s) => s.payroll);

  const latestPayroll = myPayrolls.length > 0 ? myPayrolls[0] : null;
  const latestEarnings = latestPayroll?.items.filter((i) => i.category === 'earning') ?? [];
  const latestDeductions = latestPayroll?.items.filter((i) => i.category === 'deduction') ?? [];

  // Monthly trend chart data
  const trendData = useMemo(() => {
    return [...myPayrolls]
      .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
      .map((p) => ({
        label: `${p.year}.${String(p.month).padStart(2, '0')}`,
        earnings: p.total_earnings,
        deductions: p.total_deductions,
        netPay: p.net_pay,
      }));
  }, [myPayrolls]);

  // Totals for period
  const periodTotal = useMemo(() => {
    const te = myPayrolls.reduce((s, p) => s + p.total_earnings, 0);
    const td = myPayrolls.reduce((s, p) => s + p.total_deductions, 0);
    return { earnings: te, deductions: td, netPay: te - td, months: myPayrolls.length };
  }, [myPayrolls]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">기본급</CardTitle>
            <div className="p-2 rounded-lg bg-accent-blue-subtle text-accent-blue">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{fmtWon(baseSalary)}</p>
            <p className="text-xs text-muted-foreground mt-1">월 통상시급: {fmtWon(Math.round(baseSalary / 209))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">최근 실수령액</CardTitle>
            <div className="p-2 rounded-lg bg-accent-green-subtle text-accent-green">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{latestPayroll ? fmtWon(latestPayroll.net_pay) : '-'}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {latestPayroll ? `${latestPayroll.year}년 ${latestPayroll.month}월` : ''}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">최근 공제액</CardTitle>
            <div className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-destructive">{latestPayroll ? fmtWon(latestPayroll.total_deductions) : '-'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">누적 실수령</CardTitle>
            <div className="p-2 rounded-lg bg-accent-purple-subtle text-accent-purple">
              <Banknote className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{fmtWon(periodTotal.netPay)}</p>
            <p className="text-xs text-muted-foreground mt-1">{periodTotal.months}개월 합계</p>
          </CardContent>
        </Card>
      </div>

      {/* Latest payroll detail breakdown */}
      {latestPayroll && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Earnings breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-accent-blue-subtle text-accent-blue">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                지급 항목 ({latestPayroll.year}년 {latestPayroll.month}월)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {latestEarnings.map((item) => (
                  <div key={item.item_id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.formula}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-semibold">{fmtWon(item.amount)}</p>
                      {!item.is_taxable && (
                        <Badge variant="outline" className="text-[10px] px-1">비과세</Badge>
                      )}
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between font-bold">
                  <span className="text-sm">총 지급액</span>
                  <span className="text-sm font-mono">{fmtWon(latestPayroll.total_earnings)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deductions breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                  <TrendingDown className="h-3.5 w-3.5" />
                </div>
                공제 항목 ({latestPayroll.year}년 {latestPayroll.month}월)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {latestDeductions.map((item) => (
                  <div key={item.item_id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.formula}</p>
                    </div>
                    <p className="text-sm font-mono font-semibold text-destructive">-{fmtWon(item.amount)}</p>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between font-bold">
                  <span className="text-sm">총 공제액</span>
                  <span className="text-sm font-mono text-destructive">-{fmtWon(latestPayroll.total_deductions)}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-primary pt-2 border-t">
                  <span>실수령액</span>
                  <span className="font-mono text-lg">{fmtWon(latestPayroll.net_pay)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insurance rates info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">4대보험 요율 안내</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {[
              { label: '국민연금', rate: `${payroll.national_pension_rate}%`, desc: '근로자 부담분' },
              { label: '건강보험', rate: `${payroll.health_insurance_rate}%`, desc: '근로자 부담분' },
              { label: '장기요양보험', rate: `${payroll.long_term_care_rate}%`, desc: '건강보험의' },
              { label: '고용보험', rate: `${payroll.employment_insurance_rate}%`, desc: '근로자 부담분' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-lg font-bold mt-1">{item.rate}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-3 grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">비과세 식대 한도</p>
              <p className="text-sm font-bold mt-1">{fmtWon(payroll.meal_allowance_limit)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">비과세 교통비 한도</p>
              <p className="text-sm font-bold mt-1">{fmtWon(payroll.transport_allowance_limit)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly trend chart */}
      {trendData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">월별 급여 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => new Intl.NumberFormat('ko-KR', { notation: 'compact', maximumFractionDigits: 1 }).format(v)} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-background)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    cursor={{ fill: 'var(--color-muted)', opacity: 0.5 }}
                    formatter={(value) => fmtWon(value as number)}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="earnings" fill="var(--color-accent-blue)" radius={[4, 4, 0, 0]} name="지급액" />
                  <Bar dataKey="deductions" fill="var(--color-accent-amber)" radius={[4, 4, 0, 0]} name="공제액" />
                  <Bar dataKey="netPay" fill="var(--color-accent-green)" radius={[4, 4, 0, 0]} name="실수령" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payroll history with expandable rows */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">급여 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
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
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      급여 내역이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  myPayrolls.map((p) => {
                    const isExpanded = expandedId === p.id;
                    const earnings = p.items.filter((i) => i.category === 'earning');
                    const deductions = p.items.filter((i) => i.category === 'deduction');
                    return (
                      <Fragment key={p.id}>
                        <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleExpand(p.id)}>
                          <TableCell className="px-2">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </TableCell>
                          <TableCell className="font-medium">
                            {p.year}년 {String(p.month).padStart(2, '0')}월
                          </TableCell>
                          <TableCell className="text-right text-sm font-mono">{fmtWon(p.base_salary)}</TableCell>
                          <TableCell className="text-right text-sm font-mono">{fmtWon(p.total_earnings)}</TableCell>
                          <TableCell className="text-right text-sm font-mono text-destructive">{fmtWon(p.total_deductions)}</TableCell>
                          <TableCell className="text-right text-sm font-mono font-bold">{fmtWon(p.net_pay)}</TableCell>
                          <TableCell>
                            <Badge variant={payrollStatusVariant(p.status)} className="text-xs">
                              {PAYROLL_STATUS[p.status as keyof typeof PAYROLL_STATUS] ?? p.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Link href={`/payroll/payslip/${p.id}`} onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                                보기
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${p.id}-detail`}>
                            <TableCell colSpan={8} className="bg-muted/30 p-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <p className="text-sm font-semibold mb-2">지급 항목</p>
                                  <div className="space-y-1.5">
                                    {earnings.map((item) => (
                                      <div key={item.item_id} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                          {item.name}
                                          {!item.is_taxable && <span className="text-xs ml-1 text-blue-500">(비과세)</span>}
                                        </span>
                                        <span className="font-mono">{fmtWon(item.amount)}</span>
                                      </div>
                                    ))}
                                    <Separator />
                                    <div className="flex justify-between text-sm font-bold">
                                      <span>합계</span>
                                      <span className="font-mono">{fmtWon(p.total_earnings)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold mb-2">공제 항목</p>
                                  <div className="space-y-1.5">
                                    {deductions.map((item) => (
                                      <div key={item.item_id} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{item.name}</span>
                                        <span className="font-mono text-destructive">-{fmtWon(item.amount)}</span>
                                      </div>
                                    ))}
                                    <Separator />
                                    <div className="flex justify-between text-sm font-bold">
                                      <span>합계</span>
                                      <span className="font-mono text-destructive">-{fmtWon(p.total_deductions)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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
  const work = useSettingsStore((s) => s.work);

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
  const clockIn = useAttendanceStore((s) => s.clockIn);
  const clockOut = useAttendanceStore((s) => s.clockOut);
  const getTodayRecord = useAttendanceStore((s) => s.getTodayRecord);

  // Appointment store
  const appointments = useAppointmentStore((s) => s.appointments);

  // Local state
  const [selectedStart, setSelectedStart] = useState(work.default_start_time);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  // Timer for clock
  useState(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  });

  const todayRecord = getTodayRecord(MY_ID);
  const isClockedIn = !!todayRecord && !todayRecord.clock_out;

  const startOptions = useMemo(() => {
    if (!work.flex_work_enabled) return [work.default_start_time];
    return generateTimeOptions(work.flex_start_min, work.flex_start_max);
  }, [work]);

  const selectedEnd = useMemo(() => calcEndTime(selectedStart, 9), [selectedStart]);

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

  const attendanceSummary = useMemo(() => {
    const total = myAttendance.length;
    const normal = myAttendance.filter((a) => a.status === 'normal').length;
    const late = myAttendance.filter((a) => a.status === 'late').length;
    const halfDay = myAttendance.filter((a) => a.status === 'half_day' || a.status === 'quarter_day').length;
    const other = myAttendance.filter(
      (a) => a.status === 'early_leave' || a.status === 'absent' || a.status === 'leave',
    ).length;
    return { total, normal, late, halfDay, other };
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

  const formatTimeDisplay = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleClockIn = () => {
    clockIn(MY_ID, 'office', selectedStart, selectedEnd, work.late_grace_minutes);
    toast.success('출근이 기록되었습니다.');
  };

  const handleClockOut = () => {
    clockOut(MY_ID);
    toast.success('퇴근이 기록되었습니다.');
  };

  return (
    <div>
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-6">마이페이지</h1>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

      {/* Tabs */}
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="attendance" className="gap-1">
            <Clock className="h-3.5 w-3.5" />
            출퇴근/근태
          </TabsTrigger>
          <TabsTrigger value="leave" className="gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            휴가신청
          </TabsTrigger>
          <TabsTrigger value="basic" className="gap-1">
            <User className="h-3.5 w-3.5" />
            기본정보
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            인사발령
          </TabsTrigger>
          <TabsTrigger value="payroll" className="gap-1">
            <Banknote className="h-3.5 w-3.5" />
            급여
          </TabsTrigger>
          <TabsTrigger value="training" className="gap-1">
            <GraduationCap className="h-3.5 w-3.5" />
            교육/평가
          </TabsTrigger>
        </TabsList>

        {/* ============================================================== */}
        {/* Tab 1: 출퇴근/근태 (NEW - combined clock + attendance)         */}
        {/* ============================================================== */}
        <TabsContent value="attendance">
          {/* Clock-in/out card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                출퇴근
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-mono font-bold">{formatTimeDisplay(currentTime)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                  </p>
                  <div className="flex gap-4 text-sm">
                    <span>출근: <strong>{formatClockTime(todayRecord?.clock_in ?? null)}</strong></span>
                    <span>퇴근: <strong>{formatClockTime(todayRecord?.clock_out ?? null)}</strong></span>
                  </div>
                  {todayRecord?.leave_time_period && (
                    <Badge variant="secondary">
                      {LEAVE_TIME_PERIODS[todayRecord.leave_time_period as keyof typeof LEAVE_TIME_PERIODS]}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3">
                  {/* Flex schedule selector */}
                  {work.flex_work_enabled && !todayRecord && (
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">근무시간:</span>
                      <Select value={selectedStart} onValueChange={setSelectedStart}>
                        <SelectTrigger className="w-[100px] h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {startOptions.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground">~</span>
                      <span className="text-sm font-medium">{selectedEnd}</span>
                    </div>
                  )}
                  {todayRecord && (
                    <div className="text-sm text-muted-foreground">
                      근무시간: {todayRecord.scheduled_start ?? work.default_start_time} ~ {todayRecord.scheduled_end ?? work.default_end_time}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={handleClockIn} disabled={!!todayRecord} size="lg">
                      <LogIn className="h-4 w-4 mr-2" />
                      출근
                    </Button>
                    <Button onClick={handleClockOut} disabled={!isClockedIn} variant="outline" size="lg">
                      <LogOut className="h-4 w-4 mr-2" />
                      퇴근
                    </Button>
                  </div>
                </div>
              </div>
              {work.flex_work_enabled && (
                <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <strong>유연근무제</strong>: {work.flex_start_min}~{work.flex_start_max} 출근 / {work.flex_end_min}~{work.flex_end_max} 퇴근 (8시간 근무 + 1시간 점심)
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary cards */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-5 mb-6">
            {[
              { label: '최근 근무일', value: attendanceSummary.total, color: 'bg-accent-blue-subtle text-accent-blue' },
              { label: '정상출근', value: attendanceSummary.normal, color: 'bg-accent-green-subtle text-accent-green' },
              { label: '지각', value: attendanceSummary.late, color: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' },
              { label: '반차/반반차', value: attendanceSummary.halfDay, color: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400' },
              { label: '조퇴/결근/휴가', value: attendanceSummary.other, color: 'bg-accent-amber-subtle text-accent-amber' },
            ].map(({ label, value, color }) => (
              <Card key={label}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <div className={`p-1.5 rounded-lg ${color}`}>
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{value}일</p>
                </CardContent>
              </Card>
            ))}
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
                      <TableHead>근무시간대</TableHead>
                      <TableHead>출근</TableHead>
                      <TableHead>퇴근</TableHead>
                      <TableHead>근무시간</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>비고</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myAttendance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">근태 기록이 없습니다.</TableCell>
                      </TableRow>
                    ) : myAttendance.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.date}</TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground font-mono">
                            {a.scheduled_start && a.scheduled_end
                              ? `${a.scheduled_start}~${a.scheduled_end}`
                              : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{formatClockTime(a.clock_in)}</TableCell>
                        <TableCell className="text-sm">{formatClockTime(a.clock_out)}</TableCell>
                        <TableCell className="text-sm">
                          {a.work_hours != null ? `${a.work_hours.toFixed(2)}h` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Badge
                              variant={attendanceStatusVariant(a.status)}
                              className="text-xs"
                            >
                              {ATTENDANCE_STATUS[a.status as keyof typeof ATTENDANCE_STATUS] ?? a.status}
                            </Badge>
                            {a.leave_time_period && (
                              <Badge variant="outline" className="text-xs">
                                {LEAVE_TIME_PERIODS[a.leave_time_period as keyof typeof LEAVE_TIME_PERIODS]}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{a.note ?? ''}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* Tab 2: 휴가신청 (NEW - with inline form)                       */}
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

          <div className="grid gap-6 md:grid-cols-2">
            {/* Leave Request Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  휴가 신청
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeaveRequestForm
                  employeeId={MY_ID}
                  onSuccess={() => toast.success('휴가가 신청되었습니다.')}
                />
              </CardContent>
            </Card>

            {/* Recent requests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">신청 내역</CardTitle>
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
                        <TableHead>상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            휴가 신청 내역이 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        myRequests.slice(0, 10).map((req) => {
                          const lt = leaveTypes.find((t) => t.id === req.leave_type_id);
                          const periodLabel = req.leave_time_period
                            ? LEAVE_TIME_PERIODS[req.leave_time_period as keyof typeof LEAVE_TIME_PERIODS]
                            : null;
                          return (
                            <TableRow key={req.id}>
                              <TableCell className="text-sm">{req.created_at}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {lt?.name ?? '-'}
                                  </Badge>
                                  {periodLabel && (
                                    <Badge variant="secondary" className="text-xs">
                                      {periodLabel}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {req.start_date === req.end_date
                                  ? req.start_date
                                  : `${req.start_date} ~ ${req.end_date}`}
                              </TableCell>
                              <TableCell className="text-sm">{req.days}일</TableCell>
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
          </div>
        </TabsContent>

        {/* ============================================================== */}
        {/* Tab 3: 기본정보                                                 */}
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
        {/* Tab 4: 인사발령 내역                                            */}
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
        {/* Tab 5: 급여 내역 (상세)                                        */}
        {/* ============================================================== */}
        <TabsContent value="payroll">
          <MyPayrollDetail
            myPayrolls={myPayrolls}
            baseSalary={baseSalary}
            myId={MY_ID}
          />
        </TabsContent>

        {/* ============================================================== */}
        {/* Tab 6: 교육/평가                                                */}
        {/* ============================================================== */}
        <TabsContent value="training">
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
