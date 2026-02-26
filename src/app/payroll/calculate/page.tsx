'use client';

import { useState } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { usePayrollStore, demoEmployeeSalaries, MONTHLY_WORK_HOURS } from '@/lib/stores/payroll-store';
import { demoEmployees } from '@/lib/stores/leave-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { calculateInsurance } from '@/lib/utils/insurance';
import { calculateMonthlyIncomeTax } from '@/lib/utils/korean-tax';
import PayrollItemSettings from '@/components/payroll/payroll-item-settings';
import type { PayrollLineItem, SavedPayroll } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, Settings2, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const fmtWon = (n: number) => new Intl.NumberFormat('ko-KR').format(n);

export default function PayrollCalculatePage() {
  const payrollItems = usePayrollStore((s) => s.payrollItems);
  const savePayroll = usePayrollStore((s) => s.savePayroll);
  const payrollSettings = useSettingsStore((s) => s.payroll);

  const [employeeId, setEmployeeId] = useState('');
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('2');
  const [dependents, setDependents] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [formulaExpanded, setFormulaExpanded] = useState(true);

  // Per-item toggle and amount inputs
  const [itemEnabled, setItemEnabled] = useState<Record<string, boolean>>({});
  const [itemAmounts, setItemAmounts] = useState<Record<string, number>>({});
  const [itemHours, setItemHours] = useState<Record<string, number>>({});

  const [result, setResult] = useState<{
    earnings: PayrollLineItem[];
    deductions: PayrollLineItem[];
    totalEarnings: number;
    totalDeductions: number;
    netPay: number;
    taxableIncome: number;
    hourlyWage: number;
  } | null>(null);

  const activeEarnings = payrollItems
    .filter((pi) => pi.category === 'earning' && pi.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  const activeDeductions = payrollItems
    .filter((pi) => pi.category === 'deduction' && pi.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  const selectedEmployee = demoEmployees.find((e) => e.id === employeeId);
  const baseSalary = employeeId ? (demoEmployeeSalaries[employeeId] ?? 0) : 0;

  // Initialize item states when employee changes
  const handleEmployeeChange = (id: string) => {
    setEmployeeId(id);
    setResult(null);
    const salary = demoEmployeeSalaries[id] ?? 0;
    const enabled: Record<string, boolean> = {};
    const amounts: Record<string, number> = {};
    const hours: Record<string, number> = {};
    for (const item of payrollItems) {
      if (item.category === 'earning' && item.is_active) {
        enabled[item.id] = item.code === 'base_salary' || item.default_amount > 0;
        if (item.code === 'base_salary') {
          amounts[item.id] = salary;
        } else if (item.calc_type === 'fixed') {
          amounts[item.id] = item.default_amount;
        } else if (item.calc_type === 'hours_rate') {
          hours[item.id] = 0;
        }
      }
    }
    setItemEnabled(enabled);
    setItemAmounts(amounts);
    setItemHours(hours);
  };

  const toggleItem = (id: string) => {
    setItemEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCalculate = () => {
    if (!employeeId) {
      toast.error('직원을 선택해주세요.');
      return;
    }

    const hourlyWage = Math.round(baseSalary / MONTHLY_WORK_HOURS);
    const earnings: PayrollLineItem[] = [];
    let totalEarnings = 0;
    let taxableIncome = 0;

    // Calculate earnings
    for (const item of activeEarnings) {
      if (!itemEnabled[item.id]) continue;
      let amount = 0;
      let formula = '';

      if (item.code === 'base_salary') {
        amount = itemAmounts[item.id] ?? baseSalary;
        formula = `${fmtWon(amount)}원 (기본급)`;
      } else if (item.calc_type === 'fixed') {
        amount = itemAmounts[item.id] ?? item.default_amount;
        formula = item.is_taxable
          ? `${fmtWon(amount)}원 (과세)`
          : `${fmtWon(amount)}원 (비과세)`;
      } else if (item.calc_type === 'hours_rate') {
        const hours = itemHours[item.id] ?? 0;
        const multiplier = item.rate_multiplier ?? 1;
        amount = Math.round(hourlyWage * multiplier * hours);
        formula = `${fmtWon(hourlyWage)}원(시급) × ${multiplier} × ${hours}시간 = ${fmtWon(amount)}원`;
      }

      if (amount > 0) {
        earnings.push({
          item_id: item.id,
          name: item.name,
          category: 'earning',
          amount,
          is_taxable: item.is_taxable,
          formula,
        });
        totalEarnings += amount;
        if (item.is_taxable) taxableIncome += amount;
      }
    }

    // Calculate deductions
    const deductions: PayrollLineItem[] = [];
    let totalDeductions = 0;
    const insurance = calculateInsurance(taxableIncome);
    const tax = calculateMonthlyIncomeTax(taxableIncome, dependents);

    for (const item of activeDeductions) {
      let amount = 0;
      let formula = '';

      switch (item.code) {
        case 'national_pension': {
          amount = insurance.nationalPension;
          const pensionBase = Math.min(Math.max(taxableIncome, 370000), 5900000);
          formula = `min(${fmtWon(taxableIncome)}, 5,900,000) × ${payrollSettings.national_pension_rate}%\n= ${fmtWon(pensionBase)} × ${payrollSettings.national_pension_rate}% = ${fmtWon(amount)}원`;
          break;
        }
        case 'health_insurance':
          amount = insurance.healthInsurance;
          formula = `${fmtWon(taxableIncome)} × ${payrollSettings.health_insurance_rate}% = ${fmtWon(amount)}원`;
          break;
        case 'long_term_care':
          amount = insurance.longTermCare;
          formula = `${fmtWon(insurance.healthInsurance)}(건강보험료) × ${payrollSettings.long_term_care_rate}% = ${fmtWon(amount)}원`;
          break;
        case 'employment_insurance':
          amount = insurance.employmentInsurance;
          formula = `${fmtWon(taxableIncome)} × ${payrollSettings.employment_insurance_rate}% = ${fmtWon(amount)}원`;
          break;
        case 'income_tax':
          amount = tax.incomeTax;
          formula = `연 과세소득 ${fmtWon(taxableIncome * 12)}원 → 근로소득공제 → 인적공제(${dependents}인)\n→ 세율 적용 → 월할 = ${fmtWon(amount)}원`;
          break;
        case 'local_tax':
          amount = tax.localTax;
          formula = `${fmtWon(tax.incomeTax)}(소득세) × 10% = ${fmtWon(amount)}원`;
          break;
      }

      if (amount > 0) {
        deductions.push({
          item_id: item.id,
          name: item.name,
          category: 'deduction',
          amount,
          is_taxable: false,
          formula,
        });
        totalDeductions += amount;
      }
    }

    setResult({
      earnings,
      deductions,
      totalEarnings,
      totalDeductions,
      netPay: totalEarnings - totalDeductions,
      taxableIncome,
      hourlyWage,
    });

    toast.success('급여가 계산되었습니다.');
  };

  const handleSave = () => {
    if (!result || !employeeId) return;
    const payroll: SavedPayroll = {
      id: `sp-${employeeId}-${year}-${month.padStart(2, '0')}`,
      employee_id: employeeId,
      year: Number(year),
      month: Number(month),
      base_salary: baseSalary,
      items: [...result.earnings, ...result.deductions],
      total_earnings: result.totalEarnings,
      total_deductions: result.totalDeductions,
      net_pay: result.netPay,
      dependents,
      status: 'draft',
      created_at: new Date().toISOString().slice(0, 10),
    };
    savePayroll(payroll);
    toast.success('급여가 저장되었습니다.');
  };

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">급여 계산</h1>
        <Button variant="outline" onClick={() => setSettingsOpen(true)}>
          <Settings2 className="h-4 w-4 mr-2" />
          항목 설정
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* === Left: Input === */}
        <div className="space-y-4">
          {/* Employee & Period Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">직원 / 기간 선택</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>직원</Label>
                <Select value={employeeId} onValueChange={handleEmployeeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="직원 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {demoEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} ({emp.department} / {emp.position_rank})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>연도</Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>월</Label>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}월</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {baseSalary > 0 && (
                <div className="text-sm p-2 rounded bg-muted space-y-1">
                  <div>기본급: <strong>{fmtWon(baseSalary)}원</strong></div>
                  <div>통상시급: <strong>{fmtWon(Math.round(baseSalary / MONTHLY_WORK_HOURS))}원</strong>
                    <span className="text-muted-foreground ml-1">({fmtWon(baseSalary)} ÷ {MONTHLY_WORK_HOURS}시간)</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Earning Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">지급 항목 선택</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeEarnings.map((item) => {
                const enabled = itemEnabled[item.id] ?? false;
                const isBase = item.code === 'base_salary';
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <Checkbox
                      checked={enabled}
                      onCheckedChange={() => toggleItem(item.id)}
                      disabled={isBase}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.name}</span>
                        {!item.is_taxable && (
                          <Badge variant="outline" className="text-xs">비과세</Badge>
                        )}
                        {item.calc_type === 'hours_rate' && (
                          <Badge variant="secondary" className="text-xs">×{item.rate_multiplier}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.formula_description}</p>
                    </div>
                    {enabled && item.calc_type === 'fixed' && (
                      <Input
                        type="number"
                        className="w-36 text-right"
                        value={itemAmounts[item.id] ?? ''}
                        onChange={(e) =>
                          setItemAmounts((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))
                        }
                        disabled={isBase}
                      />
                    )}
                    {enabled && item.calc_type === 'hours_rate' && (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          className="w-20 text-right"
                          value={itemHours[item.id] ?? ''}
                          onChange={(e) =>
                            setItemHours((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))
                          }
                          placeholder="0"
                        />
                        <span className="text-xs text-muted-foreground">시간</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {activeEarnings.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  활성화된 지급 항목이 없습니다. &quot;항목 설정&quot;에서 추가해주세요.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Dependents & Calculate */}
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label>부양가족 수 (본인 포함)</Label>
                <Input
                  type="number"
                  min={1}
                  className="w-24"
                  value={dependents}
                  onChange={(e) => setDependents(Number(e.target.value))}
                />
              </div>
              <Button onClick={handleCalculate} className="w-full" disabled={!employeeId}>
                <Calculator className="h-4 w-4 mr-2" />
                계산하기
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* === Right: Result === */}
        <div>
          {result ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    계산 결과
                    {selectedEmployee && (
                      <span className="font-normal text-muted-foreground ml-2">
                        {selectedEmployee.name} / {year}년 {month}월
                      </span>
                    )}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormulaExpanded(!formulaExpanded)}
                  >
                    {formulaExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span className="ml-1 text-xs">{formulaExpanded ? '계산식 접기' : '계산식 펼치기'}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary info */}
                <div className="text-sm p-2 rounded bg-muted space-y-1">
                  <div>과세소득: <strong>{fmtWon(result.taxableIncome)}원</strong></div>
                  <div>통상시급: <strong>{fmtWon(result.hourlyWage)}원</strong>
                    <span className="text-muted-foreground ml-1">({fmtWon(baseSalary)} ÷ {MONTHLY_WORK_HOURS}h)</span>
                  </div>
                </div>

                {/* Earnings */}
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-muted-foreground">지급 내역</h3>
                  {result.earnings.map((item) => (
                    <div key={item.item_id} className="py-1.5">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{item.name}</span>
                          {!item.is_taxable && (
                            <Badge variant="outline" className="text-[10px] h-4">비과세</Badge>
                          )}
                        </div>
                        <span className="font-mono">{fmtWon(item.amount)}원</span>
                      </div>
                      {formulaExpanded && (
                        <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap pl-2 border-l-2 border-muted">
                          {item.formula}
                        </p>
                      )}
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-semibold text-sm pt-1">
                    <span>총 지급액</span>
                    <span className="font-mono">{fmtWon(result.totalEarnings)}원</span>
                  </div>
                </div>

                <Separator />

                {/* Deductions */}
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-muted-foreground">공제 내역</h3>
                  {result.deductions.map((item) => (
                    <div key={item.item_id} className="py-1.5">
                      <div className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="font-mono text-destructive">{fmtWon(item.amount)}원</span>
                      </div>
                      {formulaExpanded && (
                        <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap pl-2 border-l-2 border-muted">
                          {item.formula}
                        </p>
                      )}
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-semibold text-sm pt-1">
                    <span>총 공제액</span>
                    <span className="font-mono text-destructive">{fmtWon(result.totalDeductions)}원</span>
                  </div>
                </div>

                <Separator />

                {/* Net Pay */}
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>실수령액</span>
                  <span className="text-primary font-mono">{fmtWon(result.netPay)}원</span>
                </div>

                <Button onClick={handleSave} className="w-full mt-4" variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  급여 저장
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>직원을 선택하고 지급 항목을 설정한 후</p>
                <p>&quot;계산하기&quot; 버튼을 눌러주세요.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <PayrollItemSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
