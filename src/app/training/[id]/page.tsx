'use client';

import { use } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, MapPin, User, Users } from 'lucide-react';
import { toast } from 'sonner';

const program = {
  title: 'React/Next.js 심화',
  category: '직무교육',
  description: 'React 18, Next.js 15 App Router, Server Components 등 최신 프론트엔드 기술 심화 교육',
  instructor: '이시니어',
  location: '개발1팀 회의실',
  startDate: '2026-02-17',
  endDate: '2026-02-21',
  maxParticipants: 10,
  status: 'in_progress',
};

const enrollments = [
  { id: '1', name: '김철수', department: '개발1팀', status: 'enrolled', score: null },
  { id: '2', name: '이영희', department: '개발1팀', status: 'enrolled', score: null },
  { id: '3', name: '정우진', department: '개발1팀', status: 'enrolled', score: null },
  { id: '4', name: '강지수', department: '개발2팀', status: 'enrolled', score: null },
  { id: '5', name: '박서준', department: '개발2팀', status: 'completed', score: 92.5 },
];

const statusLabel: Record<string, string> = {
  enrolled: '수강중',
  completed: '수료',
  cancelled: '취소',
  no_show: '미참석',
};

export default function TrainingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">{program.title}</h1>
        <Badge variant="default">진행중</Badge>
        <Badge variant="outline">{program.category}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">교육 정보</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> 강사: <strong>{program.instructor}</strong></div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> 장소: <strong>{program.location}</strong></div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> 기간: <strong>{program.startDate} ~ {program.endDate}</strong></div>
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /> 정원: <strong>{enrollments.length}/{program.maxParticipants}명</strong></div>
            <div className="pt-2">
              <p className="text-muted-foreground">교육 설명</p>
              <p className="mt-1">{program.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">수강생 목록</CardTitle>
              <Button size="sm" onClick={() => toast.success('수강생이 추가되었습니다.')}>수강생 추가</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>부서</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>점수</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{e.name.charAt(0)}</AvatarFallback></Avatar>
                          <span className="font-medium">{e.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{e.department}</TableCell>
                      <TableCell>
                        <Badge variant={e.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {statusLabel[e.status] ?? e.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{e.score !== null ? `${e.score}점` : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
