'use client';

import { use } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EmployeeForm } from '@/components/employee/employee-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { Employee } from '@/types';

const demoDepartments = [
  { id: 'd1', name: '개발1팀', code: 'DEV1', parent_id: null, level: 3, sort_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: 'd2', name: '인사팀', code: 'HR', parent_id: null, level: 3, sort_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: 'd3', name: '재무팀', code: 'FIN', parent_id: null, level: 3, sort_order: 2, is_active: true, created_at: '', updated_at: '' },
];
const demoRanks = [
  { id: 'r1', name: '사원', level: 1, is_active: true },
  { id: 'r2', name: '대리', level: 2, is_active: true },
  { id: 'r3', name: '과장', level: 3, is_active: true },
];
const demoTitles = [
  { id: 't1', name: '팀원', level: 1, is_active: true },
  { id: 't3', name: '팀장', level: 3, is_active: true },
];

const demoEmployee: Employee = {
  id: '1', employee_number: 'EMP-001', name: '김철수', name_en: 'Kim Cheolsu', email: 'kim@company.com',
  phone: '010-1234-5678', birth_date: '1985-03-15', gender: 'M', address: '서울시 강남구 역삼로 123',
  address_detail: '101동 1001호', zip_code: '06241', department_id: 'd1',
  position_rank_id: 'r3', position_title_id: 't3', employment_type: 'regular',
  hire_date: '2018-03-02', resignation_date: null, status: 'active', base_salary: 5000000,
  bank_name: '국민은행', bank_account: '123-456-789012', profile_image_url: null,
  emergency_contact_name: '김배우자', emergency_contact_phone: '010-9999-8888',
  emergency_contact_relation: '배우자', created_at: '', updated_at: '',
};

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <div>
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-6">사원 수정</h1>
      <EmployeeForm
        employee={demoEmployee}
        departments={demoDepartments}
        positionRanks={demoRanks}
        positionTitles={demoTitles}
        onSubmit={(data) => {
          console.log('Update employee:', id, data);
          toast.success('사원 정보가 수정되었습니다.');
          router.push(`/employees/${id}`);
        }}
      />
    </div>
  );
}
