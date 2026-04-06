'use client';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const fmtWon = (n: number) => new Intl.NumberFormat('ko-KR').format(n) + '원';
const fmtRate = (n: number) => n.toFixed(3) + '%';

const INSURANCE_RATES = {
  nationalPension: 0.045,
  healthInsurance: 0.03545,
  longTermCare: 0.1281,
  employmentInsurance: 0.009,
};

const employees = [
  { name: '김민수', department: '개발팀', baseSalary: 4500000 },
  { name: '이서연', department: '인사팀', baseSalary: 3800000 },
  { name: '박준호', department: '영업팀', baseSalary: 4200000 },
  { name: '정유진', department: '마케팅팀', baseSalary: 3600000 },
  { name: '최동현', department: '개발팀', baseSalary: 5200000 },
  { name: '한소희', department: '경영지원팀', baseSalary: 3400000 },
  { name: '윤재석', department: '개발팀', baseSalary: 4800000 },
  { name: '강미래', department: '디자인팀', baseSalary: 3900000 },
];

function calcInsurance(baseSalary: number) {
  const nationalPension = Math.round(baseSalary * INSURANCE_RATES.nationalPension);
  const healthInsurance = Math.round(baseSalary * INSURANCE_RATES.healthInsurance);
  const longTermCare = Math.round(healthInsurance * INSURANCE_RATES.longTermCare);
  const employmentInsurance = Math.round(baseSalary * INSURANCE_RATES.employmentInsurance);
  const total = nationalPension + healthInsurance + longTermCare + employmentInsurance;
  return { nationalPension, healthInsurance, longTermCare, employmentInsurance, total };
}

const data = employees.map((emp) => ({
  ...emp,
  insurance: calcInsurance(emp.baseSalary),
}));

const totals = data.reduce(
  (acc, row) => ({
    baseSalary: acc.baseSalary + row.baseSalary,
    nationalPension: acc.nationalPension + row.insurance.nationalPension,
    healthInsurance: acc.healthInsurance + row.insurance.healthInsurance,
    longTermCare: acc.longTermCare + row.insurance.longTermCare,
    employmentInsurance: acc.employmentInsurance + row.insurance.employmentInsurance,
    total: acc.total + row.insurance.total,
  }),
  { baseSalary: 0, nationalPension: 0, healthInsurance: 0, longTermCare: 0, employmentInsurance: 0, total: 0 }
);

export default function InsurancePage() {
  return (
    <div>
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-6">4대보험 관리</h1>

      {/* Rate Cards */}
      <div className="grid gap-4 grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">국민연금</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">4.5%</p>
            <p className="text-xs text-muted-foreground mt-1">근로자 4.5% + 사업주 4.5%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">건강보험</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3.545%</p>
            <p className="text-xs text-muted-foreground mt-1">근로자 3.545% + 사업주 3.545%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">장기요양보험</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">12.81%</p>
            <p className="text-xs text-muted-foreground mt-1">건강보험료의 12.81%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">고용보험</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0.9%</p>
            <p className="text-xs text-muted-foreground mt-1">근로자 0.9% + 사업주 0.9%~1.65%</p>
          </CardContent>
        </Card>
      </div>

      {/* Insurance Deduction Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">사원별 4대보험 공제 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사원명</TableHead>
                  <TableHead>부서</TableHead>
                  <TableHead className="text-right">기본급</TableHead>
                  <TableHead className="text-right">국민연금</TableHead>
                  <TableHead className="text-right">건강보험</TableHead>
                  <TableHead className="text-right">장기요양</TableHead>
                  <TableHead className="text-right">고용보험</TableHead>
                  <TableHead className="text-right">합계</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{fmtWon(row.baseSalary)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{fmtWon(row.insurance.nationalPension)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{fmtWon(row.insurance.healthInsurance)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{fmtWon(row.insurance.longTermCare)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{fmtWon(row.insurance.employmentInsurance)}</TableCell>
                    <TableCell className="text-right font-mono text-sm font-bold">{fmtWon(row.insurance.total)}</TableCell>
                  </TableRow>
                ))}
                {/* Totals Row */}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={2}>합계</TableCell>
                  <TableCell className="text-right font-mono text-sm">{fmtWon(totals.baseSalary)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{fmtWon(totals.nationalPension)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{fmtWon(totals.healthInsurance)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{fmtWon(totals.longTermCare)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{fmtWon(totals.employmentInsurance)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{fmtWon(totals.total)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">사업주 vs 근로자 부담 안내</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-foreground mb-2">근로자 부담분</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>국민연금: 보수월액의 4.5%</li>
                <li>건강보험: 보수월액의 3.545%</li>
                <li>장기요양보험: 건강보험료의 12.81%</li>
                <li>고용보험: 보수월액의 0.9%</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">사업주 부담분</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>국민연금: 보수월액의 4.5%</li>
                <li>건강보험: 보수월액의 3.545%</li>
                <li>장기요양보험: 건강보험료의 12.81%</li>
                <li>고용보험: 보수월액의 0.9% + 고용안정/직업능력개발 0.25%~0.85%</li>
              </ul>
            </div>
          </div>
          <p className="pt-2 border-t">
            위 표는 <Badge variant="secondary">근로자 부담분</Badge>만 표시합니다. 사업주 부담분은 별도 납부됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
