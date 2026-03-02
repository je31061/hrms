'use client';

import { useState } from 'react';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import type { PositionTitle } from '@/types';
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

export default function PositionTitleSettings() {
  const positionTitles = useEmployeeStore((s) => s.positionTitles);
  const addPositionTitle = useEmployeeStore((s) => s.addPositionTitle);
  const updatePositionTitle = useEmployeeStore((s) => s.updatePositionTitle);
  const deletePositionTitle = useEmployeeStore((s) => s.deletePositionTitle);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PositionTitle | null>(null);
  const [form, setForm] = useState({ name: '', level: 1, is_active: true });

  const handleAdd = () => {
    setEditing(null);
    setForm({ name: '', level: positionTitles.length + 1, is_active: true });
    setDialogOpen(true);
  };

  const handleEdit = (title: PositionTitle) => {
    setEditing(title);
    setForm({ name: title.name, level: title.level, is_active: title.is_active });
    setDialogOpen(true);
  };

  const handleDelete = (title: PositionTitle) => {
    if (window.confirm(`"${title.name}" 직책을 삭제하시겠습니까?`)) {
      deletePositionTitle(title.id);
      toast.success('직책이 삭제되었습니다.');
    }
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('직책명을 입력해주세요.');
      return;
    }

    if (editing) {
      updatePositionTitle(editing.id, { name: form.name, level: form.level, is_active: form.is_active });
      toast.success('직책이 수정되었습니다.');
    } else {
      const newTitle: PositionTitle = {
        id: `title-${Date.now()}`,
        name: form.name,
        level: form.level,
        is_active: form.is_active,
      };
      addPositionTitle(newTitle);
      toast.success('직책이 추가되었습니다.');
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>직책 관리</CardTitle>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            추가
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>직책명</TableHead>
                <TableHead>레벨</TableHead>
                <TableHead>활성</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...positionTitles].sort((a, b) => a.level - b.level).map((title) => (
                <TableRow key={title.id}>
                  <TableCell className="font-medium">{title.name}</TableCell>
                  <TableCell>{title.level}</TableCell>
                  <TableCell>
                    <Switch
                      checked={title.is_active}
                      onCheckedChange={(checked) => updatePositionTitle(title.id, { is_active: checked })}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(title)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(title)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {positionTitles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    등록된 직책이 없습니다.
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
            <DialogTitle>{editing ? '직책 수정' : '직책 추가'}</DialogTitle>
            <DialogDescription>
              {editing ? '기존 직책을 수정합니다.' : '새로운 직책을 추가합니다.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title-name">직책명</Label>
              <Input
                id="title-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title-level">레벨</Label>
              <Input
                id="title-level"
                type="number"
                value={form.level}
                onChange={(e) => setForm((p) => ({ ...p, level: Number(e.target.value) }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="title-active">활성</Label>
              <Switch
                id="title-active"
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
