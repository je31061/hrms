'use client';

import { use } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const period = {
  name: '2025년 하반기 평가',
  year: 2025,
  half: 'H2',
  startDate: '2025-12-01',
  endDate: '2025-12-31',
  status: 'completed',
};

const evaluations = [
  { id: '1', employee: '김철수', department: '개발1팀', evaluator: '이팀장', type: 'manager', totalScore: 88.5, grade: 'A', status: 'confirmed' },
  { id: '2', employee: '이영희', department: '개발1팀', evaluator: '이팀장', type: 'manager', totalScore: 92.0, grade: 'S', status: 'confirmed' },
  { id: '3', employee: '박민수', department: '인사팀', evaluator: '한팀장', type: 'manager', totalScore: 75.0, grade: 'B', status: 'confirmed' },
  { id: '4', employee: '최지은', department: '재무팀', evaluator: '장팀장', type: 'manager', totalScore: 82.5, grade: 'A', status: 'confirmed' },
  { id: '5', employee: '정우진', department: '개발1팀', evaluator: '이팀장', type: 'manager', totalScore: 70.0, grade: 'B', status: 'submitted' },
];

const gradeVariant = (grade: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (grade) {
    case 'S': return 'default';
    case 'A': return 'default';
    case 'B': return 'secondary';
    case 'C': return 'outline';
    case 'D': return 'destructive';
    default: return 'outline';
  }
};

const gradeDistribution = { S: 1, A: 2, B: 2, C: 0, D: 0 };

export default function EvaluationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">{period.name}</h1>
        <Badge variant="secondary">완료</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 mb-6">
        {Object.entries(gradeDistribution).map(([grade, count]) => (
          <Card key={grade}>
            <CardContent className="pt-4 text-center">
              <Badge variant={gradeVariant(grade)} className="text-lg px-3 py-1">{grade}</Badge>
              <p className="text-2xl font-bold mt-2">{count}명</p>
              <p className="text-xs text-muted-foreground">{Math.round((count / evaluations.length) * 100)}%</p>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">평균 점수</p>
            <p className="text-2xl font-bold">{(evaluations.reduce((s, e) => s + e.totalScore, 0) / evaluations.length).toFixed(1)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">평가 결과</CardTitle></CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>피평가자</TableHead>
                  <TableHead>부서</TableHead>
                  <TableHead>평가자</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead className="text-center">점수</TableHead>
                  <TableHead className="text-center">등급</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{ev.employee.charAt(0)}</AvatarFallback></Avatar>
                        <span className="font-medium">{ev.employee}</span>
                      </div>
                    </TableCell>
                    <TableCell>{ev.department}</TableCell>
                    <TableCell>{ev.evaluator}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{ev.type === 'manager' ? '상사평가' : ev.type}</Badge></TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-2">
                        <Progress value={ev.totalScore} className="w-16 h-2" />
                        <span className="text-sm font-mono">{ev.totalScore}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={gradeVariant(ev.grade)} className="font-bold">{ev.grade}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ev.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                        {ev.status === 'confirmed' ? '확정' : '제출'}
                      </Badge>
                    </TableCell>
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
