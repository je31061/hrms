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
  GraduationCap,
  ShieldAlert,
  Settings,
  FileSignature,
} from 'lucide-react';

export interface MenuItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  description: string;
  group?: string;
}

export type MenuGroup = {
  label: string;
  items: MenuItem[];
};

export const ALL_MENU_ITEMS: MenuItem[] = [
  // 홈
  { href: '/', label: '대시보드', icon: LayoutDashboard, description: '메인 대시보드', group: '홈' },
  { href: '/my', label: '마이페이지', icon: UserCircle, description: '내 정보 관리', group: '홈' },
  // 인사관리
  { href: '/organization', label: '조직도', icon: Network, description: '조직 구조 관리', group: '인사관리' },
  { href: '/employees', label: '인사정보', icon: Users, description: '사원 정보 관리', group: '인사관리' },
  { href: '/appointments', label: '인사발령', icon: ArrowRightLeft, description: '인사발령 관리', group: '인사관리' },
  // 근무관리
  { href: '/attendance', label: '근태관리', icon: Clock, description: '출퇴근/근태 관리', group: '근무관리' },
  { href: '/leave', label: '휴가관리', icon: CalendarDays, description: '휴가 신청/관리', group: '근무관리' },
  // 급여관리
  { href: '/payroll', label: '급여관리', icon: Banknote, description: '급여 계산/관리', group: '급여관리' },
  // 인재개발
  { href: '/training', label: '교육관리', icon: GraduationCap, description: '교육 과정/이수 관리', group: '인재개발' },
  // 업무지원
  { href: '/approval', label: '전자결재', icon: FileCheck, description: '전자결재 시스템', group: '업무지원' },
  { href: '/contracts', label: '전자계약', icon: FileSignature, description: '근로계약서 관리', group: '업무지원' },
  // 시스템
  { href: '/audit-log', label: '감사로그', icon: ShieldAlert, description: '시스템 감사 로그', group: '시스템' },
  { href: '/settings', label: '설정', icon: Settings, description: '시스템 설정', group: '시스템' },
];

export const MENU_GROUPS: MenuGroup[] = (() => {
  const groupOrder = ['홈', '인사관리', '근무관리', '급여관리', '인재개발', '업무지원', '시스템'];
  const map = new Map<string, MenuItem[]>();
  for (const item of ALL_MENU_ITEMS) {
    const g = item.group ?? '기타';
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(item);
  }
  return groupOrder.filter((g) => map.has(g)).map((g) => ({ label: g, items: map.get(g)! }));
})();
