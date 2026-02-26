import { Users, Clock, CalendarDays, Briefcase } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { HeadcountChart } from '@/components/dashboard/headcount-chart';
import { RecentEvents } from '@/components/dashboard/recent-events';
import { Breadcrumb } from '@/components/layout/breadcrumb';

// Demo data - in production these come from Supabase
const statsData = [
  { title: '전체 임직원', value: '127', icon: Users, description: '정규직 115 / 계약직 12' },
  { title: '금일 출근', value: '98', icon: Clock, description: '출근율 77.2%', trend: { value: 2.1, label: '전주 대비' } },
  { title: '휴가 중', value: '8', icon: CalendarDays, description: '연차 5 / 병가 2 / 기타 1' },
  { title: '진행 중 채용', value: '3', icon: Briefcase, description: '총 지원자 45명' },
];

const headcountData = [
  { department: '인사팀', count: 8 },
  { department: '재무팀', count: 6 },
  { department: '총무팀', count: 5 },
  { department: '개발1팀', count: 25 },
  { department: '개발2팀', count: 20 },
  { department: 'QA팀', count: 12 },
  { department: '국내영업', count: 15 },
  { department: '해외영업', count: 10 },
];

const recentEvents = [
  { id: '1', type: 'hire' as const, title: '김신입 사원 입사', date: '2026-02-19', description: '개발1팀' },
  { id: '2', type: 'appointment' as const, title: '이과장 → 차장 승진', date: '2026-02-17', description: '개발2팀' },
  { id: '3', type: 'leave' as const, title: '박대리 연차 사용', date: '2026-02-16', description: '2/16 ~ 2/18' },
  { id: '4', type: 'birthday' as const, title: '최부장 생일', date: '2026-02-20', description: 'QA팀' },
  { id: '5', type: 'hire' as const, title: '정인턴 입사', date: '2026-02-15', description: '인사팀 인턴' },
];

export default function DashboardPage() {
  return (
    <div>
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {statsData.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <HeadcountChart data={headcountData} />
        <RecentEvents events={recentEvents} />
      </div>
    </div>
  );
}
