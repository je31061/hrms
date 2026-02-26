import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const monthlyData = [
  { name: '김철수', department: '개발1팀', workDays: 20, lateDays: 0, absentDays: 0, leaveDays: 1, overtimeHours: 15.5 },
  { name: '이영희', department: '개발1팀', workDays: 19, lateDays: 2, absentDays: 0, leaveDays: 2, overtimeHours: 5.0 },
  { name: '박민수', department: '인사팀', workDays: 21, lateDays: 0, absentDays: 0, leaveDays: 0, overtimeHours: 3.0 },
  { name: '최지은', department: '재무팀', workDays: 18, lateDays: 1, absentDays: 1, leaveDays: 1, overtimeHours: 8.5 },
  { name: '정우진', department: '개발1팀', workDays: 21, lateDays: 0, absentDays: 0, leaveDays: 0, overtimeHours: 20.0 },
];

export default function MonthlyAttendancePage() {
  return (
    <div>
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-6">월별 근태 현황</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">2026년 2월 근태 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>부서</TableHead>
                  <TableHead className="text-center">근무일</TableHead>
                  <TableHead className="text-center">지각</TableHead>
                  <TableHead className="text-center">결근</TableHead>
                  <TableHead className="text-center">휴가</TableHead>
                  <TableHead className="text-center">연장근무(h)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell className="text-center">{row.workDays}</TableCell>
                    <TableCell className="text-center">
                      {row.lateDays > 0 ? (
                        <Badge variant="destructive" className="text-xs">{row.lateDays}</Badge>
                      ) : '0'}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.absentDays > 0 ? (
                        <Badge variant="destructive" className="text-xs">{row.absentDays}</Badge>
                      ) : '0'}
                    </TableCell>
                    <TableCell className="text-center">{row.leaveDays}</TableCell>
                    <TableCell className="text-center">{row.overtimeHours}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
