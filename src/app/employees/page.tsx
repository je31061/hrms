import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EmployeeTable } from '@/components/employee/employee-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import type { Employee } from '@/types';

// Demo data
const demoEmployees: Employee[] = [
  {
    id: '1', employee_number: 'EMP-001', name: '김철수', name_en: 'Kim Cheolsu', email: 'kim@company.com',
    phone: '010-1234-5678', birth_date: '1985-03-15', gender: 'M', address: '서울시 강남구', address_detail: '역삼동 123',
    zip_code: '06241', department_id: 'd1', position_rank_id: 'r3', position_title_id: 't3',
    employment_type: 'regular', hire_date: '2018-03-02', resignation_date: null, status: 'active',
    base_salary: 5000000, bank_name: '국민은행', bank_account: '123-456-789012',
    profile_image_url: null, emergency_contact_name: '김배우자', emergency_contact_phone: '010-9999-8888',
    emergency_contact_relation: '배우자', created_at: '', updated_at: '',
    department: { id: 'd1', name: '개발1팀', code: 'DEV1', parent_id: null, level: 3, sort_order: 1, is_active: true, created_at: '', updated_at: '' },
    position_rank: { id: 'r3', name: '과장', level: 3, is_active: true },
    position_title: { id: 't3', name: '팀장', level: 3, is_active: true },
  },
  {
    id: '2', employee_number: 'EMP-002', name: '이영희', name_en: 'Lee Younghee', email: 'lee@company.com',
    phone: '010-2345-6789', birth_date: '1990-07-22', gender: 'F', address: '서울시 서초구', address_detail: null,
    zip_code: '06500', department_id: 'd1', position_rank_id: 'r2', position_title_id: 't1',
    employment_type: 'regular', hire_date: '2020-01-06', resignation_date: null, status: 'active',
    base_salary: 3800000, bank_name: '신한은행', bank_account: '110-234-567890',
    profile_image_url: null, emergency_contact_name: null, emergency_contact_phone: null,
    emergency_contact_relation: null, created_at: '', updated_at: '',
    department: { id: 'd1', name: '개발1팀', code: 'DEV1', parent_id: null, level: 3, sort_order: 1, is_active: true, created_at: '', updated_at: '' },
    position_rank: { id: 'r2', name: '대리', level: 2, is_active: true },
    position_title: { id: 't1', name: '팀원', level: 1, is_active: true },
  },
  {
    id: '3', employee_number: 'EMP-003', name: '박민수', name_en: 'Park Minsu', email: 'park@company.com',
    phone: '010-3456-7890', birth_date: '1992-11-05', gender: 'M', address: '경기도 성남시', address_detail: null,
    zip_code: '13494', department_id: 'd2', position_rank_id: 'r1', position_title_id: 't1',
    employment_type: 'regular', hire_date: '2023-06-15', resignation_date: null, status: 'active',
    base_salary: 3200000, bank_name: '하나은행', bank_account: '320-123-456789',
    profile_image_url: null, emergency_contact_name: null, emergency_contact_phone: null,
    emergency_contact_relation: null, created_at: '', updated_at: '',
    department: { id: 'd2', name: '인사팀', code: 'HR', parent_id: null, level: 3, sort_order: 1, is_active: true, created_at: '', updated_at: '' },
    position_rank: { id: 'r1', name: '사원', level: 1, is_active: true },
    position_title: { id: 't1', name: '팀원', level: 1, is_active: true },
  },
  {
    id: '4', employee_number: 'EMP-004', name: '최지은', name_en: 'Choi Jieun', email: 'choi@company.com',
    phone: '010-4567-8901', birth_date: '1988-01-30', gender: 'F', address: '서울시 마포구', address_detail: null,
    zip_code: '04100', department_id: 'd3', position_rank_id: 'r4', position_title_id: 't3',
    employment_type: 'regular', hire_date: '2015-09-01', resignation_date: null, status: 'active',
    base_salary: 6200000, bank_name: '우리은행', bank_account: '1002-123-456789',
    profile_image_url: null, emergency_contact_name: null, emergency_contact_phone: null,
    emergency_contact_relation: null, created_at: '', updated_at: '',
    department: { id: 'd3', name: '재무팀', code: 'FIN', parent_id: null, level: 3, sort_order: 2, is_active: true, created_at: '', updated_at: '' },
    position_rank: { id: 'r4', name: '차장', level: 4, is_active: true },
    position_title: { id: 't3', name: '팀장', level: 3, is_active: true },
  },
  {
    id: '5', employee_number: 'EMP-005', name: '정우진', name_en: null, email: 'jung@company.com',
    phone: '010-5678-9012', birth_date: '1995-05-20', gender: 'M', address: '서울시 송파구', address_detail: null,
    zip_code: '05500', department_id: 'd1', position_rank_id: 'r1', position_title_id: 't1',
    employment_type: 'contract', hire_date: '2025-11-01', resignation_date: null, status: 'active',
    base_salary: 2800000, bank_name: '카카오뱅크', bank_account: '3333-01-1234567',
    profile_image_url: null, emergency_contact_name: null, emergency_contact_phone: null,
    emergency_contact_relation: null, created_at: '', updated_at: '',
    department: { id: 'd1', name: '개발1팀', code: 'DEV1', parent_id: null, level: 3, sort_order: 1, is_active: true, created_at: '', updated_at: '' },
    position_rank: { id: 'r1', name: '사원', level: 1, is_active: true },
    position_title: { id: 't1', name: '팀원', level: 1, is_active: true },
  },
];

export default function EmployeesPage() {
  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">인사정보 관리</h1>
        <Link href="/employees/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            사원 등록
          </Button>
        </Link>
      </div>
      <EmployeeTable employees={demoEmployees} />
    </div>
  );
}
