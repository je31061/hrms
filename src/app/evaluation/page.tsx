import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import { EVALUATION_STATUS } from '@/lib/constants/codes';

const periods = [
  { id: '1', name: '2026년 상반기 평가', year: 2026, half: 'H1', startDate: '2026-06-01', endDate: '2026-06-30', status: 'draft', evaluations: 0, totalTarget: 127 },
  { id: '2', name: '2025년 하반기 평가', year: 2025, half: 'H2', startDate: '2025-12-01', endDate: '2025-12-31', status: 'completed', evaluations: 120, totalTarget: 120 },
  { id: '3', name: '2025년 상반기 평가', year: 2025, half: 'H1', startDate: '2025-06-01', endDate: '2025-06-30', status: 'completed', evaluations: 115, totalTarget: 115 },
];

const statusVariant = (s: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (s) {
    case 'in_progress': return 'default';
    case 'completed': return 'secondary';
    default: return 'outline';
  }
};

export default function EvaluationPage() {
  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">평가관리</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          평가 기간 등록
        </Button>
      </div>

      <div className="grid gap-4">
        {periods.map((period) => (
          <Link key={period.id} href={`/evaluation/${period.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{period.name}</h3>
                      <Badge variant={statusVariant(period.status)} className="text-xs">
                        {EVALUATION_STATUS[period.status as keyof typeof EVALUATION_STATUS] ?? period.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {period.startDate} ~ {period.endDate}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 평가 완료: {period.evaluations}/{period.totalTarget}명</span>
                    </div>
                  </div>
                  {period.status === 'completed' && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">완료율</p>
                      <p className="text-lg font-bold">{Math.round((period.evaluations / period.totalTarget) * 100)}%</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
