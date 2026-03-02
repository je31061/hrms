'use client';

import { useState } from 'react';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import type { SalaryGrade } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SalaryGradeSettings() {
  const salaryGrades = useEmployeeStore((s) => s.salaryGrades);
  const positionRanks = useEmployeeStore((s) => s.positionRanks);
  const addSalaryGrade = useEmployeeStore((s) => s.addSalaryGrade);
  const updateSalaryGrade = useEmployeeStore((s) => s.updateSalaryGrade);
  const deleteSalaryGrade = useEmployeeStore((s) => s.deleteSalaryGrade);

  const [filterRankId, setFilterRankId] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SalaryGrade | null>(null);
  const [form, setForm] = useState({
    rank_id: '',
    step: 1,
    base_amount: 0,
    is_active: true,
  });

  const getRankName = (rankId: string) => {
    const rank = positionRanks.find((r) => r.id === rankId);
    return rank?.name ?? '-';
  };

  const filtered = filterRankId === 'all'
    ? salaryGrades
    : salaryGrades.filter((g) => g.rank_id === filterRankId);

  const sorted = [...filtered].sort((a, b) => {
    const aRank = positionRanks.find((r) => r.id === a.rank_id);
    const bRank = positionRanks.find((r) => r.id === b.rank_id);
    const levelDiff = (aRank?.level ?? 0) - (bRank?.level ?? 0);
    if (levelDiff !== 0) return levelDiff;
    return a.step - b.step;
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const handleAdd = () => {
    setEditing(null);
    setForm({
      rank_id: positionRanks[0]?.id ?? '',
      step: 1,
      base_amount: 0,
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (grade: SalaryGrade) => {
    setEditing(grade);
    setForm({
      rank_id: grade.rank_id,
      step: grade.step,
      base_amount: grade.base_amount,
      is_active: grade.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = (grade: SalaryGrade) => {
    if (window.confirm(`${getRankName(grade.rank_id)} ${grade.step}호봉을 삭제하시겠습니까?`)) {
      deleteSalaryGrade(grade.id);
      toast.success('호봉이 삭제되었습니다.');
    }
  };

  const handleSave = () => {
    if (!form.rank_id) {
      toast.error('직급을 선택해주세요.');
      return;
    }
    if (form.base_amount <= 0) {
      toast.error('기본급을 입력해주세요.');
      return;
    }

    if (editing) {
      updateSalaryGrade(editing.id, {
        rank_id: form.rank_id,
        step: form.step,
        base_amount: form.base_amount,
        is_active: form.is_active,
      });
      toast.success('호봉이 수정되었습니다.');
    } else {
      const newGrade: SalaryGrade = {
        id: `sg-${Date.now()}`,
        rank_id: form.rank_id,
        step: form.step,
        base_amount: form.base_amount,
        is_active: form.is_active,
      };
      addSalaryGrade(newGrade);
      toast.success('호봉이 추가되었습니다.');
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>호봉 관리</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filterRankId} onValueChange={setFilterRankId}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="전체 직급" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 직급</SelectItem>
                {[...positionRanks].sort((a, b) => a.level - b.level).map((rank) => (
                  <SelectItem key={rank.id} value={rank.id}>{rank.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>직급</TableHead>
                <TableHead>호봉</TableHead>
                <TableHead>기본급</TableHead>
                <TableHead>활성</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell className="font-medium">{getRankName(grade.rank_id)}</TableCell>
                  <TableCell>{grade.step}호봉</TableCell>
                  <TableCell>{formatAmount(grade.base_amount)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={grade.is_active}
                      onCheckedChange={(checked) => updateSalaryGrade(grade.id, { is_active: checked })}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(grade)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(grade)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    등록된 호봉이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? '호봉 수정' : '호봉 추가'}</DialogTitle>
            <DialogDescription>
              {editing ? '기존 호봉을 수정합니다.' : '새로운 호봉을 추가합니다.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="sg-rank">직급</Label>
              <Select
                value={form.rank_id}
                onValueChange={(v) => setForm((p) => ({ ...p, rank_id: v }))}
              >
                <SelectTrigger id="sg-rank">
                  <SelectValue placeholder="직급 선택" />
                </SelectTrigger>
                <SelectContent>
                  {[...positionRanks].sort((a, b) => a.level - b.level).map((rank) => (
                    <SelectItem key={rank.id} value={rank.id}>{rank.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sg-step">호봉</Label>
              <Input
                id="sg-step"
                type="number"
                min={1}
                value={form.step}
                onChange={(e) => setForm((p) => ({ ...p, step: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sg-amount">기본급 (원)</Label>
              <Input
                id="sg-amount"
                type="number"
                min={0}
                step={10000}
                value={form.base_amount}
                onChange={(e) => setForm((p) => ({ ...p, base_amount: Number(e.target.value) }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sg-active">활성</Label>
              <Switch
                id="sg-active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm((p) => ({ ...p, is_active: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>취소</Button>
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
