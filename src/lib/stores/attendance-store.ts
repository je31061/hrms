'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Attendance, AttendanceStatus } from '@/types';

// ---------------------------------------------------------------------------
// Seed data — Feb 2026 records
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
  // Generate Feb + early Mar records for all 40 employees
  const allWeekdays = [...febWeekdays, ...marWeekdays];
  // Each employee gets records for last 5 weekdays
  const recentDays = allWeekdays.slice(-5);
  const clockTimes = ['08:30', '08:35', '08:40', '08:45', '08:48', '08:50', '08:52', '08:55', '08:58', '09:02', '09:05', '09:10', '09:15'];
  // Spread records: manual assignments for detail + bulk generation
  const assignments: [string, string, string, number | null, string][] = [
    // Detailed records for key employees (e022, e010)
    ['e022', '2026-03-06', '08:52', null, 'normal'],
    ['e022', '2026-03-05', '08:48', 9.28, 'normal'],
    ['e022', '2026-03-04', '09:12', 9.3, 'late'],
    ['e022', '2026-03-03', '08:55', 9.08, 'normal'],
    ['e022', '2026-03-02', '08:50', 10.67, 'normal'],
    ['e022', '2026-02-27', '08:58', 9.2, 'normal'],
    ['e022', '2026-02-26', '08:45', 9.25, 'normal'],
    ['e022', '2026-02-25', '08:50', 8.17, 'normal'],
    ['e022', '2026-02-24', '08:55', 9.08, 'normal'],
    ['e022', '2026-02-23', '08:50', 9.0, 'normal'],
    ['e010', '2026-03-06', '08:30', null, 'normal'],
    ['e010', '2026-03-05', '08:45', 9.0, 'normal'],
    ['e010', '2026-03-04', '09:05', 8.5, 'late'],
    ['e010', '2026-03-03', '08:40', 9.2, 'normal'],
    ['e010', '2026-03-02', '08:35', 9.1, 'normal'],
  ];
  // Generate records for remaining employees on recent days
  const detailedEmps = new Set(['e022', 'e010']);
  for (const empId of employees) {
    if (detailedEmps.has(empId)) continue;
    for (const day of recentDays) {
      const ci = clockTimes[(empId.charCodeAt(3) + day.charCodeAt(9)) % clockTimes.length];
      const [h, m] = ci.split(':').map(Number);
      const isLate = h > 9 || (h === 9 && m > 0);
      const isToday = day === recentDays[recentDays.length - 1];
      const wh = isToday ? null : 8.5 + ((empId.charCodeAt(2) + day.charCodeAt(8)) % 20) / 10;
      assignments.push([empId, day, ci, wh, isLate ? 'late' : 'normal']);
    }
  }

  for (const [empId, date, clockInTime, workHours, status] of assignments) {
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
      created_at: date,
    });
  }
  return records;
}

// ---------------------------------------------------------------------------
// Store types
// ---------------------------------------------------------------------------

interface AttendanceState {
  records: Attendance[];
}

interface AttendanceActions {
  clockIn: (employeeId: string, type?: string) => void;
  clockOut: (employeeId: string) => void;
  addRecord: (record: Attendance) => void;
  updateRecord: (id: string, data: Partial<Attendance>) => void;
}

interface AttendanceGetters {
  getRecordsByDate: (date: string) => Attendance[];
  getRecordsByEmployee: (empId: string) => Attendance[];
  getRecordsByEmployeeAndMonth: (empId: string, year: number, month: number) => Attendance[];
  getTodayRecord: (empId: string) => Attendance | undefined;
  getTodaySummary: () => { total: number; normal: number; late: number; byType: Record<string, number> };
}

export type AttendanceStore = AttendanceState & AttendanceActions & AttendanceGetters;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAttendanceStore = create<AttendanceStore>()(
  persist(
    (set, get) => ({
      records: seedRecords(),

      clockIn: (employeeId, type = 'office') => {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const existing = get().records.find((r) => r.employee_id === employeeId && r.date === date);
        if (existing) return; // already clocked in today

        const hours = now.getHours();
        const minutes = now.getMinutes();
        const isLate = hours > 9 || (hours === 9 && minutes > 0);
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
              // Calculate work hours
              const inTime = new Date(r.clock_in!);
              const diffMs = now.getTime() - inTime.getTime();
              const workHours = Math.round((diffMs / 3600000) * 100) / 100;
              const overtime = workHours > 8 ? Math.round((workHours - 8) * 100) / 100 : 0;
              return { ...r, clock_out: clockOutStr, work_hours: workHours, overtime_hours: overtime };
            }
            return r;
          }),
        }));
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
        for (const r of todayRecords) {
          if (r.status === 'late') late++;
          else normal++;
          const t = r.attendance_type ?? 'office';
          byType[t] = (byType[t] ?? 0) + 1;
        }
        return { total: todayRecords.length, normal, late, byType };
      },
    }),
    { name: 'hrms-attendance', version: 2, migrate: () => ({}) },
  ),
);
