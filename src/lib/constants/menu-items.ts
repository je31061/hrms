import {
  LayoutDashboard,
  UserCircle,
  Network,
  Users,
  Clock,
  CalendarDays,
  Banknote,
  ArrowRightLeft,
  FileCheck,
  Briefcase,
  GraduationCap,
  Star,
  ListChecks,
  ShieldAlert,
  Settings,
  AlertTriangle,
} from 'lucide-react';

export interface MenuItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  description: string;
}

export const ALL_MENU_ITEMS: MenuItem[] = [
  { href: '/', label: '대시보드', icon: LayoutDashboard, description: '메인 대시보드' },
  { href: '/my', label: '마이페이지', icon: UserCircle, description: '내 정보 관리' },
  { href: '/organization', label: '조직도', icon: Network, description: '조직 구조 관리' },
  { href: '/employees', label: '인사정보', icon: Users, description: '사원 정보 관리' },
  { href: '/attendance', label: '근태관리', icon: Clock, description: '출퇴근/근태 관리' },
  { href: '/leave', label: '휴가관리', icon: CalendarDays, description: '휴가 신청/관리' },
  { href: '/payroll', label: '급여관리', icon: Banknote, description: '급여 계산/관리' },
  { href: '/appointments', label: '인사발령', icon: ArrowRightLeft, description: '인사발령 관리' },
  { href: '/approval', label: '전자결재', icon: FileCheck, description: '전자결재 시스템' },
  { href: '/recruitment', label: '채용관리', icon: Briefcase, description: '채용 프로세스' },
  { href: '/training', label: '교육관리', icon: GraduationCap, description: '교육/연수 관리' },
  { href: '/workflows', label: '업무프로세스', icon: ListChecks, description: '업무 워크플로우' },
  { href: '/issues', label: 'HR이슈', icon: AlertTriangle, description: 'HR 이슈 관리' },
  { href: '/audit-log', label: '감사로그', icon: ShieldAlert, description: '시스템 감사 로그' },
  { href: '/settings', label: '설정', icon: Settings, description: '시스템 설정' },
];
