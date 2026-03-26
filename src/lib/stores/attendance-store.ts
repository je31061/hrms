'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Attendance, AttendanceStatus, LeaveTimePeriod } from '@/types';

// ---------------------------------------------------------------------------
// Seed data — Feb 2026 records (07:00~16:00 default schedule)
// ---------------------------------------------------------------------------

function seedRecords(): Attendance[] {
  const records: Attendance[] = [];
  let idx = 1;
  const employees = [
    'e010', 'e011', 'e012', 'e013', 'e014', 'e015', 'e017', 'e018', 'e019', 'e020',
    'e022', 'e023', 'e024', 'e027', 'e028', 'e029', 'e030', 'e031', 'e032', 'e034',
    'e038', 'e041', 'e045', 'e046', 'e051', 'e052', 'e057', 'e059', 'e063', 'e064',
    'e068', 'e069', 'e073', 'e074', 'e081', 'e082', 'e088', 'e089', 'e092', 'e097',
  ];
  const febWeekdays = [
    '2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05', '2026-02-06',
    '2026-02-09', '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13',
    '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20',
    '2026-02-23', '2026-02-24', '2026-02-25', '2026-02-26', '2026-02-27',
  ];
  const marWeekdays = [
    '2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06',
  ];
  const allWeekdays = [...febWeekdays, ...marWeekdays];
  const recentDays = allWeekdays.slice(-5);
  // Clock-in times reflecting 06:00~08:00 flex range
  const clockTimes = ['06:30', '06:45', '06:50', '06:55', '07:00', '07:05', '07:10', '07:15', '07:20', '07:30', '07:40', '07:50', '08:05'];
  // Scheduled start times for flex workers
  const flexStarts = ['06:00', '06:30', '07:00', '07:30', '08:00'];
  const flexEnds = ['15:00', '15:30', '16:00', '16:30', '17:00'];

  const assignments: [string, string, string, number | null, string, string | null, string | null][] = [
    // Detailed records for key employees
    ['e022', '2026-03-06', '06:52', null, 'normal', '07:00', '16:00'],
    ['e022', '2026-03-05', '06:48', 9.28, 'normal', '07:00', '16:00'],
    ['e022', '2026-03-04', '07:12', 9.3, 'normal', '07:00', '16:00'],
    ['e022', '2026-03-03', '06:55', 9.08, 'normal', '07:00', '16:00'],
    ['e022', '2026-03-02', '06:50', 10.67, 'normal', '07:00', '16:00'],
    ['e022', '2026-02-27', '06:58', 9.2, 'normal', '07:00', '16:00'],
    ['e022', '2026-02-26', '06:45', 9.25, 'normal', '07:00', '16:00'],
    ['e022', '2026-02-25', '06:50', 8.17, 'normal', '07:00', '16:00'],
    ['e022', '2026-02-24', '06:55', 9.08, 'normal', '07:00', '16:00'],
    ['e022', '2026-02-23', '06:50', 9.0, 'normal', '07:00', '16:00'],
    ['e010', '2026-03-06', '06:30', null, 'normal', '06:30', '15:30'],
    ['e010', '2026-03-05', '06:45', 9.0, 'normal', '06:30', '15:30'],
    ['e010', '2026-03-04', '07:05', 8.5, 'normal', '07:00', '16:00'],
    ['e010', '2026-03-03', '06:40', 9.2, 'normal', '06:30', '15:30'],
    ['e010', '2026-03-02', '06:35', 9.1, 'normal', '06:30', '15:30'],
  ];
  // Generate records for remaining employees on recent days
  const detailedEmps = new Set(['e022', 'e010']);
  for (const empId of employees) {
    if (detailedEmps.has(empId)) continue;
    for (const day of recentDays) {
      const ci = clockTimes[(empId.charCodeAt(3) + day.charCodeAt(9)) % clockTimes.length];
      const [h, m] = ci.split(':').map(Number);
      const flexIdx = (empId.charCodeAt(2) + empId.charCodeAt(3)) % flexStarts.length;
      const schedStart = flexStarts[flexIdx];
      const schedEnd = flexEnds[flexIdx];
      const [sh, sm] = schedStart.split(':').map(Number);
      const isLate = h > sh || (h === sh && m > sm + 10); // 10 min grace
      const isToday = day === recentDays[recentDays.length - 1];
      const wh = isToday ? null : 8.5 + ((empId.charCodeAt(2) + day.charCodeAt(8)) % 20) / 10;
      assignments.push([empId, day, ci, wh, isLate ? 'late' : 'normal', schedStart, schedEnd]);
    }
  }

  for (const [empId, date, clockInTime, workHours, status, schedStart, schedEnd] of assignments) {
    const clockIn = `${date}T${clockInTime}:00+09:00`;
    let clockOut: string | null = null;
    let overtime = 0;
    if (workHours !== null) {
      const [h, m] = clockInTime.split(':').map(Number);
      const totalMinutes = h * 60 + m + Math.round(workHours * 60);
      const outH = Math.floor(totalMinutes / 60);
      const outM = totalMinutes % 60;
      clockOut = `${date}T${String(outH).padStart(2, '0')}:${String(outM).padStart(2, '0')}:00+09:00`;
      if (workHours > 8) overtime = Math.round((workHours - 8) * 100) / 100;
    }
    records.push({
      id: `att-${String(idx++).padStart(3, '0')}`,
      employee_id: empId,
      date,
      clock_in: clockIn,
      clock_out: clockOut,
      work_hours: workHours,
      overtime_hours: overtime,
      status: status as AttendanceStatus,
      note: status === 'late' ? '지각' : null,
      attendance_type: 'office',
      scheduled_start: schedStart ?? '07:00',
      scheduled_end: schedEnd ?? '16:00',
      created_at: date,
    });
  }
  return records;
}

