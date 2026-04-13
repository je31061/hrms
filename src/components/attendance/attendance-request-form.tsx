'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useApprovalStore } from '@/lib/stores/approval-store';
import { useNotificationStore } from '@/lib/stores/notification-store';
import { findApprovers } from '@/lib/utils/approval-helpers';
import { ApprovalLineEditor } from '@/components/approval/approval-line-editor';
import { toast } from 'sonner';
import type { Approval, ApprovalLine, Employee } from '@/types';
import { FileCheck, Users, ArrowRight, Edit } from 'lucide-react';

export type AttendanceRequestType =
  | 'field_work'       // 외근
  | 'business_trip'    // 출장
  | 'leave_full'       // 연차
  | 'leave_half'       // 반차
  | 'leave_quarter'    // 반반차
  | 'remote';          // 재택

const REQUEST_TYPE_OPTIONS: { value: AttendanceRequestType; label: string; description: string }[] = [
  { value: 'field_work', label: '외근', description: '사업장 외부에서 근무' },
  { value: 'business_trip', label: '출장', description: '국내/해외 출장' },
  { value: 'leave_full', label: '연차', description: '종일 휴가 (1일)' },
  { value: 'leave_half', label: '반차', description: '오전/오후 반나절 휴가 (0.5일)' },
  { value: 'leave_quarter', label: '반반차', description: '2시간 단위 휴가 (0.25일)' },
  { value: 'remote', label: '재택근무', description: '자택에서 근무' },
];

interface AttendanceRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 신청자 ID (미지정시 세션에서) */
  employeeId?: string;
  /** 기본 선택 유형 */
  defaultType?: AttendanceRequestType;
  onSuccess?: () => void;
}

