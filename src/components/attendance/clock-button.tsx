'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAttendanceStore } from '@/lib/stores/attendance-store';
import { useAuthStore } from '@/lib/stores/auth-store';

export function ClockButton() {
  const session = useAuthStore((s) => s.session);
  const employeeId = session?.employee_id ?? 'e022';
  const clockIn = useAttendanceStore((s) => s.clockIn);
  const clockOut = useAttendanceStore((s) => s.clockOut);
  const getTodayRecord = useAttendanceStore((s) => s.getTodayRecord);

  const todayRecord = getTodayRecord(employeeId);
  const isClockedIn = !!todayRecord && !todayRecord.clock_out;

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatClockTime = (isoStr: string | null) => {
    if (!isoStr) return '--:--:--';
    const d = new Date(isoStr);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleClockIn = () => {
    clockIn(employeeId);
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
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-mono font-bold">{formatTime(currentTime)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
            <div className="flex gap-4 mt-2 text-sm">
              <span>출근: <strong>{formatClockTime(todayRecord?.clock_in ?? null)}</strong></span>
              <span>퇴근: <strong>{formatClockTime(todayRecord?.clock_out ?? null)}</strong></span>
            </div>
          </div>
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
      </CardContent>
    </Card>
  );
}
