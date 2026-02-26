'use client';

import { useState, useMemo } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { usePayrollStore } from '@/lib/stores/payroll-store';
import { demoEmployees } from '@/lib/stores/leave-store';
import { PAYROLL_STATUS } from '@/lib/constants/codes';
import type { PayrollStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, FileText, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const fmtWon = (n: number) => new Intl.NumberFormat('ko-KR').format(n) + '원';

const statusVariant = (s: string): 'default' | 'secondary' | 'outline' => {
  switch (s) {
    case 'paid': return 'default';
    case 'confirmed': return 'secondary';
    default: return 'outline';
  }
};

export default function PayrollPage() {
  const savedPayrolls = usePayrollStore((s) => s.savedPayrolls);
  const updatePayrollStatus = usePayrollStore((s) => s.updatePayrollStatus);
  const deletePayroll = usePayrollStore((s) => s.deletePayroll);

  const [filterYear, setFilterYear] = useState('2026');
  const [filterMonth, setFilterMonth] = useState('all');

  const filtered = useMemo(() => {
    return savedPayrolls
      .filter((p) => {
        if (p.year !== Number(filterYear)) return false;
        if (filterMonth !== 'all' && p.month !== Number(filterMonth)) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.month !== b.month) return b.month - a.month;
        return a.employee_id.localeCompare(b.employee_id);
      });
  }, [savedPayrolls, filterYear, filterMonth]);

  const totalEarnings = filtered.reduce((s, p) => s + p.total_earnings, 0);
  const totalDeductions = filtered.reduce((s, p) => s + p.total_deductions, 0);
  const totalNetPay = filtered.reduce((s, p) => s + p.net_pay, 0);

  const handleStatusChange = (id: string, status: PayrollStatus) => {
    updatePayrollStatus(id, status);
    toast.success(`급여 상태가 "${PAYROLL_STATUS[status]}"(으)로 변경되었습니다.`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('이 급여 기록을 삭제하시겠습니까?')) {
      deletePayroll(id);
      toast.success('급여 기록이 삭제되었습니다.');
    }
  };

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">급여관리</h1>
        <Link href="/payroll/calculate">
          <Button>
            <Calculator className="h-4 w-4 mr-2" />
            급여 계산
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">총 지급액</p>
            <p className="text-xl font-bold">{fmtWon(totalEarnings)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">총 공제액</p>
            <p className="text-xl font-bold text-destructive">{fmtWon(totalDeductions)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">총 실수령액</p>
            <p className="text-xl font-bold text-primary">{fmtWon(totalNetPay)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}월</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-2">{filtered.length}건</span>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">급여 대장</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>부서</TableHead>
                  <TableHead>기간</TableHead>
                  <TableHead className="text-right">기본급</TableHead>
                  <TableHead className="text-right">총 지급액</TableHead>
                  <TableHead className="text-right">총 공제액</TableHead>
                  <TableHead className="text-right">실수령액</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      해당 기간의 급여 기록이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => {
                    const emp = demoEmployees.find((e) => e.id === p.employee_id);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{emp?.name ?? p.employee_id}</TableCell>
                        <TableCell>{emp?.department ?? ''}</TableCell>
                        <TableCell className="text-sm">{p.year}년 {p.month}월</TableCell>
                        <TableCell className="text-right font-mono text-sm">{fmtWon(p.base_salary)}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{fmtWon(p.total_earnings)}</TableCell>
                        <TableCell className="text-right font-mono text-sm text-destructive">{fmtWon(p.total_deductions)}</TableCell>
                        <TableCell className="text-right font-mono text-sm font-bold">{fmtWon(p.net_pay)}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(p.status)} className="text-xs">
                            {PAYROLL_STATUS[p.status as keyof typeof PAYROLL_STATUS] ?? p.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Link href={`/payroll/payslip/${p.id}`}>
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                <FileText className="h-3 w-3" />
                              </Button>
                            </Link>
                            {p.status === 'draft' && (
                              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleStatusChange(p.id, 'confirmed')}>
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                            {p.status === 'confirmed' && (
                              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleStatusChange(p.id, 'paid')}>
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              </Button>
                            )}
                            {p.status === 'draft' && (
                              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleDelete(p.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
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
  );
}