export function AttendanceRequestForm({
  open,
  onOpenChange,
  employeeId: propEmployeeId,
  defaultType,
  onSuccess,
}: AttendanceRequestFormProps) {
  const session = useAuthStore((s) => s.session);
  const employees = useEmployeeStore((s) => s.employees);
  const positionRanks = useEmployeeStore((s) => s.positionRanks);
  const departments = useEmployeeStore((s) => s.departments);
  const createApproval = useApprovalStore((s) => s.createApproval);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const employeeId = propEmployeeId ?? session?.employee_id ?? '';

  const [type, setType] = useState<AttendanceRequestType>(defaultType ?? 'field_work');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [halfPeriod, setHalfPeriod] = useState<'am' | 'pm'>('am');
  const [location, setLocation] = useState('');
  const [purpose, setPurpose] = useState('');
  const [reason, setReason] = useState('');

  // 요청자 정보
  const requester = employees.find((e) => e.id === employeeId);
  const requesterDept = departments.find((d) => d.id === requester?.department_id);
  const requesterRank = positionRanks.find((r) => r.id === requester?.position_rank_id);

  // 자동 결재자 탐색
  const autoApprovers = useMemo(() => {
    if (!employeeId) return [];
    return findApprovers({
      requesterId: employeeId,
      employees,
      positionRanks,
      departments,
      maxLevels: 2,
    });
  }, [employeeId, employees, positionRanks, departments]);

  // 커스텀 결재 라인 (변경 가능)
  const [customApprovers, setCustomApprovers] = useState<Employee[] | null>(null);
  const [lineEditorOpen, setLineEditorOpen] = useState(false);

  // 자동 결재자가 변경될 때 커스텀이 없으면 자동 반영
  useEffect(() => {
    setCustomApprovers(null);
  }, [employeeId]);

  const approvers = customApprovers ?? autoApprovers;

  const handleLineChange = (newApprovers: Employee[]) => {
    setCustomApprovers(newApprovers);
  };

  const selectedOption = REQUEST_TYPE_OPTIONS.find((o) => o.value === type);
  const needsLocation = type === 'field_work' || type === 'business_trip';
  const isHalfType = type === 'leave_half' || type === 'leave_quarter';

  const calculatedDays = useMemo(() => {
    if (!startDate) return 0;
    if (type === 'leave_half') return 0.5;
    if (type === 'leave_quarter') return 0.25;
    if (!endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  }, [type, startDate, endDate]);

  const resetForm = () => {
    setType(defaultType ?? 'field_work');
    setStartDate('');
    setEndDate('');
    setHalfPeriod('am');
    setLocation('');
    setPurpose('');
    setReason('');
    setCustomApprovers(null);
  };

  const handleSubmit = () => {
    if (!employeeId || !requester) {
      toast.error('신청자 정보를 찾을 수 없습니다.');
      return;
    }
    if (!startDate) {
      toast.error('시작일을 선택해주세요.');
      return;
    }
    if (!isHalfType && !endDate) {
      setEndDate(startDate);
    }
    if (needsLocation && !location.trim()) {
      toast.error('장소를 입력해주세요.');
      return;
    }
    if (!reason.trim()) {
      toast.error('사유를 입력해주세요.');
      return;
    }
    if (approvers.length === 0) {
      toast.error('결재 라인을 찾을 수 없습니다. 관리자에게 문의하세요.');
      return;
    }

    const now = new Date().toISOString();
    const approvalId = `ap-att-${Date.now()}`;

    // Approval 생성
    const approval: Approval = {
      id: approvalId,
      title: `[${selectedOption?.label}] ${requester.name} - ${startDate}${endDate && endDate !== startDate ? ` ~ ${endDate}` : ''}`,
      type: 'attendance_request',
      requester_id: employeeId,
      content: {
        requestType: type,
        requestTypeLabel: selectedOption?.label ?? '',
        startDate,
        endDate: isHalfType ? startDate : (endDate || startDate),
        halfPeriod: isHalfType ? halfPeriod : null,
        days: calculatedDays,
        location: needsLocation ? location : null,
        purpose: needsLocation ? purpose : null,
        reason,
      },
      status: 'pending',
      created_at: now,
      completed_at: null,
    };

    // ApprovalLine 생성 (자동 탐색된 결재자)
    const lines: ApprovalLine[] = approvers.map((approver, idx) => ({
      id: `al-att-${Date.now()}-${idx}`,
      approval_id: approvalId,
      approver_id: approver.id,
      step: idx + 1,
      status: 'pending',
      comment: null,
      acted_at: null,
    }));

    createApproval(approval, lines);

    // 첫 결재자에게 알림 발송
    const firstApprover = approvers[0];
    if (firstApprover) {
      addNotification({
        recipient_id: firstApprover.id,
        type: 'approval_request',
        title: '새 결재 요청',
        message: `${requester.name} ${requesterRank?.name ?? ''}님이 ${selectedOption?.label} 결재를 요청했습니다.`,
        link: `/approval/${approvalId}`,
        related_id: approvalId,
      });
    }

    toast.success(
      `${selectedOption?.label} 신청이 접수되었습니다. 결재자: ${approvers.map((a) => a.name).join(' → ')}`,
    );

    resetForm();
    onOpenChange(false);
    onSuccess?.();
  };

  if (!session || !requester) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            근태 신청 (전자결재)
          </DialogTitle>
          <DialogDescription>
            외근/출장/휴가/재택근무를 신청합니다. 결재가 완료되면 알림을 받습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 신청자 정보 */}
          <div className="p-3 rounded-lg bg-muted/50 text-sm flex items-center justify-between">
            <div>
              <span className="text-muted-foreground">신청자:</span>{' '}
              <strong>{requester.name}</strong>{' '}
              <span className="text-muted-foreground">
                {requesterDept?.name} · {requesterRank?.name}
              </span>
            </div>
          </div>

          {/* 신청 유형 */}
          <div className="space-y-2">
            <Label>신청 유형 *</Label>
            <Select value={type} onValueChange={(v) => setType(v as AttendanceRequestType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex flex-col items-start">
                      <span>{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 기간 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{isHalfType ? '일자 *' : '시작일 *'}</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            {!isHalfType && (
              <div className="space-y-2">
                <Label>종료일</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            )}
            {isHalfType && (
              <div className="space-y-2">
                <Label>시간대 *</Label>
                <Select value={halfPeriod} onValueChange={(v) => setHalfPeriod(v as 'am' | 'pm')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="am">오전</SelectItem>
                    <SelectItem value="pm">오후</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {startDate && (
            <div className="text-sm text-muted-foreground">
              총 <strong className="text-foreground">{calculatedDays}</strong>
              {type.startsWith('leave') ? '일' : '일간'}
            </div>
          )}

          {/* 장소/목적 (외근/출장만) */}
          {needsLocation && (
            <>
              <div className="space-y-2">
                <Label>장소 *</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="예) 부산 ABC고객사"
                />
              </div>
              <div className="space-y-2">
                <Label>목적</Label>
                <Input
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="예) 제품 납품 회의"
                />
              </div>
            </>
          )}

          {/* 사유 */}
          <div className="space-y-2">
            <Label>사유 *</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="상세 사유를 입력해주세요"
              rows={3}
            />
          </div>

          {/* 결재 라인 미리보기 */}
          <div className="p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  결재 라인 {customApprovers ? '(수동)' : '(자동)'}
                </span>
                {customApprovers && (
                  <Badge variant="secondary" className="text-[10px]">변경됨</Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setLineEditorOpen(true)}
              >
                <Edit className="h-3 w-3 mr-1" />
                결재라인 변경
              </Button>
            </div>
            {approvers.length === 0 ? (
              <p className="text-xs text-destructive">결재자를 찾을 수 없습니다. &quot;결재라인 변경&quot;을 눌러 직접 추가하세요.</p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {requester.name} (신청)
                </Badge>
                {approvers.map((a, idx) => {
                  const rank = positionRanks.find((r) => r.id === a.position_rank_id);
                  const dept = departments.find((d) => d.id === a.department_id);
                  return (
                    <div key={a.id} className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <Badge className="text-xs">
                        {idx + 1}. {a.name} ({rank?.name ?? ''})
                        <span className="ml-1 text-[10px] opacity-70">· {dept?.name ?? ''}</span>
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={approvers.length === 0}>
            <FileCheck className="h-4 w-4 mr-2" />
            결재 요청
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* 결재라인 변경 다이얼로그 */}
      <ApprovalLineEditor
        open={lineEditorOpen}
        onOpenChange={setLineEditorOpen}
        value={approvers}
        onChange={handleLineChange}
        requester={requester}
        employees={employees}
        positionRanks={positionRanks}
        departments={departments}
      />
    </Dialog>
  );
}
