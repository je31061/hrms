'use client';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Users, Calendar, Briefcase, FileText } from 'lucide-react';
import Link from 'next/link';
import { useCodeMap, CODE } from '@/lib/hooks/use-code';

const postings = [
  { id: '1', title: '프론트엔드 개발자', department: '개발1팀', rank: '대리~과장', type: '정규직', headcount: 2, applicants: 15, status: 'open', startDate: '2026-02-01', endDate: '2026-03-01' },
  { id: '2', title: '백엔드 개발자', department: '개발2팀', rank: '사원~대리', type: '정규직', headcount: 3, applicants: 22, status: 'open', startDate: '2026-02-10', endDate: '2026-03-15' },
  { id: '3', title: '인사담당자', department: '인사팀', rank: '대리', type: '정규직', headcount: 1, applicants: 8, status: 'open', startDate: '2026-02-15', endDate: '2026-03-20' },
  { id: '4', title: 'QA 엔지니어', department: 'QA팀', rank: '사원', type: '계약직', headcount: 2, applicants: 12, status: 'closed', startDate: '2026-01-01', endDate: '2026-01-31' },
];

const statusVariant = (s: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (s) {
    case 'open': return 'default';
    case 'closed': return 'secondary';
    case 'cancelled': return 'destructive';
    default: return 'outline';
  }
};

const borderColor: Record<string, string> = {
  open: 'border-l-accent-green',
  draft: 'border-l-accent-amber',
  closed: 'border-l-gray-400',
  cancelled: 'border-l-red-400',
};

export default function RecruitmentPage() {
  const JOB_POSTING_STATUS = useCodeMap(CODE.JOB_POSTING_STATUS);
  const openCount = postings.filter((p) => p.status === 'open').length;
  const totalApplicants = postings.reduce((s, p) => s + p.applicants, 0);
  const totalHeadcount = postings.reduce((s, p) => s + p.headcount, 0);

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">채용관리</h1>
        <Link href="/recruitment/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            채용공고 등록
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatsCard title="전체 공고" value={postings.length} icon={FileText} color="blue" />
        <StatsCard title="진행중" value={openCount} icon={Briefcase} color="green" />
        <StatsCard title="총 지원자" value={totalApplicants} icon={Users} color="purple" description={`채용 예정 ${totalHeadcount}명`} />
      </div>

      <div className="grid gap-4">
        {postings.map((posting) => (
          <Link key={posting.id} href={`/recruitment/${posting.id}`}>
            <Card className={`hover:shadow-md transition-shadow cursor-pointer border-l-4 ${borderColor[posting.status] ?? ''}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{posting.title}</h3>
                      <Badge variant={statusVariant(posting.status)} className="text-xs">
                        {JOB_POSTING_STATUS[posting.status] ?? posting.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {posting.department} · {posting.rank} · {posting.type}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        채용 {posting.headcount}명 / 지원 {posting.applicants}명
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {posting.startDate} ~ {posting.endDate}
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
