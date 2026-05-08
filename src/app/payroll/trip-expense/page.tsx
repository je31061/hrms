'use client';

import { useState, useMemo, useEffect } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import { useApprovalStore } from '@/lib/stores/approval-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  useTripExpenseStore, calcTripExpense, tripTypeToGrade, tripTypeToScope,
  DEFAULT_MEAL_PER_DAY, DEFAULT_ACCOMMODATION, DEFAULT_FUEL_DAILY,
} from '@/lib/stores/trip-expense-store';
import type { TripExpenseSettlement, TripExpenseGrade, TripScope, TripExpenseSettlementStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Calculator, FileText, ArrowLeft, Plus, Plane, Send, CheckCircle, DollarSign,
  Pencil, Trash2, Settings, Receipt,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const fmtWon = (n: number) => new Intl.NumberFormat('ko-KR').format(n);

const STATUS_LABELS: Record<TripExpenseSettlementStatus, string> = {
  draft: '작성중',
  submitted: '제출됨',
  approved: '승인',
  paid: '지급완료',
  rejected: '반려',
};

const STATUS_VARIANT: Record<TripExpenseSettlementStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'outline',
  submitted: 'secondary',
  approved: 'default',
  paid: 'default',
  rejected: 'destructive',
};

export default function TripExpensePage() {
  const employees = useEmployeeStore((s) => s.employees);
  const departments = useEmployeeStore((s) => s.departments);
  const approvals = useApprovalStore((s) => s.approvals);
  const session = useAuthStore((s) => s.session);
  const rates = useTripExpenseStore((s) => s.rates);
  const settlements = useTripExpenseStore((s) => s.settlements);
  const upsertSettlement = useTripExpenseStore((s) => s.upsertSettlement);
  const updateStatus = useTripExpenseStore((s) => s.updateStatus);
  const deleteSettlement = useTripExpenseStore((s) => s.deleteSettlement);
  const upsertRate = useTripExpenseStore((s) => s.upsertRate);

  const isAdmin = session?.role === 'admin' || session?.role === 'hr_manager';

  const [calcOpen, setCalcOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [rateForm, setRateForm] = useState({ id: '', job_code: '', job_name: '', grade: 'A' as TripExpenseGrade, scope: 'domestic' as TripScope, daily_amount: 0, is_active: true });

  // 정산서 작성 form
  const [form, setForm] = useState({
    employee_id: '',
    approval_id: '',
    trip_type: 'business_trip_a',
    grade: 'A' as TripExpenseGrade,
    scope: 'domestic' as TripScope,
    destination: '',
    client: '',
    start_date: '',
    end_date: '',
    with_meal: true,
    meal_count: 0,
    with_accommodation: false,
    accommodation_nights: 0,
    with_fuel: true,
    other_amount: 0,
    note: '',
  });

  // 정산 가능한 출장 신청 (승인된 것 중 정산 미작성)
  const eligibleApprovals = useMemo(() => {
    return approvals.filter((a) => {
      if (a.type !== 'attendance_request') return false;
      if (a.status !== 'approved') return false;
      const c = a.content as Record<string, unknown> | null;
      if (!c) return false;
      const t = c.requestType as string;
      // 출장/외근/파견만 정산 대상
      const isTrip = t === 'business_trip_a' || t === 'business_trip_b' || t === 'business_trip_c'
        || t === 'field_work' || t === 'dispatch_domestic' || t === 'dispatch_overseas' || t === 'training';
      if (!isTrip) return false;
      // 이미 정산서 있는지
      const existing = settlements.find((s) => s.approval_id === a.id);
      return !existing;
    });
  }, [approvals, settlements]);

  const tripDays = useMemo(() => {
    if (!form.start_date || !form.end_date) return 0;
    const s = new Date(form.start_date);
    const e = new Date(form.end_date);
    return Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  }, [form.start_date, form.end_date]);

  // 자동 계산
  const calculation = useMemo(() => {
    if (tripDays === 0) return null;
    return calcTripExpense({
      grade: form.grade,
      scope: form.scope,
      tripDays,
      rates,
      withMeal: form.with_meal,
      mealCount: form.meal_count > 0 ? form.meal_count : tripDays * 3,
      withAccommodation: form.with_accommodation,
      accommodationNights: form.accommodation_nights > 0 ? form.accommodation_nights : Math.max(0, tripDays - 1),
      withFuel: form.with_fuel,
    });
  }, [form, tripDays, rates]);

  const totalAmount = (calculation?.total ?? 0) + form.other_amount;

  // 결재 선택 시 자동 입력
  useEffect(() => {
    if (!form.approval_id) return;
    const ap = approvals.find((a) => a.id === form.approval_id);
    if (!ap) return;
    const c = ap.content as Record<string, unknown>;
    const tripType = c.requestType as string;
    const region = (c.region as string) ?? '';
    const grade = tripTypeToGrade(tripType);
    const scope = tripTypeToScope(tripType, region);
    setForm((p) => ({
      ...p,
      employee_id: ap.requester_id,
      trip_type: tripType,
      grade,
      scope,
      destination: region,
      client: (c.client as string) ?? '',
      start_date: (c.startDate as string) ?? '',
      end_date: (c.endDate as string) ?? (c.startDate as string) ?? '',
    }));
  }, [form.approval_id, approvals]);

  // 직원별 또는 전체 정산
  const myEmployeeId = session?.employee_id ?? '';
  const visibleSettlements = useMemo(() => {
    if (isAdmin) return settlements;
    return settlements.filter((s) => s.employee_id === myEmployeeId);
  }, [settlements, isAdmin, myEmployeeId]);

  // 통계
  const stats = useMemo(() => {
    const total = visibleSettlements.length;
    const draft = visibleSettlements.filter((s) => s.status === 'draft').length;
    const submitted = visibleSettlements.filter((s) => s.status === 'submitted').length;
    const paid = visibleSettlements.filter((s) => s.status === 'paid').length;
    const totalPaid = visibleSettlements.filter((s) => s.status === 'paid').reduce((sum, s) => sum + s.total_amount, 0);
    return { total, draft, submitted, paid, totalPaid };
  }, [visibleSettlements]);

  // Open dialog
  const openNewSettlement = () => {
    setEditingId(null);
    setForm({
      employee_id: myEmployeeId, approval_id: '',
      trip_type: 'business_trip_a', grade: 'A', scope: 'domestic',
      destination: '', client: '', start_date: '', end_date: '',
      with_meal: true, meal_count: 0,
      with_accommodation: false, accommodation_nights: 0,
      with_fuel: true, other_amount: 0, note: '',
    });
    setCalcOpen(true);
  };

  const openEditSettlement = (s: TripExpenseSettlement) => {
    setEditingId(s.id);
    setForm({
      employee_id: s.employee_id,
      approval_id: s.approval_id ?? '',
      trip_type: s.trip_type,
      grade: s.trip_grade,
      scope: s.trip_scope,
      destination: s.destination,
      client: s.client ?? '',
      start_date: s.start_date,
      end_date: s.end_date,
      with_meal: s.meal_allowance > 0,
      meal_count: 0,
      with_accommodation: s.accommodation_allowance > 0,
      accommodation_nights: 0,
      with_fuel: s.fuel_allowance > 0,
      other_amount: s.other_allowance,
      note: s.note ?? '',
    });
    setCalcOpen(true);
  };

  const handleSave = (status: TripExpenseSettlementStatus = 'draft') => {
    if (!form.employee_id) { toast.error('직원을 선택하세요.'); return; }
    if (!form.start_date || !form.end_date) { toast.error('출장 기간을 입력하세요.'); return; }
    if (!form.destination.trim()) { toast.error('방문 지역을 입력하세요.'); return; }
    if (!calculation) { toast.error('계산 결과가 없습니다.'); return; }

    const now = new Date().toISOString();
    const existing = editingId ? settlements.find((s) => s.id === editingId) : null;
    upsertSettlement({
      id: editingId ?? `te-${Date.now()}`,
      employee_id: form.employee_id,
      approval_id: form.approval_id || null,
      trip_type: form.trip_type,
      trip_grade: form.grade,
      trip_scope: form.scope,
      destination: form.destination,
      client: form.client || null,
      start_date: form.start_date,
      end_date: form.end_date,
      trip_days: tripDays,
      daily_allowance: calculation.dailyAllowance,
      meal_allowance: calculation.mealAllowance,
      accommodation_allowance: calculation.accommodationAllowance,
      fuel_allowance: calculation.fuelAllowance,
      other_allowance: form.other_amount,
      items: existing?.items ?? [],
      total_amount: totalAmount,
      status,
      submitted_at: status === 'submitted' ? now : (existing?.submitted_at ?? null),
      reviewed_at: existing?.reviewed_at ?? null,
      reviewed_by: existing?.reviewed_by ?? null,
      reviewed_by_name: existing?.reviewed_by_name ?? null,
      review_comment: existing?.review_comment ?? null,
      paid_at: existing?.paid_at ?? null,
      note: form.note || null,
      created_at: existing?.created_at ?? now,
      updated_at: now,
    });
    toast.success(status === 'draft' ? '임시저장되었습니다.' : '제출되었습니다.');
    setCalcOpen(false);
  };

  const handleApprove = (s: TripExpenseSettlement) => {
    if (window.confirm(`${fmtWon(s.total_amount)}원 정산을 승인하시겠습니까?`)) {
      updateStatus(s.id, 'approved', session?.employee_id ?? '', session?.user_name ?? '관리자');
      toast.success('정산이 승인되었습니다.');
    }
  };
  const handleReject = (s: TripExpenseSettlement) => {
    const reason = window.prompt('반려 사유:');
    if (reason) {
      updateStatus(s.id, 'rejected', session?.employee_id ?? '', session?.user_name ?? '관리자', reason);
      toast.success('반려 처리되었습니다.');
    }
  };
  const handlePay = (s: TripExpenseSettlement) => {
    if (window.confirm(`${fmtWon(s.total_amount)}원을 지급 처리하시겠습니까?`)) {
      updateStatus(s.id, 'paid', session?.employee_id ?? '', session?.user_name ?? '관리자');
      toast.success('지급 처리되었습니다.');
    }
  };

  // 단가 관리
  const openRateDialog = (id?: string) => {
    if (id) {
      const r = rates.find((x) => x.id === id);
      if (r) {
        setRateForm({ ...r });
        setEditingRateId(id);
      }
    } else {
      setRateForm({ id: `tr-${Date.now()}`, job_code: '', job_name: '', grade: 'A', scope: 'domestic', daily_amount: 0, is_active: true });
      setEditingRateId(null);
    }
    setRateDialogOpen(true);
  };
  const saveRate = () => {
    if (!rateForm.job_name.trim()) { toast.error('직무명을 입력하세요.'); return; }
    upsertRate(rateForm);
    toast.success('출장비 단가가 저장되었습니다.');
    setRateDialogOpen(false);
  };

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">출장비 정산</h1>
        <div className="flex gap-2">
          <Link href="/payroll">
            <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />급여관리</Button>
          </Link>
          <Button onClick={openNewSettlement}>
            <Plus className="h-4 w-4 mr-2" />
            정산서 작성
          </Button>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">전체 정산서</p>
            <p className="text-xl font-bold">{stats.total}건</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">작성중</p>
            <p className="text-xl font-bold text-blue-600">{stats.draft}건</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">제출/승인 대기</p>
            <p className="text-xl font-bold text-amber-600">{stats.submitted}건</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">지급완료</p>
            <p className="text-xl font-bold text-green-600">{stats.paid}건</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">총 지급액</p>
            <p className="text-lg font-bold">{fmtWon(stats.totalPaid)}원</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">정산서 목록</TabsTrigger>
          {eligibleApprovals.length > 0 && (
            <TabsTrigger value="eligible">정산 가능 출장 ({eligibleApprovals.length})</TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="rates" className="gap-1">
              <Settings className="h-3.5 w-3.5" />
              단가 기준 관리
            </TabsTrigger>
          )}
        </TabsList>

        {/* 정산서 목록 */}
        <TabsContent value="list">
          <Card>
            <CardContent className="pt-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>출장기간</TableHead>
                      <TableHead>대상자</TableHead>
                      <TableHead>방문지</TableHead>
                      <TableHead>등급</TableHead>
                      <TableHead className="text-right">일수</TableHead>
                      <TableHead className="text-right">일비</TableHead>
                      <TableHead className="text-right">식대</TableHead>
                      <TableHead className="text-right">숙박</TableHead>
                      <TableHead className="text-right">총액</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleSettlements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                          정산서가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : visibleSettlements.map((s) => {
                      const emp = employees.find((e) => e.id === s.employee_id);
                      const dept = emp ? departments.find((d) => d.id === emp.department_id) : null;
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="text-xs">
                            {s.start_date}{s.start_date !== s.end_date && ` ~ ${s.end_date}`}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-sm">{emp?.name ?? s.employee_id}</p>
                            <p className="text-[10px] text-muted-foreground">{dept?.name}</p>
                          </TableCell>
                          <TableCell className="text-sm">
                            {s.destination}
                            {s.client && <p className="text-[10px] text-muted-foreground">{s.client}</p>}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {s.trip_grade}/{s.trip_scope === 'domestic' ? '국내' : '해외'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm">{s.trip_days}일</TableCell>
                          <TableCell className="text-right font-mono text-xs">{fmtWon(s.daily_allowance)}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{fmtWon(s.meal_allowance)}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{fmtWon(s.accommodation_allowance)}</TableCell>
                          <TableCell className="text-right font-mono text-sm font-bold">{fmtWon(s.total_amount)}</TableCell>
                          <TableCell>
                            <Badge variant={STATUS_VARIANT[s.status]} className="text-xs">{STATUS_LABELS[s.status]}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              {(s.status === 'draft' || s.status === 'rejected') && (
                                <Button size="sm" variant="ghost" className="h-7 px-2"
                                  onClick={() => openEditSettlement(s)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                              )}
                              {s.status === 'submitted' && isAdmin && (
                                <>
                                  <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(s)}>
                                    <CheckCircle className="h-3 w-3 mr-1" />승인
                                  </Button>
                                  <Button size="sm" variant="destructive" className="h-7 text-xs"
                                    onClick={() => handleReject(s)}>
                                    반려
                                  </Button>
                                </>
                              )}
                              {s.status === 'approved' && isAdmin && (
                                <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                                  onClick={() => handlePay(s)}>
                                  <DollarSign className="h-3 w-3 mr-1" />지급
                                </Button>
                              )}
                              {s.status === 'draft' && (
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive"
                                  onClick={() => {
                                    if (window.confirm('삭제하시겠습니까?')) {
                                      deleteSettlement(s.id);
                                      toast.success('삭제되었습니다.');
                                    }
                                  }}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 정산 가능 출장 */}
        <TabsContent value="eligible">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">정산서 미작성 출장 신청 (승인됨)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>출장기간</TableHead>
                      <TableHead>신청자</TableHead>
                      <TableHead>유형</TableHead>
                      <TableHead>방문지</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eligibleApprovals.map((a) => {
                      const c = a.content as Record<string, unknown>;
                      const emp = employees.find((e) => e.id === a.requester_id);
                      return (
                        <TableRow key={a.id}>
                          <TableCell className="text-sm">
                            {(c.startDate as string)}
                            {c.endDate !== c.startDate && ` ~ ${c.endDate}`}
                          </TableCell>
                          <TableCell className="font-medium">{emp?.name ?? a.requester_id}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{c.requestTypeLabel as string}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{(c.region as string) ?? '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                              onClick={() => {
                                setForm((p) => ({ ...p, approval_id: a.id }));
                                setEditingId(null);
                                setCalcOpen(true);
                              }}>
                              <Calculator className="h-3 w-3 mr-1" />정산 작성
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 단가 기준 관리 */}
        {isAdmin && (
          <TabsContent value="rates">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">출장비 단가 기준 (직무별)</CardTitle>
                <Button size="sm" onClick={() => openRateDialog()}>
                  <Plus className="h-4 w-4 mr-1" />단가 추가
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-muted/30 text-xs">
                    <p className="text-muted-foreground">국내 식대</p>
                    <p className="font-bold">{fmtWon(DEFAULT_MEAL_PER_DAY)}원/끼</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 text-xs">
                    <p className="text-muted-foreground">국내 숙박비</p>
                    <p className="font-bold">{fmtWon(DEFAULT_ACCOMMODATION)}원/박</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 text-xs">
                    <p className="text-muted-foreground">유류대(국내)</p>
                    <p className="font-bold">{fmtWon(DEFAULT_FUEL_DAILY)}원/일</p>
                  </div>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>직무코드</TableHead>
                        <TableHead>직무명</TableHead>
                        <TableHead>등급</TableHead>
                        <TableHead>구분</TableHead>
                        <TableHead className="text-right">일비</TableHead>
                        <TableHead>활성</TableHead>
                        <TableHead className="text-right">관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rates.sort((a, b) => a.job_code.localeCompare(b.job_code) || a.scope.localeCompare(b.scope)).map((r) => (
                        <TableRow key={r.id} className={r.is_active ? '' : 'opacity-50'}>
                          <TableCell className="font-mono text-xs">{r.job_code}</TableCell>
                          <TableCell>{r.job_name}</TableCell>
                          <TableCell>
                            <Badge variant={r.grade === 'A' ? 'default' : r.grade === 'B' ? 'secondary' : 'outline'}
                              className="text-xs">{r.grade}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{r.scope === 'domestic' ? '국내' : '해외'}</TableCell>
                          <TableCell className="text-right font-mono">{fmtWon(r.daily_amount)}원</TableCell>
                          <TableCell>
                            <Switch checked={r.is_active}
                              onCheckedChange={(v) => upsertRate({ ...r, is_active: v })} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openRateDialog(r.id)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* 정산서 작성 다이얼로그 */}
      <Dialog open={calcOpen} onOpenChange={setCalcOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? '정산서 수정' : '출장비 정산서 작성'}</DialogTitle>
            <DialogDescription>
              승인된 출장 신청을 선택하면 정보가 자동 입력됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* 출장 신청 연동 */}
            <div className="space-y-2">
              <Label>연동 출장 신청 (선택)</Label>
              <Select value={form.approval_id} onValueChange={(v) => setForm((p) => ({ ...p, approval_id: v }))}>
                <SelectTrigger><SelectValue placeholder="결재 선택" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">선택 안함 (직접 입력)</SelectItem>
                  {eligibleApprovals.map((a) => {
                    const c = a.content as Record<string, unknown>;
                    const emp = employees.find((e) => e.id === a.requester_id);
                    return (
                      <SelectItem key={a.id} value={a.id}>
                        [{c.requestTypeLabel as string}] {emp?.name} - {c.startDate as string} {c.region as string}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* 기본 정보 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>대상자 *</Label>
                <Select value={form.employee_id} onValueChange={(v) => setForm((p) => ({ ...p, employee_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="직원 선택" /></SelectTrigger>
                  <SelectContent>
                    {employees.filter((e) => e.status === 'active').map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name} ({e.employee_number})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>방문 거래처</Label>
                <Input value={form.client} onChange={(e) => setForm((p) => ({ ...p, client: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>출발일 *</Label>
                <Input type="date" value={form.start_date}
                  onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>복귀일 *</Label>
                <Input type="date" value={form.end_date}
                  onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>방문 지역 *</Label>
              <Input value={form.destination}
                onChange={(e) => setForm((p) => ({ ...p, destination: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>등급 (직무 기반)</Label>
                <Select value={form.grade} onValueChange={(v) => setForm((p) => ({ ...p, grade: v as TripExpenseGrade }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A 등급 (연구/AS/시운전/설치)</SelectItem>
                    <SelectItem value="B">B 등급 (안전관리/품질검사)</SelectItem>
                    <SelectItem value="C">C 등급 (영업/관리/기타)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>구분</Label>
                <Select value={form.scope} onValueChange={(v) => setForm((p) => ({ ...p, scope: v as TripScope }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domestic">국내</SelectItem>
                    <SelectItem value="overseas">해외</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* 항목 옵션 */}
            <div>
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                정산 항목 선택
              </p>
              <div className="space-y-3 p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <Label>식대 ({fmtWon(DEFAULT_MEAL_PER_DAY)}원/끼)</Label>
                  <Switch checked={form.with_meal}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, with_meal: v }))} />
                </div>
                {form.with_meal && (
                  <div className="flex items-center gap-2 ml-4 text-xs">
                    <Label className="text-xs">식수:</Label>
                    <Input type="number" className="w-[80px] h-7"
                      value={form.meal_count || tripDays * 3}
                      onChange={(e) => setForm((p) => ({ ...p, meal_count: Number(e.target.value) }))} />
                    <span className="text-muted-foreground">끼 (자동 계산: {tripDays}일 × 3끼)</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Label>숙박비 ({fmtWon(DEFAULT_ACCOMMODATION)}원/박)</Label>
                  <Switch checked={form.with_accommodation}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, with_accommodation: v }))} />
                </div>
                {form.with_accommodation && (
                  <div className="flex items-center gap-2 ml-4 text-xs">
                    <Label className="text-xs">박수:</Label>
                    <Input type="number" className="w-[80px] h-7"
                      value={form.accommodation_nights || Math.max(0, tripDays - 1)}
                      onChange={(e) => setForm((p) => ({ ...p, accommodation_nights: Number(e.target.value) }))} />
                    <span className="text-muted-foreground">박 (자동: {Math.max(0, tripDays - 1)}박)</span>
                  </div>
                )}
                {form.scope === 'domestic' && (
                  <div className="flex items-center justify-between">
                    <Label>유류대 ({fmtWon(DEFAULT_FUEL_DAILY)}원/일)</Label>
                    <Switch checked={form.with_fuel}
                      onCheckedChange={(v) => setForm((p) => ({ ...p, with_fuel: v }))} />
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <Label>기타 (예비비)</Label>
                  <Input type="number" className="w-[140px]"
                    value={form.other_amount}
                    onChange={(e) => setForm((p) => ({ ...p, other_amount: Number(e.target.value) }))} />
                </div>
              </div>
            </div>

            {/* 계산 결과 */}
            {calculation && (
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 space-y-2">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  정산 금액
                </p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">일비 ({calculation.dailyRate ? fmtWon(calculation.dailyRate) : '-'}원 × {tripDays}일)</span>
                    <span className="font-mono">{fmtWon(calculation.dailyAllowance)}원</span>
                  </div>
                  {calculation.mealAllowance > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">식대</span>
                      <span className="font-mono">{fmtWon(calculation.mealAllowance)}원</span>
                    </div>
                  )}
                  {calculation.accommodationAllowance > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">숙박비</span>
                      <span className="font-mono">{fmtWon(calculation.accommodationAllowance)}원</span>
                    </div>
                  )}
                  {calculation.fuelAllowance > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">유류대</span>
                      <span className="font-mono">{fmtWon(calculation.fuelAllowance)}원</span>
                    </div>
                  )}
                  {form.other_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">기타</span>
                      <span className="font-mono">{fmtWon(form.other_amount)}원</span>
                    </div>
                  )}
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-bold">
                  <span>총 정산금액</span>
                  <span className="font-mono text-blue-600">{fmtWon(totalAmount)}원</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>비고</Label>
              <Textarea value={form.note}
                onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCalcOpen(false)}>취소</Button>
            <Button variant="outline" onClick={() => handleSave('draft')}>임시저장</Button>
            <Button onClick={() => handleSave('submitted')}>
              <Send className="h-4 w-4 mr-2" />
              제출 (결재 상신)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 단가 기준 다이얼로그 */}
      <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRateId ? '단가 수정' : '단가 추가'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>직무 코드</Label>
                <Input value={rateForm.job_code}
                  onChange={(e) => setRateForm((p) => ({ ...p, job_code: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>등급</Label>
                <Select value={rateForm.grade}
                  onValueChange={(v) => setRateForm((p) => ({ ...p, grade: v as TripExpenseGrade }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>직무명</Label>
              <Input value={rateForm.job_name}
                onChange={(e) => setRateForm((p) => ({ ...p, job_name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>구분</Label>
                <Select value={rateForm.scope}
                  onValueChange={(v) => setRateForm((p) => ({ ...p, scope: v as TripScope }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domestic">국내</SelectItem>
                    <SelectItem value="overseas">해외</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>일비 금액</Label>
                <Input type="number" value={rateForm.daily_amount}
                  onChange={(e) => setRateForm((p) => ({ ...p, daily_amount: Number(e.target.value) }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRateDialogOpen(false)}>취소</Button>
            <Button onClick={saveRate}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
