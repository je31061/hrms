'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  HelpCircle,
  X,
  LayoutDashboard,
  UserCircle,
  Network,
  Users,
  Clock,
  CalendarDays,
  Banknote,
  ArrowRightLeft,
  FileCheck,
  FileSignature,
  GraduationCap,
  Settings,
  ChevronDown,
  ArrowRight,
  ArrowDown,
  Search,
  type LucideIcon,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

// ── Helpers ──

function matchesSearch(text: string, term: string): boolean {
  return text.toLowerCase().includes(term.toLowerCase());
}

// ── Workflow diagram data ──

interface FlowNode {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

interface FlowRow {
  nodes: FlowNode[];
}

const workflowRows: FlowRow[] = [
  {
    nodes: [
      { id: 'organization', label: '조직도', icon: Network, href: '/organization' },
      { id: 'employees', label: '인사정보', icon: Users, href: '/employees' },
      { id: 'appointments', label: '인사발령', icon: ArrowRightLeft, href: '/appointments' },
    ],
  },
  {
    nodes: [
      { id: 'attendance', label: '근태관리', icon: Clock, href: '/attendance' },
      { id: 'leave', label: '휴가관리', icon: CalendarDays, href: '/leave' },
    ],
  },
  {
    nodes: [
      { id: 'payroll', label: '급여관리', icon: Banknote, href: '/payroll' },
    ],
  },
  {
    nodes: [
      { id: 'approval', label: '전자결재', icon: FileCheck, href: '/approval' },
      { id: 'contracts', label: '전자계약', icon: FileSignature, href: '/contracts' },
    ],
  },
  {
    nodes: [
      { id: 'training', label: '교육관리', icon: GraduationCap, href: '/training' },
    ],
  },
];

// ── Module guide data ──

interface ModuleGuide {
  label: string;
  icon: LucideIcon;
  href: string;
  description: string;
  workflow: string;
}

const moduleGuides: ModuleGuide[] = [
  {
    label: '대시보드',
    icon: LayoutDashboard,
    href: '/',
    description: '전체 현황을 한눈에 확인합니다. 직원수, 근태, 휴가, 급여 요약 정보를 제공합니다.',
    workflow: '로그인 → 대시보드 → 현황 카드 확인 → 상세 모듈 이동',
  },
  {
    label: '마이페이지',
    icon: UserCircle,
    href: '/my',
    description: '내 인사정보, 발령내역, 연차, 급여, 근태, 교육/평가 이력을 조회합니다.',
    workflow: '마이페이지 접속 → 탭 선택 → 정보 조회',
  },
  {
    label: '조직도',
    icon: Network,
    href: '/organization',
    description: '조직 구조를 확인하고, 시뮬레이션 모드로 인사이동을 미리 볼 수 있습니다.',
    workflow: '조직도 조회 → 부서 클릭 → 구성원 확인 → (시뮬레이션 모드)',
  },
  {
    label: '인사정보',
    icon: Users,
    href: '/employees',
    description: '직원 등록/수정 및 인사카드를 관리합니다. 기본정보, 경력, 학력, 자격증, 가족 정보를 포함합니다.',
    workflow: '직원 목록 → 직원 선택/등록 → 인사카드 탭별 정보 입력 → 저장',
  },
  {
    label: '근태관리',
    icon: Clock,
    href: '/attendance',
    description: '출퇴근 기록을 관리하고, 월별 근태 현황을 조회합니다.',
    workflow: '출근 기록 → 퇴근 기록 → 월별 현황 조회 → 이상근태 확인',
  },
  {
    label: '휴가관리',
    icon: CalendarDays,
    href: '/leave',
    description:
      '직원은 잔여 연차 확인 후 휴가를 신청하고, HR은 승인/반려 및 연차 일괄 부여, 휴가 유형을 설정합니다.',
    workflow: '잔여 연차 확인 → 휴가 신청 → HR 승인 → 잔여일수 차감 → 완료',
  },
  {
    label: '급여관리',
    icon: Banknote,
    href: '/payroll',
    description:
      '지급/공제 항목 설정, 급여 계산(직원 선택 → 항목 체크 → 계산식 확인 → 저장), 급여 대장 조회 및 상태 관리(작성중→확정→지급완료), 급여명세서 출력을 수행합니다.',
    workflow: '항목 설정 → 직원 선택 → 급여 계산 → 확정 → 지급완료 → 명세서 출력',
  },
  {
    label: '인사발령',
    icon: ArrowRightLeft,
    href: '/appointments',
    description: '승진, 전보, 직책변경, 입사, 퇴사 등 발령을 등록하고 이력을 관리합니다.',
    workflow: '발령 유형 선택 → 대상자 선택 → 발령 내용 입력 → 등록 → 이력 확인',
  },
  {
    label: '전자결재',
    icon: FileCheck,
    href: '/approval',
    description: '휴가, 경비, 발령 등 문서를 기안하고, 결재라인에서 승인/반려합니다.',
    workflow: '문서 기안 → 결재라인 설정 → 제출 → 순차 승인/반려 → 완료',
  },
  {
    label: '전자계약',
    icon: FileSignature,
    href: '/contracts',
    description: '근로계약서, 연봉계약서, 비밀유지계약서(NDA), 겸업금지계약서 등의 전자계약을 관리합니다.',
    workflow: '계약 생성 → 직원 선택 → 서명 요청 → 서명 완료 → 계약 보관',
  },
  {
    label: '교육관리',
    icon: GraduationCap,
    href: '/training',
    description: '교육과정을 등록하고, 수강 신청 및 이수 현황을 관리합니다.',
    workflow: '교육과정 등록 → 수강 신청 → 교육 진행 → 이수 처리',
  },
  {
    label: '설정',
    icon: Settings,
    href: '/settings',
    description: '근무일정, 공휴일, 연차정책, 직급체계, 결재양식, 코드관리 등 시스템 전반의 설정을 관리합니다.',
    workflow: '설정 메뉴 선택 → 항목 조회/수정 → 저장',
  },
];

// ── Sub-components ──

function FlowNodeCard({
  node,
  isActive,
  isHighlighted,
  isDimmed,
  onClick,
}: {
  node: FlowNode;
  isActive: boolean;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  onClick?: () => void;
}) {
  const Icon = node.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
          : 'border-border bg-card text-card-foreground',
        isHighlighted && 'ring-2 ring-primary/50',
        isDimmed && 'opacity-40'
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{node.label}</span>
    </button>
  );
}

