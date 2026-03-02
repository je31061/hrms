'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const menuItems = [
  { href: '/', label: '대시보드', icon: LayoutDashboard },
  { href: '/my', label: '마이페이지', icon: UserCircle },
  { href: '/organization', label: '조직도', icon: Network },
  { href: '/employees', label: '인사정보', icon: Users },
  { href: '/attendance', label: '근태관리', icon: Clock },
  { href: '/leave', label: '휴가관리', icon: CalendarDays },
  { href: '/payroll', label: '급여관리', icon: Banknote },
  { href: '/appointments', label: '인사발령', icon: ArrowRightLeft },
  { href: '/approval', label: '전자결재', icon: FileCheck },
  { href: '/recruitment', label: '채용관리', icon: Briefcase },
  { href: '/training', label: '교육관리', icon: GraduationCap },
  { href: '/evaluation', label: '평가관리', icon: Star },
  { href: '/workflows', label: '업무프로세스', icon: ListChecks },
  { href: '/audit-log', label: '감사로그', icon: ShieldAlert },
  { href: '/settings', label: '설정', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Network className="h-6 w-6 text-primary" />
          <span>HRMS</span>
        </Link>
      </div>
      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <nav className="space-y-1 p-3">
          {menuItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
