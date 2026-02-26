'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/lib/stores/settings-store';
import type { WorkSchedule } from '@/types';
import { WORK_SCHEDULE_TYPES } from '@/lib/constants/codes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import WorkScheduleDialog from './work-schedule-dialog';

export default function WorkScheduleSettings() {
  const work = useSettingsStore((s) => s.work);
  const workSchedules = useSettingsStore((s) => s.workSchedules);
  const updateWork = useSettingsStore((s) => s.updateWork);
  const addWorkSchedule = useSettingsStore((s) => s.addWorkSchedule);
  const updateWorkSchedule = useSettingsStore((s) => s.updateWorkSchedule);
  const deleteWorkSchedule = useSettingsStore((s) => s.deleteWorkSchedule);
  const setDefaultWorkSchedule = useSettingsStore((s) => s.setDefaultWorkSchedule);

  // Section A: Basic work hours local state
  const [basicForm, setBasicForm] = useState({
    default_start_time: '09:00',
    default_end_time: '18:00',
    lunch_break_minutes: 60,
    weekly_hours: 40,
  });

  // Section C: 52h rule & rates local state
  const [ruleForm, setRuleForm] = useState({
    enforce_52h_rule: true,
    max_weekly_hours: 52,
    overtime_limit_weekly: 12,
    overtime_warning_hours: 48,
    overtime_rate: 1.5,
    night_rate: 0.5,
    holiday_rate: 1.5,
    holiday_overtime_rate: 2.0,
  });

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);

  useEffect(() => {
    setBasicForm({
      default_start_time: work.default_start_time,
      default_end_time: work.default_end_time,
      lunch_break_minutes: work.lunch_break_minutes,
      weekly_hours: work.weekly_hours,
    });
    setRuleForm({
      enforce_52h_rule: work.enforce_52h_rule,
      max_weekly_hours: work.max_weekly_hours,
      overtime_limit_weekly: work.overtime_limit_weekly,
      overtime_warning_hours: work.overtime_warning_hours,
      overtime_rate: work.overtime_rate,
      night_rate: work.night_rate,
      holiday_rate: work.holiday_rate,
      holiday_overtime_rate: work.holiday_overtime_rate,
    });
  }, [work]);

  const handleSaveBasic = () => {
    updateWork(basicForm);
    toast.success('기본 근무시간이 저장되었습니다.');
  };

  const handleSaveRules = () => {
    updateWork(ruleForm);
    toast.success('근무 규정이 저장되었습니다.');
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setDialogOpen(true);
  };

  const handleEditSchedule = (schedule: WorkSchedule) => {
    setEditingSchedule(schedule);
    setDialogOpen(true);
  };

  const handleDeleteSchedule = (schedule: WorkSchedule) => {
    if (schedule.is_default) {
      toast.error('기본 근무유형은 삭제할 수 없습니다.');
      return;
    }
    if (window.confirm(`"${schedule.name}" 근무유형을 삭제하시겠습니까?`)) {
      deleteWorkSchedule(schedule.id);
      toast.success('근무유형이 삭제되었습니다.');
    }
  };

  const handleDialogSave = (schedule: WorkSchedule) => {
    if (editingSchedule) {
      updateWorkSchedule(schedule.id, schedule);
      toast.success('근무유형이 수정되었습니다.');
    } else {
      addWorkSchedule(schedule);
      toast.success('근무유형이 추가되었습니다.');
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultWorkSchedule(id);
    toast.success('기본 근무유형이 변경되었습니다.');
  };

  return (
    <div className="space-y-6">
      {/* Section A: 기본 근무시간 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 근무시간</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">출근시간</Label>
              <Input
                id="start-time"
                type="time"
                value={basicForm.default_start_time}
                onChange={(e) =>
                  setBasicForm((prev) => ({
                    ...prev,
                    default_start_time: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">퇴근시간</Label>
              <Input
                id="end-time"
                type="time"
                value={basicForm.default_end_time}
                onChange={(e) =>
                  setBasicForm((prev) => ({
                    ...prev,
                    default_end_time: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lunch-break">점심시간 (분)</Label>
              <Input
                id="lunch-break"
                type="number"
                value={basicForm.lunch_break_minutes}
                onChange={(e) =>
                  setBasicForm((prev) => ({
                    ...prev,
                    lunch_break_minutes: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekly-hours">주당 근무시간</Label>
              <Input
                id="weekly-hours"
                type="number"
                value={basicForm.weekly_hours}
                onChange={(e) =>
                  setBasicForm((prev) => ({
                    ...prev,
                    weekly_hours: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveBasic}>저장</Button>
          </div>
        </CardContent>
      </Card>

      {/* Section B: 유연근무제 유형 관리 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>유연근무제 유형 관리</CardTitle>
          <Button size="sm" onClick={handleAddSchedule}>
            <Plus className="h-4 w-4 mr-1" />
            추가
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>유형명</TableHead>
                <TableHead>근무유형</TableHead>
                <TableHead>출근시간</TableHead>
                <TableHead>퇴근시간</TableHead>
                <TableHead>코어타임</TableHead>
                <TableHead>주당시간</TableHead>
                <TableHead>기본</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workSchedules.map((ws) => (
                <TableRow key={ws.id}>
                  <TableCell className="font-medium">{ws.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {WORK_SCHEDULE_TYPES[ws.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>{ws.start_time}</TableCell>
                  <TableCell>{ws.end_time}</TableCell>
                  <TableCell>
                    {ws.core_start_time && ws.core_end_time
                      ? `${ws.core_start_time} ~ ${ws.core_end_time}`
                      : '-'}
                  </TableCell>
                  <TableCell>{ws.weekly_hours}h</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleSetDefault(ws.id)}
                      className="hover:opacity-70"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          ws.is_default
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ws.is_active ? 'default' : 'secondary'}>
                      {ws.is_active ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditSchedule(ws)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSchedule(ws)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {workSchedules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    등록된 근무유형이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Section C: 주 52시간제 & 수당율 */}
      <Card>
        <CardHeader>
          <CardTitle>주 52시간제 및 수당율</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enforce-52h">주 52시간제 적용</Label>
              <p className="text-sm text-muted-foreground">
                주 52시간 초과 근무를 제한합니다.
              </p>
            </div>
            <Switch
              id="enforce-52h"
              checked={ruleForm.enforce_52h_rule}
              onCheckedChange={(checked) =>
                setRuleForm((prev) => ({ ...prev, enforce_52h_rule: checked }))
              }
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-weekly">최대 주당 근무시간</Label>
              <Input
                id="max-weekly"
                type="number"
                value={ruleForm.max_weekly_hours}
                onChange={(e) =>
                  setRuleForm((prev) => ({
                    ...prev,
                    max_weekly_hours: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ot-limit">주당 연장근로 한도 (시간)</Label>
              <Input
                id="ot-limit"
                type="number"
                value={ruleForm.overtime_limit_weekly}
                onChange={(e) =>
                  setRuleForm((prev) => ({
                    ...prev,
                    overtime_limit_weekly: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ot-warning">초과근무 경고 시간</Label>
              <Input
                id="ot-warning"
                type="number"
                value={ruleForm.overtime_warning_hours}
                onChange={(e) =>
                  setRuleForm((prev) => ({
                    ...prev,
                    overtime_warning_hours: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          <Separator />

          <p className="text-sm font-medium">수당율 설정</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ot-rate">연장근무 수당율</Label>
              <Input
                id="ot-rate"
                type="number"
                step={0.1}
                value={ruleForm.overtime_rate}
                onChange={(e) =>
                  setRuleForm((prev) => ({
                    ...prev,
                    overtime_rate: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="night-rate">야간근무 수당율</Label>
              <Input
                id="night-rate"
                type="number"
                step={0.1}
                value={ruleForm.night_rate}
                onChange={(e) =>
                  setRuleForm((prev) => ({
                    ...prev,
                    night_rate: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holiday-rate">휴일근무 수당율</Label>
              <Input
                id="holiday-rate"
                type="number"
                step={0.1}
                value={ruleForm.holiday_rate}
                onChange={(e) =>
                  setRuleForm((prev) => ({
                    ...prev,
                    holiday_rate: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holiday-ot-rate">휴일연장 수당율</Label>
              <Input
                id="holiday-ot-rate"
                type="number"
                step={0.1}
                value={ruleForm.holiday_overtime_rate}
                onChange={(e) =>
                  setRuleForm((prev) => ({
                    ...prev,
                    holiday_overtime_rate: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveRules}>저장</Button>
          </div>
        </CardContent>
      </Card>

      {/* Work Schedule Dialog */}
      <WorkScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        schedule={editingSchedule}
        onSave={handleDialogSave}
      />
    </div>
  );
}
