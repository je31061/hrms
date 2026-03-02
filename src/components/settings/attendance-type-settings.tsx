'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/lib/stores/settings-store';
import type { AttendanceTypeConfig } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function AttendanceTypeSettings() {
  const attendanceTypes = useSettingsStore((s) => s.attendanceTypes);
  const addAttendanceType = useSettingsStore((s) => s.addAttendanceType);
  const updateAttendanceType = useSettingsStore((s) => s.updateAttendanceType);
  const deleteAttendanceType = useSettingsStore((s) => s.deleteAttendanceType);
  const toggleAttendanceTypeActive = useSettingsStore((s) => s.toggleAttendanceTypeActive);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<AttendanceTypeConfig | null>(null);
  const [form, setForm] = useState({
    code: '',
    label: '',
    requires_approval: false,
    requires_location: false,
    requires_purpose: false,
    counts_as_work: true,
  });

  const handleAdd = () => {
    setEditingType(null);
    setForm({
      code: '',
      label: '',
      requires_approval: false,
      requires_location: false,
      requires_purpose: false,
      counts_as_work: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (type: AttendanceTypeConfig) => {
    setEditingType(type);
    setForm({
      code: type.code,
      label: type.label,
      requires_approval: type.requires_approval,
      requires_location: type.requires_location,
      requires_purpose: type.requires_purpose,
      counts_as_work: type.counts_as_work,
    });
    setDialogOpen(true);
  };

  const handleDelete = (type: AttendanceTypeConfig) => {
    if (type.is_system) {
      toast.error('시스템 유형은 삭제할 수 없습니다.');
      return;
    }
    if (window.confirm(`"${type.label}" 근태유형을 삭제하시겠습니까?`)) {
      deleteAttendanceType(type.id);
      toast.success('근태유형이 삭제되었습니다.');
    }
  };

  const handleSave = () => {
    if (!form.label.trim()) {
      toast.error('유형명을 입력해주세요.');
      return;
    }
    if (!editingType && !form.code.trim()) {
      toast.error('코드를 입력해주세요.');
      return;
    }
    if (!editingType && attendanceTypes.some((t) => t.code === form.code)) {
      toast.error('이미 존재하는 코드입니다.');
      return;
    }

    const now = new Date().toISOString();
    if (editingType) {
      updateAttendanceType(editingType.id, {
        label: form.label,
        requires_approval: form.requires_approval,
        requires_location: form.requires_location,
        requires_purpose: form.requires_purpose,
        counts_as_work: form.counts_as_work,
      });
      toast.success('근태유형이 수정되었습니다.');
    } else {
      const newType: AttendanceTypeConfig = {
        id: `atype-${Date.now()}`,
        code: form.code,
        label: form.label,
        is_active: true,
        requires_approval: form.requires_approval,
        requires_location: form.requires_location,
        requires_purpose: form.requires_purpose,
        counts_as_work: form.counts_as_work,
        sort_order: attendanceTypes.length + 1,
        is_system: false,
        created_at: now,
        updated_at: now,
      };
      addAttendanceType(newType);
      toast.success('근태유형이 추가되었습니다.');
    }
    setDialogOpen(false);
  };

  const handleToggleOption = (
    type: AttendanceTypeConfig,
    field: 'requires_approval' | 'requires_location' | 'requires_purpose' | 'counts_as_work',
  ) => {
    updateAttendanceType(type.id, { [field]: !type[field] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>근태유형 관리</CardTitle>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            추가
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>유형명</TableHead>
                <TableHead>코드</TableHead>
                <TableHead>결재필요</TableHead>
                <TableHead>장소필수</TableHead>
                <TableHead>목적필수</TableHead>
                <TableHead>근무인정</TableHead>
                <TableHead>활성</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceTypes
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {type.is_system && <Shield className="h-3 w-3 text-muted-foreground" />}
                        {type.label}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-mono">
                        {type.code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={type.requires_approval}
                        onCheckedChange={() => handleToggleOption(type, 'requires_approval')}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={type.requires_location}
                        onCheckedChange={() => handleToggleOption(type, 'requires_location')}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={type.requires_purpose}
                        onCheckedChange={() => handleToggleOption(type, 'requires_purpose')}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={type.counts_as_work}
                        onCheckedChange={() => handleToggleOption(type, 'counts_as_work')}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={type.is_active}
                        onCheckedChange={() => toggleAttendanceTypeActive(type.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(type)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {type.is_system ? (
                          <Button variant="ghost" size="icon" disabled>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(type)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {attendanceTypes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    등록된 근태유형이 없습니다.
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
            <DialogTitle>
              {editingType ? '근태유형 수정' : '근태유형 추가'}
            </DialogTitle>
            <DialogDescription>
              {editingType
                ? '기존 근태유형을 수정합니다.'
                : '새로운 근태유형을 추가합니다.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!editingType && (
              <div className="space-y-2">
                <Label htmlFor="type-code">코드</Label>
                <Input
                  id="type-code"
                  placeholder="예: meeting, seminar"
                  value={form.code}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, code: e.target.value }))
                  }
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="type-label">유형명</Label>
              <Input
                id="type-label"
                placeholder="예: 회의, 세미나"
                value={form.label}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, label: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="type-approval">결재 필요</Label>
              <Switch
                id="type-approval"
                checked={form.requires_approval}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, requires_approval: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="type-location">장소 필수</Label>
              <Switch
                id="type-location"
                checked={form.requires_location}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, requires_location: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="type-purpose">목적 필수</Label>
              <Switch
                id="type-purpose"
                checked={form.requires_purpose}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, requires_purpose: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="type-work">근무시간 인정</Label>
              <Switch
                id="type-work"
                checked={form.counts_as_work}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, counts_as_work: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
