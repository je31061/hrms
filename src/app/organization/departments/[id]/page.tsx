import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, Users, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

// Demo data
const demoEmployees = [
  { id: '1', name: '김팀장', rank: '과장', title: '팀장', email: 'kim@company.com', phone: '010-1234-5678' },
  { id: '2', name: '이대리', rank: '대리', title: '팀원', email: 'lee@company.com', phone: '010-2345-6789' },
  { id: '3', name: '박사원', rank: '사원', title: '팀원', email: 'park@company.com', phone: '010-3456-7890' },
  { id: '4', name: '최사원', rank: '사원', title: '팀원', email: 'choi@company.com', phone: '010-4567-8901' },
];

export default async function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">부서 상세</h1>
        <Badge variant="outline">ID: {id.slice(0, 8)}...</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">부서 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">부서명</p>
              <p className="font-medium">개발1팀</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">부서코드</p>
              <p className="font-medium">DEV1</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">상위부서</p>
              <p className="font-medium">개발본부</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">인원</p>
              <p className="font-medium flex items-center gap-1">
                <Users className="h-4 w-4" />
                {demoEmployees.length}명
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">소속 직원</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoEmployees.map((emp) => (
                <Link
                  key={emp.id}
                  href={`/employees/${emp.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <Avatar>
                    <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{emp.name}</span>
                      <Badge variant="secondary" className="text-xs">{emp.rank}</Badge>
                      <Badge variant="outline" className="text-xs">{emp.title}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {emp.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {emp.phone}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
