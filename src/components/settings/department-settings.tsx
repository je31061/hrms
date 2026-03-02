'use client';

import { useState } from 'react';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import type { Department } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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

export default function DepartmentSettings() {
  const departments = useEmployeeStore((s) => s.departments);
  const addDepartment = useEmployeeStore((s) => s.addDepartment);
  const updateDepartment = useEmployeeStore((s) => s.updateDepartment);
  const deleteDepartment = useEmployeeStore((s) => s.deleteDepartment);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    parent_id: '' as string | null,
    sort_order: 1,
    is_active: true,
  });

  const topLevel = departments.filter((d) => !d.parent_id);

  const getParentName = (parentId: string | null) => {
    if (!parentId) return '-';
    const parent = departments.find((d) => d.id === parentId);
    return parent?.name ?? '-';
  };

  const sortedDepts = [...departments].sort((a, b) => {
    // Sort by parent first (top-level first), then sort_order
    const aParent = a.parent_id ?? a.id;
    const bParent = b.parent_id ?? b.id;
    if (aParent !== bParent) {
      const aIdx = departments.findIndex((d) => d.id === (a.parent_id ?? a.id));
      const bIdx = departments.findIndex((d) => d.id === (b.parent_id ?? b.id));
      return aIdx - bIdx;
    }
    if (a.parent_id && !b.parent_id) return 1;
    if (!a.parent_id && b.parent_id) return -1;
    return a.sort_order - b.sort_order;
  });

  const handleAdd = () => {
    setEditing(null);
    setForm({ name: '', code: '', parent_id: null, sort_order: departments.length + 1, is_active: true });
    setDialogOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setEditing(dept);
    setForm({
      name: dept.name,
      code: dept.code,
      parent_id: dept.parent_id,
      sort_order: dept.sort_order,
      is_active: dept.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = (dept: Department) => {
    const hasChildren = departments.some((d) => d.parent_id === dept.id);
    if (hasChildren) {
      toast.error('하위 부서가 있는 부서는 삭제할 수 없습니다.');
      return;
    }
    if (window.confirm(`"${dept.name}" 부서를 삭제하시겠습니까?`)) {
      deleteDepartment(dept.id);
      toast.success('부서가 삭제되었습니다.');
    }
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('부서명을 입력해주세요.');
      return;
    }
    if (!form.code.trim()) {
      toast.error('부서 코드를 입력해주세요.');
      return;
    }

    const now = new Date().toISOString();
    if (editing) {
      updateDepartment(editing.id, {
        name: form.name,
        code: form.code,
        parent_id: form.parent_id || null,
        level: form.parent_id ? 2 : 1,
        sort_order: form.sort_order,
        is_active: form.is_active,
      });
      toast.success('부서가 수정되었습니다.');
    } else {
      const newDept: Department = {
        id: `dept-${Date.now()}`,
        name: form.name,
        code: form.code,
        parent_id: form.parent_id || null,
        level: form.parent_id ? 2 : 1,
        sort_order: form.sort_order,
        is_active: form.is_active,
        created_at: now,
        updated_at: now,
      };
      addDepartment(newDept);
      toast.success('부서가 추가되었습니다.');
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>부서 관리</CardTitle>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            추가
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>부서명</TableHead>
                <TableHead>코드</TableHead>
                <TableHead>상위부서</TableHead>
                <TableHead>정렬순서</TableHead>
                <TableHead>활성</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDepts.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">
                    {dept.parent_id && <span className="text-muted-foreground mr-2">└</span>}
                    {dept.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-mono">{dept.code}</Badge>
                  </TableCell>
                  <TableCell>{getParentName(dept.parent_id)}</TableCell>
                  <TableCell>{dept.sort_order}</TableCell>
                  <TableCell>
                    <Switch
                      checked={dept.is_active}
                      onCheckedChange={(checked) => updateDepartment(dept.id, { is_active: checked })}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(dept)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(dept)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {departments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    등록된 부서가 없습니다.
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
            <DialogTitle>{editing ? '부서 수정' : '부서 추가'}</DialogTitle>
            <DialogDescription>
              {editing ? '기존 부서 정보를 수정합니다.' : '새로운 부서를 추가합니다.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="dept-name">부서명</Label>
              <Input
                id="dept-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-code">코드</Label>
              <Input
                id="dept-code"
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-parent">상위부서</Label>
              <Select
                value={form.parent_id ?? 'none'}
                onValueChange={(v) => setForm((p) => ({ ...p, parent_id: v === 'none' ? null : v }))}
              >
                <SelectTrigger id="dept-parent">
                  <SelectValue placeholder="없음 (최상위)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">없음 (최상위)</SelectItem>
                  {topLevel.filter((d) => d.id !== editing?.id).map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-sort">정렬순서</Label>
              <Input
                id="dept-sort"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((p) => ({ ...p, sort_order: Number(e.target.value) }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dept-active">활성</Label>
              <Switch
                id="dept-active"
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
