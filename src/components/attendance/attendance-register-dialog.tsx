'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Attendance } from '@/types';

interface AttendanceRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegister: (record: Attendance) => void;
}

export function AttendanceRegisterDialog({
  open,
  onOpenChange,
  onRegister,
}: AttendanceRegisterDialogProps) {
  const attendanceTypes = useSettingsStore((s) => s.attendanceTypes);
  const activeTypes = attendanceTypes.filter((t) => t.is_active);
  const session = useAuthStore((s) => s.session);
  const employeeId = session?.employee_id ?? 'e022';
  const employees = useEmployeeStore((s) => s.employees);
  const allDepartments = useEmployeeStore((s) => s.departments);
  const allPositionRanks = useEmployeeStore((s) => s.positionRanks);
  const allPositionTitles = useEmployeeStore((s) => s.positionTitles);
  const rawEmp = employees.find((e) => e.id === employeeId);
  const employee = rawEmp ? {
    ...rawEmp,
    department: allDepartments.find((d) => d.id === rawEmp.department_id),
    position_rank: allPositionRanks.find((r) => r.id === rawEmp.position_rank_id),
    position_title: allPositionTitles.find((t) => t.id === rawEmp.position_title_id),
  } : undefined;

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    attendance_type: 'office',
    location: '',
    purpose: '',
    note: '',
  });

  const selectedTypeConfig = attendanceTypes.find((t) => t.code === form.attendance_type);

  const handleSubmit = () => {
    if (!form.date) {
      toast.error('날짜를 입력해주세요.');
      return;
    }
    if (selectedTypeConfig?.requires_location && !form.location.trim()) {
      toast.error('장소/목적지를 입력해주세요.');
      return;
    }
    if (selectedTypeConfig?.requires_purpose && !form.purpose.trim()) {
      toast.error('목적을 입력해주세요.');
      return;
    }

    const now = new Date().toISOString();
    const clockIn = `${form.date}T09:00:00+09:00`;
    const record: Attendance = {
      id: `att-${Date.now()}`,
      employee_id: employeeId,
      date: form.date,
      clock_in: clockIn,
      clock_out: null,
      work_hours: null,
      overtime_hours: 0,
      status: 'normal',
      note: form.note || null,
      attendance_type: form.attendance_type,
      location: form.location || null,
      purpose: form.purpose || null,
      created_at: now,
      employee: employee,
    };

    onRegister(record);
    toast.success('근태가 등록되었습니다.');
    onOpenChange(false);
    setForm({
      date: new Date().toISOString().split('T')[0],
      attendance_type: 'office',
      location: '',
      purpose: '',
      note: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>근태 등록</DialogTitle>
          <DialogDescription>근태 유형을 선택하고 필요한 정보를 입력하세요.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="reg-date">날짜</Label>
            <Input
              id="reg-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-type">근태유형</Label>
            <Select
              value={form.attendance_type}
              onValueChange={(v) => setForm((prev) => ({ ...prev, attendance_type: v }))}
            >
              <SelectTrigger id="reg-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activeTypes.map((type) => (
                  <SelectItem key={type.code} value={type.code}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedTypeConfig?.requires_location && (
            <div className="space-y-2">
              <Label htmlFor="reg-location">장소/목적지</Label>
              <Input
                id="reg-location"
                placeholder="장소 또는 목적지를 입력하세요"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>
          )}
          {selectedTypeConfig?.requires_purpose && (
            <div className="space-y-2">
              <Label htmlFor="reg-purpose">목적</Label>
              <Input
                id="reg-purpose"
                placeholder="목적을 입력하세요"
                value={form.purpose}
                onChange={(e) => setForm((prev) => ({ ...prev, purpose: e.target.value }))}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="reg-note">비고</Label>
            <Input
              id="reg-note"
              placeholder="비고 (선택사항)"
              value={form.note}
              onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit}>등록</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