// ---------------------------------------------------------------------------
// Store types
// ---------------------------------------------------------------------------

export interface AttendanceCloseout {
  id: string;
  year: number;
  month: number;
  closed_by: string;
  closed_by_name: string;
  closed_at: string;
  note: string | null;
}

interface AttendanceState {
  records: Attendance[];
  closeouts: AttendanceCloseout[];
}

interface AttendanceActions {
  clockIn: (employeeId: string, type?: string, scheduledStart?: string, scheduledEnd?: string, graceMinutes?: number) => void;
  clockOut: (employeeId: string) => void;
  addRecord: (record: Attendance) => void;
  updateRecord: (id: string, data: Partial<Attendance>) => void;
  addHalfDayRecord: (employeeId: string, date: string, leaveTimePeriod: LeaveTimePeriod, scheduledStart?: string, scheduledEnd?: string) => void;
  closeMonth: (year: number, month: number, closedBy: string, closedByName: string, note?: string) => void;
  reopenMonth: (year: number, month: number) => void;
}

interface AttendanceGetters {
  getRecordsByDate: (date: string) => Attendance[];
  getRecordsByEmployee: (empId: string) => Attendance[];
  getRecordsByEmployeeAndMonth: (empId: string, year: number, month: number) => Attendance[];
  getTodayRecord: (empId: string) => Attendance | undefined;
  getTodaySummary: () => { total: number; normal: number; late: number; half_day: number; quarter_day: number; byType: Record<string, number> };
  getCloseout: (year: number, month: number) => AttendanceCloseout | undefined;
}

