'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/lib/stores/settings-store';
import type { CondolenceLeaveRule } from '@/types';
import { useCodeMap, CODE } from '@/lib/hooks/use-code';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LeavePolicySettings() {
  const UNUSED_LEAVE_POLICIES = useCodeMap(CODE.UNUSED_LEAVE_POLICIES);
  const leave = useSettingsStore((s) => s.leave);
  const condolenceLeaveRules = useSettingsStore((s) => s.condolenceLeaveRules);
  const updateLeave = useSettingsStore((s) => s.updateLeave);
  const addCondolenceRule = useSettingsStore((s) => s.addCondolenceRule);
  const updateCondolenceRule = useSettingsStore((s) => s.updateCondolenceRule);
  const deleteCondolenceRule = useSettingsStore((s) => s.deleteCondolenceRule);

  // Annual leave settings form
  const [leaveForm, setLeaveForm] = useState({
    auto_grant_annual: true,
    allow_half_day: true,
    allow_quarter_day: false,
    unused_leave_policy: 'carryover' as 'carryover' | 'payout',
    carryover_limit: 5,
  });

  // Condolence rule dialog state
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CondolenceLeaveRule | null>(null);
  const [ruleForm, setRuleForm] = useState({
    event_name: '',
    days: 1,
    is_paid: true,
  });

  useEffect(() => {
    setLeaveForm({ ...leave });
  }, [leave]);

  const handleSaveLeave = () => {
    updateLeave(leaveForm);
    toast.success('연차 설정이 저장되었습니다.');
  };

  const handleAddRule = () => {
    setEditingRule(null);
    setRuleForm({ event_name: '', days: 1, is_paid: true });
    setRuleDialogOpen(true);
  };

  const handleEditRule = (rule: CondolenceLeaveRule) => {
    setEditingRule(rule);
    setRuleForm({
      event_name: rule.event_name,
      days: rule.days,
      is_paid: rule.is_paid,
    });
    setRuleDialogOpen(true);
  };

  const handleDeleteRule = (rule: CondolenceLeaveRule) => {
    if (window.confirm(`"${rule.event_name}" 경조사 규정을 삭제하시겠습니까?`)) {
      deleteCondolenceRule(rule.id);
      toast.success('경조사 규정이 삭제되었습니다.');
    }
  };

  const handleSaveRule = () => {
    if (!ruleForm.event_name.trim()) {
      toast.error('경조사명을 입력해주세요.');
      return;
    }
    const now = new Date().toISOString();
    if (editingRule) {
      updateCondolenceRule(editingRule.id, {
        event_name: ruleForm.event_name,
        days: ruleForm.days,
        is_paid: ruleForm.is_paid,
        updated_at: now,
      });
      toast.success('경조사 규정이 수정되었습니다.');
    } else {
      const newRule: CondolenceLeaveRule = {
        id: crypto.randomUUID(),
        event_name: ruleForm.event_name,
        days: ruleForm.days,
        is_paid: ruleForm.is_paid,
        is_active: true,
        created_at: now,
        updated_at: now,
      };
      addCondolenceRule(newRule);
      toast.success('경조사 규정이 추가되었습니다.');
    }
    setRuleDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Card 1: 연차 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>연차 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-grant">연차 자동부여</Label>
              <p className="text-sm text-muted-foreground">
                입사일 기준으로 연차를 자동 부여합니다.
              </p>
            </div>
            <Switch
              id="auto-grant"
              checked={leaveForm.auto_grant_annual}
              onCheckedChange={(checked) =>
                setLeaveForm((prev) => ({ ...prev, auto_grant_annual: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="half-day">반차 허용</Label>
              <p className="text-sm text-muted-foreground">
                반차(0.5일) 사용을 허용합니다.
              </p>
            </div>
            <Switch
              id="half-day"
              checked={leaveForm.allow_half_day}
              onCheckedChange={(checked) =>
                setLeaveForm((prev) => ({ ...prev, allow_half_day: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="quarter-day">반반차 허용</Label>
              <p className="text-sm text-muted-foreground">
                반반차(0.25일) 사용을 허용합니다.
              </p>
            </div>
            <Switch
              id="quarter-day"
              checked={leaveForm.allow_quarter_day}
              onCheckedChange={(checked) =>
                setLeaveForm((prev) => ({ ...prev, allow_quarter_day: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unused-policy">미사용 연차 처리</Label>
            <Select
              value={leaveForm.unused_leave_policy}
              onValueChange={(v) =>
                setLeaveForm((prev) => ({
                  ...prev,
                  unused_leave_policy: v as 'carryover' | 'payout',
                }))
              }
            >
              <SelectTrigger id="unused-policy" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.entries(UNUSED_LEAVE_POLICIES) as [
                    'carryover' | 'payout',
                    string,
                  ][]
                ).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {leaveForm.unused_leave_policy === 'carryover' && (
            <div className="space-y-2">
              <Label htmlFor="carryover-limit">이월한도 (일)</Label>
              <Input
                id="carryover-limit"
                type="number"
                className="w-[200px]"
                value={leaveForm.carryover_limit}
                onChange={(e) =>
                  setLeaveForm((prev) => ({
                    ...prev,
                    carryover_limit: Number(e.target.value),
                  }))
                }
              />
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSaveLeave}>저장</Button>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: 경조사 휴가 규정 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>경조사 휴가 규정</CardTitle>
          <Button size="sm" onClick={handleAddRule}>
            <Plus className="h-4 w-4 mr-1" />
            추가
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>경조사</TableHead>
                <TableHead>일수</TableHead>
                <TableHead>유급여부</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {condolenceLeaveRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.event_name}</TableCell>
                  <TableCell>{rule.days}일</TableCell>
                  <TableCell>
                    <Badge variant={rule.is_paid ? 'default' : 'secondary'}>
                      {rule.is_paid ? '유급' : '무급'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditRule(rule)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRule(rule)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {condolenceLeaveRules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    등록된 경조사 규정이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Condolence Rule Dialog */}
      <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRule ? '경조사 규정 수정' : '경조사 규정 추가'}
            </DialogTitle>
            <DialogDescription>
              {editingRule
                ? '기존 경조사 규정을 수정합니다.'
                : '새로운 경조사 규정을 추가합니다.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="rule-event">경조사명</Label>
              <Input
                id="rule-event"
                value={ruleForm.event_name}
                onChange={(e) =>
                  setRuleForm((prev) => ({ ...prev, event_name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rule-days">일수</Label>
              <Input
                id="rule-days"
                type="number"
                min={1}
                value={ruleForm.days}
                onChange={(e) =>
                  setRuleForm((prev) => ({
                    ...prev,
                    days: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="rule-paid">유급 여부</Label>
              <Switch
                id="rule-paid"
                checked={ruleForm.is_paid}
                onCheckedChange={(checked) =>
                  setRuleForm((prev) => ({ ...prev, is_paid: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRuleDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveRule}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
