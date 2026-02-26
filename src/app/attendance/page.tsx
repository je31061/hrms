import { Breadcrumb } from '@/components/layout/breadcrumb';
import { ClockButton } from '@/components/attendance/clock-button';
import { AttendanceTable } from '@/components/attendance/attendance-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import Link from 'next/link';
import type { Attendance } from '@/types';

const demoRecords: Attendance[] = [
  { id: '1', employee_id: '1', date: '2026-02-19', clock_in: '2026-02-19T08:55:00+09:00', clock_out: null, work_hours: null, overtime_hours: 0, status: 'normal', note: null, created_at: '', employee: { id: '1', employee_number: 'EMP-001', name: '김철수', name_en: null, email: '', phone: null, birth_date: null, gender: null, address: null, address_detail: null, zip_code: null, department_id: null, position_rank_id: null, position_title_id: null, employment_type: 'regular', hire_date: '', resignation_date: null, status: 'active', base_salary: 0, bank_name: null, bank_account: null, profile_image_url: null, emergency_contact_name: null, emergency_contact_phone: null, emergency_contact_relation: null, created_at: '', updated_at: '' } },
  { id: '2', employee_id: '2', date: '2026-02-19', clock_in: '2026-02-19T09:10:00+09:00', clock_out: null, work_hours: null, overtime_hours: 0, status: 'late', note: '교통 지연', created_at: '', employee: { id: '2', employee_number: 'EMP-002', name: '이영희', name_en: null, email: '', phone: null, birth_date: null, gender: null, address: null, address_detail: null, zip_code: null, department_id: null, position_rank_id: null, position_title_id: null, employment_type: 'regular', hire_date: '', resignation_date: null, status: 'active', base_salary: 0, bank_name: null, bank_account: null, profile_image_url: null, emergency_contact_name: null, emergency_contact_phone: null, emergency_contact_relation: null, created_at: '', updated_at: '' } },
  { id: '3', employee_id: '1', date: '2026-02-18', clock_in: '2026-02-18T08:50:00+09:00', clock_out: '2026-02-18T18:05:00+09:00', work_hours: 9.25, overtime_hours: 1.25, status: 'normal', note: null, created_at: '', employee: { id: '1', employee_number: 'EMP-001', name: '김철수', name_en: null, email: '', phone: null, birth_date: null, gender: null, address: null, address_detail: null, zip_code: null, department_id: null, position_rank_id: null, position_title_id: null, employment_type: 'regular', hire_date: '', resignation_date: null, status: 'active', base_salary: 0, bank_name: null, bank_account: null, profile_image_url: null, emergency_contact_name: null, emergency_contact_phone: null, emergency_contact_relation: null, created_at: '', updated_at: '' } },
  { id: '4', employee_id: '2', date: '2026-02-18', clock_in: '2026-02-18T09:00:00+09:00', clock_out: '2026-02-18T17:00:00+09:00', work_hours: 8.0, overtime_hours: 0, status: 'normal', note: null, created_at: '', employee: { id: '2', employee_number: 'EMP-002', name: '이영희', name_en: null, email: '', phone: null, birth_date: null, gender: null, address: null, address_detail: null, zip_code: null, department_id: null, position_rank_id: null, position_title_id: null, employment_type: 'regular', hire_date: '', resignation_date: null, status: 'active', base_salary: 0, bank_name: null, bank_account: null, profile_image_url: null, emergency_contact_name: null, emergency_contact_phone: null, emergency_contact_relation: null, created_at: '', updated_at: '' } },
];

export default function AttendancePage() {
  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">근태관리</h1>
        <Link href="/attendance/monthly">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            월별 현황
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <ClockButton />

        <div className="grid gap-4 grid-cols-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">출근</p>
              <p className="text-2xl font-bold">98</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">지각</p>
              <p className="text-2xl font-bold text-destructive">3</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">결근</p>
              <p className="text-2xl font-bold text-destructive">1</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">휴가</p>
              <p className="text-2xl font-bold">8</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">금일 근태 현황</h2>
          <AttendanceTable records={demoRecords} />
        </div>
      </div>
    </div>
  );
}
