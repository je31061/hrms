'use client';

import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  Search,
  Users,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Employee } from '@/types';

interface ApprovalLineEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 현재 결재 라인 */
  value: Employee[];
  /** 결재 라인 변경 완료 시 호출 */
  onChange: (approvers: Employee[]) => void;
  /** 신청자 정보 (표시용, 결재자에서 제외) */
  requester?: Employee | null;
  /** 선택 가능한 직원 목록 (필터: 활성만, 신청자 제외) */
  employees: Employee[];
  positionRanks: { id: string; name: string; level: number }[];
  departments: { id: string; name: string }[];
}

export function ApprovalLineEditor({
  open,
  onOpenChange,
  value,
  onChange,
  requester,
  employees,
  positionRanks,
  departments,
}: ApprovalLineEditorProps) {
  const [editingApprovers, setEditingApprovers] = useState<Employee[]>(value);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // 다이얼로그 열릴 때 현재 값으로 초기화
  useMemo(() => {
    if (open) {
      setEditingApprovers(value);
      setSearch('');
      setDeptFilter('all');
    }
  }, [open, value]);

  const requesterId = requester?.id;
  const selectedIds = new Set(editingApprovers.map((a) => a.id));

  // 선택 가능한 직원 목록 (필터링)
  const candidates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return employees
      .filter((e) => {
        if (e.status !== 'active') return false;
        if (e.id === requesterId) return false;
        if (selectedIds.has(e.id)) return false;
        if (deptFilter !== 'all' && e.department_id !== deptFilter) return false;
        if (normalizedSearch) {
          const rank = positionRanks.find((r) => r.id === e.position_rank_id)?.name ?? '';
          const dept = departments.find((d) => d.id === e.department_id)?.name ?? '';
          const hay = `${e.name} ${rank} ${dept} ${e.employee_number}`.toLowerCase();
          if (!hay.includes(normalizedSearch)) return false;
        }
        return true;
      })
      .slice(0, 30);
  }, [employees, requesterId, selectedIds, search, deptFilter, positionRanks, departments]);

  const allDepartments = useMemo(() => {
    const unique = new Map<string, { id: string; name: string }>();
    for (const d of departments) {
      unique.set(d.id, d);
    }
    return Array.from(unique.values());
  }, [departments]);

  const getRankName = (rankId: string | null) =>
    rankId ? positionRanks.find((r) => r.id === rankId)?.name ?? '-' : '-';

  const getDeptName = (deptId: string | null) =>
    deptId ? departments.find((d) => d.id === deptId)?.name ?? '-' : '-';

  const addApprover = (emp: Employee) => {
    setEditingApprovers((prev) => [...prev, emp]);
  };

  const removeApprover = (id: string) => {
    setEditingApprovers((prev) => prev.filter((a) => a.id !== id));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setEditingApprovers((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (idx: number) => {
    setEditingApprovers((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const handleSave = () => {
    if (editingApprovers.length === 0) {
      toast.error('최소 1명 이상의 결재자가 필요합니다.');
      return;
    }
    onChange(editingApprovers);
    onOpenChange(false);
    toast.success('결재 라인이 변경되었습니다.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            결재 라인 변경
          </DialogTitle>
          <DialogDescription>
            결재자를 추가/삭제하고 순서를 조정할 수 있습니다. 위에서부터 순차적으로 결재됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 현재 결재 라인 미리보기 */}
          <div className="p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium">현재 결재 라인</span>
              <Badge variant="outline" className="text-xs">
                {editingApprovers.length}단계
              </Badge>
            </div>
            {editingApprovers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                결재자가 없습니다. 아래에서 추가해주세요.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                {requester && (
                  <Badge variant="outline" className="text-xs">
                    {requester.name} (신청)
                  </Badge>
                )}
                {editingApprovers.map((a, idx) => (
                  <div key={a.id} className="flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge className="text-xs">
                      {idx + 1}. {a.name} ({getRankName(a.position_rank_id)})
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 선택된 결재자 리스트 (순서 조정/삭제) */}
          {editingApprovers.length > 0 && (
            <div className="border rounded-lg divide-y">
              {editingApprovers.map((a, idx) => (
                <div key={a.id} className="flex items-center gap-2 p-2.5">
                  <Badge variant="secondary" className="h-6 w-6 justify-center text-xs shrink-0">
                    {idx + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {a.name}{' '}
                      <span className="text-xs text-muted-foreground font-normal">
                        {getRankName(a.position_rank_id)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {getDeptName(a.department_id)} · {a.employee_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => moveDown(idx)}
                      disabled={idx === editingApprovers.length - 1}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => removeApprover(a.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 결재자 추가 (검색 + 필터) */}
          <div className="border rounded-lg">
            <div className="p-2.5 border-b bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="h-4 w-4" />
                <span className="text-sm font-medium">결재자 추가</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="이름, 직급, 부서 검색..."
                    className="pl-8 h-8 text-sm"
                  />
                </div>
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="w-[160px] h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 부서</SelectItem>
                    {allDepartments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ScrollArea className="h-[240px]">
              {candidates.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  {search || deptFilter !== 'all'
                    ? '검색 결과가 없습니다.'
                    : '추가 가능한 직원이 없습니다.'}
                </div>
              ) : (
                <div className="divide-y">
                  {candidates.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center gap-2 p-2.5 hover:bg-muted/50 cursor-pointer"
                      onClick={() => addApprover(emp)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {emp.name}{' '}
                          <span className="text-xs text-muted-foreground font-normal">
                            {getRankName(emp.position_rank_id)}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {getDeptName(emp.department_id)} · {emp.employee_number}
                        </p>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