export type AttendanceStore = AttendanceState & AttendanceActions & AttendanceGetters;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAttendanceStore = create<AttendanceStore>()(
  persist(
    (set, get) => ({
      records: seedRecords(),
      closeouts: [] as AttendanceCloseout[],

      clockIn: (employeeId, type = 'office', scheduledStart = '07:00', scheduledEnd = '16:00', graceMinutes = 0) => {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const existing = get().records.find((r) => r.employee_id === employeeId && r.date === date);
        if (existing) return;

        const hours = now.getHours();
        const minutes = now.getMinutes();
        const [sh, sm] = scheduledStart.split(':').map(Number);
        const clockMinutes = hours * 60 + minutes;
        const deadlineMinutes = sh * 60 + sm + graceMinutes;
        const isLate = clockMinutes > deadlineMinutes;
        const pad = (n: number) => String(n).padStart(2, '0');
        const clockInStr = `${date}T${pad(hours)}:${pad(minutes)}:${pad(now.getSeconds())}+09:00`;

        const record: Attendance = {
          id: `att-${Date.now()}`,
          employee_id: employeeId,
          date,
          clock_in: clockInStr,
          clock_out: null,
          work_hours: null,
          overtime_hours: 0,
          status: isLate ? 'late' : 'normal',
          note: isLate ? '지각' : null,
          attendance_type: type,
          scheduled_start: scheduledStart,
          scheduled_end: scheduledEnd,
          created_at: now.toISOString(),
        };
        set((s) => ({ records: [record, ...s.records] }));
      },

      clockOut: (employeeId) => {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const pad = (n: number) => String(n).padStart(2, '0');
        const clockOutStr = `${date}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}+09:00`;

        set((s) => ({
          records: s.records.map((r) => {
            if (r.employee_id === employeeId && r.date === date && !r.clock_out) {
              const inTime = new Date(r.clock_in!);
              const diffMs = now.getTime() - inTime.getTime();
              const workHours = Math.round((diffMs / 3600000) * 100) / 100;
              const overtime = workHours > 8 ? Math.round((workHours - 8) * 100) / 100 : 0;
              // Check early leave
              const [eh, em] = (r.scheduled_end ?? '16:00').split(':').map(Number);
              const isEarlyLeave = now.getHours() < eh || (now.getHours() === eh && now.getMinutes() < em);
              let newStatus = r.status;
              if (isEarlyLeave && r.status === 'normal') {
                newStatus = 'early_leave';
              }
              return {
                ...r,
                clock_out: clockOutStr,
                work_hours: workHours,
                overtime_hours: overtime,
                status: newStatus,
                note: newStatus === 'early_leave' ? '조퇴' : r.note,
              };
            }
            return r;
          }),
        }));
      },

      addHalfDayRecord: (employeeId, date, leaveTimePeriod, scheduledStart = '07:00', scheduledEnd = '16:00') => {
        const existing = get().records.find((r) => r.employee_id === employeeId && r.date === date);
        if (existing) return;

        const isHalf = leaveTimePeriod === 'am_half' || leaveTimePeriod === 'pm_half';
        const isAm = leaveTimePeriod === 'am_half' || leaveTimePeriod === 'am_quarter';
        const workHours = isHalf ? 4 : isAm ? 6 : 6; // quarter = 2h off, 6h work
        const status: AttendanceStatus = isHalf ? 'half_day' : 'quarter_day';

        // Calculate actual work times based on period
        let clockIn: string;
        let clockOut: string;
        const [startH] = scheduledStart.split(':').map(Number);
        const [endH] = scheduledEnd.split(':').map(Number);

        if (isAm) {
          // AM leave: come in later
          const lateStart = isHalf ? startH + 4 : startH + 2;
          clockIn = `${date}T${String(lateStart).padStart(2, '0')}:00:00+09:00`;
          clockOut = `${date}T${String(endH).padStart(2, '0')}:00:00+09:00`;
        } else {
          // PM leave: leave early
          const earlyEnd = isHalf ? endH - 4 : endH - 2;
          clockIn = `${date}T${String(startH).padStart(2, '0')}:00:00+09:00`;
          clockOut = `${date}T${String(earlyEnd).padStart(2, '0')}:00:00+09:00`;
        }

        const record: Attendance = {
          id: `att-${Date.now()}`,
          employee_id: employeeId,
          date,
          clock_in: clockIn,
          clock_out: clockOut,
          work_hours: workHours,
          overtime_hours: 0,
          status,
          note: isHalf
            ? (isAm ? '오전반차' : '오후반차')
            : (isAm ? '오전반반차' : '오후반반차'),
          attendance_type: 'office',
          leave_time_period: leaveTimePeriod,
          scheduled_start: scheduledStart,
          scheduled_end: scheduledEnd,
          created_at: new Date().toISOString(),
        };
        set((s) => ({ records: [record, ...s.records] }));
      },

      addRecord: (record) =>
        set((s) => ({ records: [record, ...s.records] })),

      updateRecord: (id, data) =>
        set((s) => ({
          records: s.records.map((r) => (r.id === id ? { ...r, ...data } : r)),
        })),

      getRecordsByDate: (date) => get().records.filter((r) => r.date === date),

      getRecordsByEmployee: (empId) =>
        get().records
          .filter((r) => r.employee_id === empId)
          .sort((a, b) => b.date.localeCompare(a.date)),

      getRecordsByEmployeeAndMonth: (empId, year, month) =>
        get().records
          .filter((r) => {
            if (r.employee_id !== empId) return false;
            const d = new Date(r.date);
            return d.getFullYear() === year && d.getMonth() + 1 === month;
          })
          .sort((a, b) => b.date.localeCompare(a.date)),

      getTodayRecord: (empId) => {
        const today = new Date().toISOString().split('T')[0];
        return get().records.find((r) => r.employee_id === empId && r.date === today);
      },

      getTodaySummary: () => {
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = get().records.filter((r) => r.date === today);
        const byType: Record<string, number> = {};
        let normal = 0;
        let late = 0;
        let half_day = 0;
        let quarter_day = 0;
        for (const r of todayRecords) {
          if (r.status === 'late') late++;
          else if (r.status === 'half_day') half_day++;
          else if (r.status === 'quarter_day') quarter_day++;
          else normal++;
          const t = r.attendance_type ?? 'office';
          byType[t] = (byType[t] ?? 0) + 1;
        }
        return { total: todayRecords.length, normal, late, half_day, quarter_day, byType };
      },

      closeMonth: (year, month, closedBy, closedByName, note) => {
        const existing = get().closeouts.find((c) => c.year === year && c.month === month);
        if (existing) return;
        set((s) => ({
          closeouts: [...s.closeouts, {
            id: `close-${year}-${month}`,
            year, month,
            closed_by: closedBy,
            closed_by_name: closedByName,
            closed_at: new Date().toISOString(),
            note: note ?? null,
          }],
        }));
      },

      reopenMonth: (year, month) => {
        set((s) => ({
          closeouts: s.closeouts.filter((c) => !(c.year === year && c.month === month)),
        }));
      },

      getCloseout: (year, month) =>
        get().closeouts.find((c) => c.year === year && c.month === month),
    }),
    { name: 'hrms-attendance', version: 4, migrate: () => ({}) },
  ),
);