function WorkflowDiagram({
  pathname,
  search,
  onNodeClick,
}: {
  pathname: string;
  search: string;
  onNodeClick: (href: string) => void;
}) {
  const isNodeActive = (node: FlowNode) => {
    if (node.href === '/') return pathname === '/';
    return pathname.startsWith(node.href);
  };

  const isNodeMatch = (node: FlowNode) => {
    if (!search) return false;
    return matchesSearch(node.label, search);
  };

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">전체 업무흐름도</h3>
      <div className="flex flex-col items-center gap-1.5">
        {workflowRows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex flex-col items-center gap-1.5">
            {rowIdx > 0 && (
              <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <div className="flex items-center gap-1.5">
              {row.nodes.map((node, nodeIdx) => (
                <div key={node.id} className="flex items-center gap-1.5">
                  {nodeIdx > 0 && (
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <FlowNodeCard
                    node={node}
                    isActive={isNodeActive(node)}
                    isHighlighted={search ? isNodeMatch(node) : false}
                    isDimmed={search ? !isNodeMatch(node) : false}
                    onClick={() => onNodeClick(node.href)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GuideItem({
  guide,
  pathname,
  forceOpen,
  onNavigate,
}: {
  guide: ModuleGuide;
  pathname: string;
  forceOpen?: boolean;
  onNavigate: (href: string) => void;
}) {
  const [manualOpen, setManualOpen] = useState(false);
  const Icon = guide.icon;
  const isActive = guide.href === '/' ? pathname === '/' : pathname.startsWith(guide.href);
  const isOpen = forceOpen || manualOpen;

  return (
    <div
      className={cn(
        'rounded-lg border transition-colors',
        isActive && 'border-primary/50',
        forceOpen && 'border-primary bg-primary/5'
      )}
    >
      <button
        type="button"
        onClick={() => setManualOpen(!manualOpen)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium hover:bg-muted/50 rounded-lg transition-colors"
      >
        <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
        <span className="flex-1">{guide.label}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      {isOpen && (
        <div className="border-t px-3 py-2.5 text-sm">
          <p className="text-muted-foreground leading-relaxed">{guide.description}</p>
          <div className="mt-2 rounded-md bg-muted/50 px-2.5 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">흐름: </span>
            {guide.workflow}
          </div>
          <button
            type="button"
            onClick={() => onNavigate(guide.href)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {guide.label} 페이지로 이동
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main component ──

export function HelpWorkflow() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredGuides = useMemo(() => {
    if (!normalizedSearch) return moduleGuides;
    return moduleGuides.filter(
      (g) =>
        g.label.toLowerCase().includes(normalizedSearch) ||
        g.description.toLowerCase().includes(normalizedSearch) ||
        g.workflow.toLowerCase().includes(normalizedSearch),
    );
  }, [normalizedSearch]);

  // Auto-focus search input when the sheet opens
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleNavigate = (href: string) => {
    setOpen(false);
    setSearch('');
    router.push(href);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch('');
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'liquid-glass fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95',
          !open && 'help-pulse'
        )}
        aria-label="업무 도움말"
      >
        {open ? (
          <X className="h-6 w-6 text-foreground" />
        ) : (
          <HelpCircle className="h-6 w-6 text-foreground" />
        )}
      </button>

      {/* Sheet panel */}
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="sm:max-w-md w-full p-0 flex flex-col"
          onOpenAutoFocus={(e) => {
            // Let our own autoFocus handle it (search input)
            e.preventDefault();
          }}
        >
          <SheetHeader className="px-4 pt-4 pb-2 border-b">
            <SheetTitle className="text-lg">업무 도움말</SheetTitle>
            <SheetDescription>
              HRMS 업무흐름 가이드 및 모듈별 사용법
            </SheetDescription>
          </SheetHeader>

          {/* Search input - fixed above scroll area */}
          <div className="px-4 py-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  // Prevent radix dialog from capturing keystrokes
                  e.stopPropagation();
                }}
                placeholder="모듈 검색... (예: 급여, 휴가, 근태)"
                className="pl-9"
                autoComplete="off"
              />
            </div>
            {search && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                검색 결과: {filteredGuides.length}건
              </p>
            )}
          </div>

          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-4 p-4">
              {/* Workflow diagram */}
              <WorkflowDiagram
                pathname={pathname}
                search={normalizedSearch}
                onNodeClick={handleNavigate}
              />

              {/* Module guides */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">모듈별 가이드</h3>
                {filteredGuides.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    검색 결과 없음
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filteredGuides.map((guide) => (
                      <GuideItem
                        key={guide.href}
                        guide={guide}
                        pathname={pathname}
                        forceOpen={!!search}
                        onNavigate={handleNavigate}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
