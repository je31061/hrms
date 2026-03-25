'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, LogIn, LogOut, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { useAttendanceStore } from '@/lib/stores/attendance-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { LEAVE_TIME_PERIODS } from '@/lib/constants/codes';

function generateTimeOptions(min: string, max: string, intervalMin = 30): string[] {
  const [minH, minM] = min.split(':').map(Number);
  const [maxH, maxM] = max.split(':').map(Number);
  const options: string[] = [];
  let cur = minH * 60 + minM;
  const end = maxH * 60 + maxM;
  while (cur <= end) {
    const h = Math.floor(cur / 60);
    const m = cur % 60;
    options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    cur += intervalMin;
  }
  return options;
}

function calcEndTime(startTime: string, workHoursTotal: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const endMin = h * 60 + m + workHoursTotal * 60;
  const eh = Math.floor(endMin / 60);
  const em = endMin % 60;
  return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
}

export function ClockButton() {
  const session = useAuthStore((s) => s.session);
  const employeeId = session?.employee_id ?? 'e022';
  const clockIn = useAttendanceStore((s) => s.clockIn);
  const clockOut = useAttendanceStore((s) => s.clockOut);
  const getTodayRecord = useAttendanceStore((s) => s.getTodayRecord);
  const work = useSettingsStore((s) => s.work);

  const todayRecord = getTodayRecord(employeeId);
  const isClockedIn = !!todayRecord && !todayRecord.clock_out;
  const isDone = !!todayRecord?.clock_out;

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState(work.default_start_time);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const startOptions = useMemo(() => {
    if (!work.flex_work_enabled) return [work.default_start_time];
    return generateTimeOptions(work.flex_start_min, work.flex_start_max);
  }, [work]);

  const selectedEnd = useMemo(() => {
    // 8h work + 1h lunch = 9h total
    return calcEndTime(selectedStart, 9);
  }, [selectedStart]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatClockTime = (isoStr: string | null) => {
    if (!isoStr) return '--:--:--';
    const d = new Date(isoStr);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleClockIn = () => {
    clockIn(employeeId, 'office', selectedStart, selectedEnd);
    toast.success('출근이 기록되었습니다.');
  };

  const handleClockOut = () => {
    clockOut(employeeId);
    toast.success('퇴근이 기록되었습니다.');
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-mono font-bold">{formatTime(currentTime)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
            <div className="flex gap-4 text-sm">
              <span>출근: <strong>{formatClockTime(todayRecord?.clock_in ?? null)}</strong></span>
              <span>퇴근: <strong>{formatClockTime(todayRecord?.clock_out ?? null)}</strong></span>
            </div>
            {todayRecord?.leave_time_period && (
              <Badge variant="secondary" className="mt-1">
                {LEAVE_TIME_PERIODS[todayRecord.leave_time_period as keyof typeof LEAVE_TIME_PERIODS]}
              </Badge>
            )}
          </div>
          <div className="flex flex-col items-end gap-3">
            {/* Flex schedule selector */}
            {work.flex_work_enabled && !todayRecord && (
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedStart} onValueChange={setSelectedStart}>
                  <SelectTrigger className="w-[100px] h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {startOptions.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">~</span>
                <span className="text-sm font-medium w-[50px]">{selectedEnd}</span>
              </div>
            )}
            {todayRecord && (
              <div className="text-sm text-muted-foreground">
                근무시간: {todayRecord.scheduled_start ?? work.default_start_time} ~ {todayRecord.scheduled_end ?? work.default_end_time}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleClockIn} disabled={!!todayRecord} size="lg">
                <LogIn className="h-4 w-4 mr-2" />
                출근
              </Button>
              <Button onClick={handleClockOut} disabled={!isClockedIn} variant="outline" size="lg">
                <LogOut className="h-4 w-4 mr-2" />
                퇴근
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
