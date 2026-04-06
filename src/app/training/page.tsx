'use client';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, MapPin, Users, User, GraduationCap, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useCodeMap, CODE } from '@/lib/hooks/use-code';

const programs = [
  { id: '1', title: '신입사원 OJT 교육', category: '직무교육', instructor: '김팀장', location: '본사 교육실', startDate: '2026-03-02', endDate: '2026-03-06', maxParticipants: 20, enrolled: 8, status: 'planned' },
  { id: '2', title: '리더십 역량 강화', category: '리더십', instructor: '외부강사', location: '외부 교육센터', startDate: '2026-02-24', endDate: '2026-02-25', maxParticipants: 15, enrolled: 12, status: 'planned' },
  { id: '3', title: '정보보안 교육', category: '법정교육', instructor: '보안팀', location: '온라인', startDate: '2026-02-10', endDate: '2026-02-10', maxParticipants: null, enrolled: 95, status: 'completed' },
  { id: '4', title: 'React/Next.js 심화', category: '직무교육', instructor: '이시니어', location: '개발1팀 회의실', startDate: '2026-02-17', endDate: '2026-02-21', maxParticipants: 10, enrolled: 10, status: 'in_progress' },
];

const statusVariant = (s: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (s) {
    case 'in_progress': return 'default';
    case 'completed': return 'secondary';
    case 'cancelled': return 'destructive';
    default: return 'outline';
  }
};

const trainingBorderColor: Record<string, string> = {
  in_progress: 'border-l-accent-blue',
  planned: 'border-l-accent-amber',
  completed: 'border-l-accent-green',
  cancelled: 'border-l-red-400',
};

export default function TrainingPage() {
  const TRAINING_STATUS = useCodeMap(CODE.TRAINING_STATUS);
  const inProgressCount = programs.filter((p) => p.status === 'in_progress').length;
  const plannedCount = programs.filter((p) => p.status === 'planned').length;
  const completedCount = programs.filter((p) => p.status === 'completed').length;

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">교육관리</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          교육과정 등록
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard title="전체 과정" value={programs.length} icon={GraduationCap} color="blue" />
        <StatsCard title="진행중" value={inProgressCount} icon={BookOpen} color="purple" />
        <StatsCard title="예정" value={plannedCount} icon={Calendar} color="amber" />
        <StatsCard title="완료" value={completedCount} icon={CheckCircle} color="green" />
      </div>

      <div className="grid gap-4">
        {programs.map((prog) => (
          <Link key={prog.id} href={`/training/${prog.id}`}>
            <Card className={`hover:shadow-md transition-shadow cursor-pointer border-l-4 ${trainingBorderColor[prog.status] ?? ''}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{prog.title}</h3>
                      <Badge variant={statusVariant(prog.status)} className="text-xs">
                        {TRAINING_STATUS[prog.status] ?? prog.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{prog.category}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {prog.instructor}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {prog.location}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {prog.startDate} ~ {prog.endDate}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {prog.enrolled}{prog.maxParticipants ? `/${prog.maxParticipants}` : ''}명
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
