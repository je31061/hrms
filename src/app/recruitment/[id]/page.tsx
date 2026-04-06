'use client';

import { use } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, FileText } from 'lucide-react';
import { useCodeMap, CODE } from '@/lib/hooks/use-code';
import { toast } from 'sonner';

const posting = {
  title: '프론트엔드 개발자',
  department: '개발1팀',
  status: 'open',
  headcount: 2,
  startDate: '2026-02-01',
  endDate: '2026-03-01',
  description: 'React/Next.js 기반 웹 서비스 개발',
  requirements: '- React/Next.js 3년 이상 경험\n- TypeScript 필수\n- 우대: 인사시스템 개발 경험',
};

const applicants = [
  { id: '1', name: '강지민', email: 'kang@email.com', phone: '010-1111-2222', stage: 'interview', appliedAt: '2026-02-05' },
  { id: '2', name: '윤서연', email: 'yoon@email.com', phone: '010-3333-4444', stage: 'screening', appliedAt: '2026-02-10' },
  { id: '3', name: '임태호', email: 'lim@email.com', phone: '010-5555-6666', stage: 'offer', appliedAt: '2026-02-03' },
  { id: '4', name: '한소영', email: 'han@email.com', phone: '010-7777-8888', stage: 'applied', appliedAt: '2026-02-18' },
  { id: '5', name: '조민기', email: 'jo@email.com', phone: '010-9999-0000', stage: 'rejected', appliedAt: '2026-02-04' },
];

const stageVariant = (stage: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (stage) {
    case 'hired': case 'offer': return 'default';
    case 'interview': return 'secondary';
    case 'rejected': return 'destructive';
    default: return 'outline';
  }
};

const stages = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'] as const;

export default function RecruitmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const APPLICANT_STAGES = useCodeMap(CODE.APPLICANT_STAGES);
  const { id } = use(params);

  const stageCounts = stages.reduce((acc, s) => {
    acc[s] = applicants.filter(a => a.stage === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">{posting.title}</h1>
        <Badge variant="default">진행중</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">공고 정보</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">부서:</span> <strong>{posting.department}</strong></div>
            <div><span className="text-muted-foreground">채용인원:</span> <strong>{posting.headcount}명</strong></div>
            <div><span className="text-muted-foreground">기간:</span> <strong>{posting.startDate} ~ {posting.endDate}</strong></div>
            <div><span className="text-muted-foreground">설명:</span> <p className="mt-1">{posting.description}</p></div>
            <div><span className="text-muted-foreground">자격요건:</span> <p className="mt-1 whitespace-pre-line">{posting.requirements}</p></div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">채용 파이프라인</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {stages.map((stage) => (
                <div key={stage} className="flex-1 text-center p-2 border rounded-lg min-w-[80px]">
                  <p className="text-xs text-muted-foreground">{APPLICANT_STAGES[stage]}</p>
                  <p className="text-xl font-bold">{stageCounts[stage] || 0}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">지원자 목록 ({applicants.length}명)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {applicants.map((app) => (
              <div key={app.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <Avatar>
                  <AvatarFallback>{app.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{app.name}</span>
                    <Badge variant={stageVariant(app.stage)} className="text-xs">
                      {APPLICANT_STAGES[app.stage as keyof typeof APPLICANT_STAGES]}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {app.email}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {app.phone}</span>
                    <span>지원일: {app.appliedAt}</span>
                  </div>
                </div>
                <Select defaultValue={app.stage} onValueChange={() => toast.success('단계가 변경되었습니다.')}>
                  <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {stages.map((s) => (
                      <SelectItem key={s} value={s}>{APPLICANT_STAGES[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
