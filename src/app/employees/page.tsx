'use client';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EmployeeTable } from '@/components/employee/employee-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useEmployeeStore } from '@/lib/stores/employee-store';

export default function EmployeesPage() {
  const employees = useEmployeeStore((s) => s.getActiveEmployees());

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
      <EmployeeTable employees={employees} />
    </div>
  );
}
