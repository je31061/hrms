'use client';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EmployeeForm } from '@/components/employee/employee-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const demoDepartments = [
  { id: 'd1', name: '개발1팀', code: 'DEV1', parent_id: null, level: 3, sort_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: 'd2', name: '인사팀', code: 'HR', parent_id: null, level: 3, sort_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: 'd3', name: '재무팀', code: 'FIN', parent_id: null, level: 3, sort_order: 2, is_active: true, created_at: '', updated_at: '' },
];

const demoRanks = [
  { id: 'r1', name: '사원', level: 1, is_active: true },
  { id: 'r2', name: '대리', level: 2, is_active: true },
  { id: 'r3', name: '과장', level: 3, is_active: true },
  { id: 'r4', name: '차장', level: 4, is_active: true },
  { id: 'r5', name: '부장', level: 5, is_active: true },
];

const demoTitles = [
  { id: 't1', name: '팀원', level: 1, is_active: true },
  { id: 't2', name: '파트장', level: 2, is_active: true },
  { id: 't3', name: '팀장', level: 3, is_active: true },
];

export default function NewEmployeePage() {
  const router = useRouter();

  return (
    <div>
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-6">사원 등록</h1>
      <EmployeeForm
        departments={demoDepartments}
        positionRanks={demoRanks}
        positionTitles={demoTitles}
        onSubmit={(data) => {
          console.log('New employee:', data);
          toast.success('사원이 등록되었습니다.');
          router.push('/employees');
        }}
      />
    </div>
  );
}
