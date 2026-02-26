'use client';

import { useState, useMemo } from 'react';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { HOLIDAY_TYPES } from '@/lib/constants/codes';
import type { Holiday, HolidayType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

function getHolidayBadgeVariant(type: HolidayType): 'default' | 'secondary' | 'outline' {
  switch (type) {
    case 'legal':
      return 'default';
    case 'substitute':
      return 'secondary';
    case 'company':
      return 'outline';
    default:
      return 'outline';
  }
}

export default function HolidaySettings() {
  const holidays = useSettingsStore((s) => s.holidays);
  const holidayAutoSubstitute = useSettingsStore((s) => s.holiday_auto_substitute);
  const setHolidayAutoSubstitute = useSettingsStore((s) => s.setHolidayAutoSubstitute);
  const addHoliday = useSettingsStore((s) => s.addHoliday);
  const deleteHoliday = useSettingsStore((s) => s.deleteHoliday);

  const [autoSubstitute, setAutoSubstitute] = useState(holidayAutoSubstitute);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newHolidayForm, setNewHolidayForm] = useState({
    date: '',
    name: '',
  });

  const sortedHolidays = useMemo(
    () => [...holidays].sort((a, b) => a.date.localeCompare(b.date)),
    [holidays]
  );

  const handlePolicySave = () => {
    setHolidayAutoSubstitute(autoSubstitute);
    toast.success('공휴일 정책이 저장되었습니다.');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`"${name}" 공휴일을 삭제하시겠습니까?`)) {
      deleteHoliday(id);
      toast.success('공휴일이 삭제되었습니다.');
    }
  };

  const openAddDialog = () => {
    setNewHolidayForm({ date: '', name: '' });
    setDialogOpen(true);
  };

  const handleAddHoliday = () => {
    if (!newHolidayForm.date) {
      toast.error('날짜를 입력해주세요.');
      return;
    }
    if (!newHolidayForm.name.trim()) {
      toast.error('명칭을 입력해주세요.');
      return;
    }

    const newHoliday: Holiday = {
      id: `h-${Date.now()}`,
      date: newHolidayForm.date,
      name: newHolidayForm.name,
      type: 'company',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    addHoliday(newHoliday);
    toast.success('공휴일이 추가되었습니다.');
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Card 1: 공휴일 정책 */}
      <Card>
        <CardHeader>
          <CardTitle>공휴일 정책</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">대체공휴일 자동적용</Label>
              <p className="text-sm text-muted-foreground">
                법정공휴일이 주말과 겹칠 경우 대체공휴일 자동 생성
              </p>
            </div>
            <Switch
              checked={autoSubstitute}
              onCheckedChange={setAutoSubstitute}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handlePolicySave}>저장</Button>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: 공휴일 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>공휴일 목록</CardTitle>
            <Button onClick={openAddDialog} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>날짜</TableHead>
                <TableHead>명칭</TableHead>
                <TableHead>유형</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHolidays.map((h) => (
                <TableRow key={h.id}>
                  <TableCell>{h.date}</TableCell>
                  <TableCell className="font-medium">{h.name}</TableCell>
                  <TableCell>
                    <Badge variant={getHolidayBadgeVariant(h.type)}>
                      {HOLIDAY_TYPES[h.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={h.type === 'legal'}
                      title={
                        h.type === 'legal'
                          ? '법정공휴일은 삭제할 수 없습니다'
                          : '삭제'
                      }
                      onClick={() => handleDelete(h.id, h.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {holidays.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    등록된 공휴일이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Holiday Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>회사지정 공휴일 추가</DialogTitle>
            <DialogDescription>
              회사지정 공휴일 정보를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="holiday-date">날짜</Label>
              <Input
                id="holiday-date"
                type="date"
                value={newHolidayForm.date}
                onChange={(e) =>
                  setNewHolidayForm((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holiday-name">명칭</Label>
              <Input
                id="holiday-name"
                value={newHolidayForm.name}
                onChange={(e) =>
                  setNewHolidayForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="예: 창립기념일"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddHoliday}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
