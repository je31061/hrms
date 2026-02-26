'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function ClockButton() {
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [clockOutTime, setClockOutTime] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleClockIn = () => {
    const now = new Date();
    setClockInTime(formatTime(now));
    setClockedIn(true);
    toast.success('출근이 기록되었습니다.');
  };

  const handleClockOut = () => {
    const now = new Date();
    setClockOutTime(formatTime(now));
    setClockedIn(false);
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
              <span>출근: <strong>{clockInTime ?? '--:--:--'}</strong></span>
              <span>퇴근: <strong>{clockOutTime ?? '--:--:--'}</strong></span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleClockIn} disabled={clockedIn} size="lg">
              <LogIn className="h-4 w-4 mr-2" />
              출근
            </Button>
            <Button onClick={handleClockOut} disabled={!clockedIn} variant="outline" size="lg">
              <LogOut className="h-4 w-4 mr-2" />
              퇴근
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
