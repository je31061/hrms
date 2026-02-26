'use client';

import { use } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { usePayrollStore } from '@/lib/stores/payroll-store';
import { demoEmployees } from '@/lib/stores/leave-store';
import { PAYROLL_STATUS } from '@/lib/constants/codes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import Link from 'next/link';

const fmtWon = (n: number) => new Intl.NumberFormat('ko-KR').format(n) + '원';

export default function PayslipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const savedPayrolls = usePayrollStore((s) => s.savedPayrolls);
  const payroll = savedPayrolls.find((p) => p.id === id);

  if (!payroll) {
    return (
      <div>
        <Breadcrumb />
        <h1 className="text-2xl font-bold mb-6">급여명세서</h1>
        <Card>
          <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
            급여 기록을 찾을 수 없습니다.
            <div className="mt-4">
              <Link href="/payroll">
                <Button variant="outline">급여 목록으로</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const emp = demoEmployees.find((e) => e.id === payroll.employee_id);
  const earningItems = payroll.items.filter((i) => i.category === 'earning');
  const deductionItems = payroll.items.filter((i) => i.category === 'deduction');

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">급여명세서</h1>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          인쇄
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-xl">급여명세서</CardTitle>
          <p className="text-muted-foreground">{payroll.year}년 {payroll.month}월</p>
          <Badge
            variant={payroll.status === 'paid' ? 'default' : payroll.status === 'confirmed' ? 'secondary' : 'outline'}
            className="mt-1"
          >
            {PAYROLL_STATUS[payroll.status as keyof typeof PAYROLL_STATUS]}
          </Badge>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">성명:</span>{' '}
              <strong>{emp?.name ?? payroll.employee_id}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">부서:</span>{' '}
              <strong>{emp?.department ?? ''}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">직급:</span>{' '}
              <strong>{emp?.position_rank ?? ''}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">부양가족:</span>{' '}
              <strong>{payroll.dependents}인</strong>
            </div>
          </div>

          <Separator />

          {/* Earnings & Deductions side by side */}
          <div className="grid grid-cols-2 gap-8">
            {/* Earnings */}
            <div>
              <h3 className="font-semibold mb-3">지급 항목</h3>
              <div className="space-y-3">
                {earningItems.map((item) => (
                  <div key={item.item_id}>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <span>{item.name}</span>
                        {!item.is_taxable && (
                          <Badge variant="outline" className="text-[10px] h-4">비과세</Badge>
                        )}
                      </div>
                      <span className="font-mono">{fmtWon(item.amount)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">
                      {item.formula}
                    </p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>지급합계</span>
                  <span className="font-mono">{fmtWon(payroll.total_earnings)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="font-semibold mb-3">공제 항목</h3>
              <div className="space-y-3">
                {deductionItems.map((item) => (
                  <div key={item.item_id}>
                    <div className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="font-mono text-destructive">{fmtWon(item.amount)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">
                      {item.formula}
                    </p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>공제합계</span>
                  <span className="font-mono text-destructive">{fmtWon(payroll.total_deductions)}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Net Pay */}
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">실수령액</p>
            <p className="text-3xl font-bold text-primary">{fmtWon(payroll.net_pay)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
