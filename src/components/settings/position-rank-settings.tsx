'use client';

import { useState } from 'react';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import type { PositionRank } from '@/types';
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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PositionRankSettings() {
  const positionRanks = useEmployeeStore((s) => s.positionRanks);
  const addPositionRank = useEmployeeStore((s) => s.addPositionRank);
  const updatePositionRank = useEmployeeStore((s) => s.updatePositionRank);
  const deletePositionRank = useEmployeeStore((s) => s.deletePositionRank);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PositionRank | null>(null);
  const [form, setForm] = useState({ name: '', level: 1, is_active: true });

  const handleAdd = () => {
    setEditing(null);
    setForm({ name: '', level: positionRanks.length + 1, is_active: true });
    setDialogOpen(true);
  };

  const handleEdit = (rank: PositionRank) => {
    setEditing(rank);
    setForm({ name: rank.name, level: rank.level, is_active: rank.is_active });
    setDialogOpen(true);
  };

  const handleDelete = (rank: PositionRank) => {
    if (window.confirm(`"${rank.name}" 직급을 삭제하시겠습니까?`)) {
      deletePositionRank(rank.id);
      toast.success('직급이 삭제되었습니다.');
    }
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('직급명을 입력해주세요.');
      return;
    }

    if (editing) {
      updatePositionRank(editing.id, { name: form.name, level: form.level, is_active: form.is_active });
      toast.success('직급이 수정되었습니다.');
    } else {
      const newRank: PositionRank = {
        id: `rank-${Date.now()}`,
        name: form.name,
        level: form.level,
        is_active: form.is_active,
      };
      addPositionRank(newRank);
      toast.success('직급이 추가되었습니다.');
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>직급 관리</CardTitle>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            추가
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>직급명</TableHead>
                <TableHead>레벨</TableHead>
                <TableHead>활성</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...positionRanks].sort((a, b) => a.level - b.level).map((rank) => (
                <TableRow key={rank.id}>
                  <TableCell className="font-medium">{rank.name}</TableCell>
                  <TableCell>{rank.level}</TableCell>
                  <TableCell>
                    <Switch
                      checked={rank.is_active}
                      onCheckedChange={(checked) => updatePositionRank(rank.id, { is_active: checked })}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(rank)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(rank)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {positionRanks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    등록된 직급이 없습니다.
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
            <DialogTitle>{editing ? '직급 수정' : '직급 추가'}</DialogTitle>
            <DialogDescription>
              {editing ? '기존 직급을 수정합니다.' : '새로운 직급을 추가합니다.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="rank-name">직급명</Label>
              <Input
                id="rank-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rank-level">레벨</Label>
              <Input
                id="rank-level"
                type="number"
                value={form.level}
                onChange={(e) => setForm((p) => ({ ...p, level: Number(e.target.value) }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="rank-active">활성</Label>
              <Switch
                id="rank-active"
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
