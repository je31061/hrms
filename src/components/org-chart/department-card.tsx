import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Building2 } from 'lucide-react';
import type { Department } from '@/types';
import Link from 'next/link';

interface DepartmentCardProps {
  department: Department;
  employeeCount?: number;
}

export function DepartmentCard({ department, employeeCount = 0 }: DepartmentCardProps) {
  return (
    <Link href={`/organization/departments/${department.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {department.name}
            </CardTitle>
            <Badge variant="outline">{department.code}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{employeeCount}명</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
