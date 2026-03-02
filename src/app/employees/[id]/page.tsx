'use client';

import { use } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EmployeeCard } from '@/components/employee/employee-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import { DEGREE_LABELS } from '@/lib/constants/positions';

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const getEmployeeById = useEmployeeStore((s) => s.getEmployeeById);
  const getCareerByEmployee = useEmployeeStore((s) => s.getCareerByEmployee);
  const getEducationByEmployee = useEmployeeStore((s) => s.getEducationByEmployee);
  const getCertsByEmployee = useEmployeeStore((s) => s.getCertsByEmployee);
  const getFamilyByEmployee = useEmployeeStore((s) => s.getFamilyByEmployee);

  const employee = getEmployeeById(id);
  const career = getCareerByEmployee(id);
  const education = getEducationByEmployee(id);
  const certs = getCertsByEmployee(id);
  const family = getFamilyByEmployee(id);

  if (!employee) {
    return (
      <div>
        <Breadcrumb />
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">사원 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">사원 상세</h1>
        <Link href={`/employees/${id}/edit`}>
          <Button variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            수정
          </Button>
        </Link>
      </div>

      <EmployeeCard employee={employee} />

      <Tabs defaultValue="basic" className="mt-6">
        <TabsList>
          <TabsTrigger value="basic">기본정보</TabsTrigger>
          <TabsTrigger value="career">경력사항</TabsTrigger>
          <TabsTrigger value="education">학력사항</TabsTrigger>
          <TabsTrigger value="certification">자격증</TabsTrigger>
          <TabsTrigger value="family">가족사항</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardContent className="pt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div><p className="text-sm text-muted-foreground">사원번호</p><p className="font-medium">{employee.employee_number}</p></div>
              <div><p className="text-sm text-muted-foreground">이메일</p><p className="font-medium">{employee.email}</p></div>
              <div><p className="text-sm text-muted-foreground">전화번호</p><p className="font-medium">{employee.phone ?? '-'}</p></div>
              <div><p className="text-sm text-muted-foreground">생년월일</p><p className="font-medium">{employee.birth_date ?? '-'}</p></div>
              <div><p className="text-sm text-muted-foreground">주소</p><p className="font-medium">{employee.address ?? '-'} {employee.address_detail ?? ''}</p></div>
              <div><p className="text-sm text-muted-foreground">은행</p><p className="font-medium">{employee.bank_name ?? '-'} {employee.bank_account ?? ''}</p></div>
              <div><p className="text-sm text-muted-foreground">비상연락처</p><p className="font-medium">{employee.emergency_contact_name ? `${employee.emergency_contact_name} (${employee.emergency_contact_relation}) ${employee.emergency_contact_phone}` : '-'}</p></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="career">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>회사명</TableHead>
                    <TableHead>부서</TableHead>
                    <TableHead>직위</TableHead>
                    <TableHead>기간</TableHead>
                    <TableHead>내용</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {career.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">경력사항이 없습니다.</TableCell></TableRow>
                  ) : career.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.company_name}</TableCell>
                      <TableCell>{c.department}</TableCell>
                      <TableCell>{c.position}</TableCell>
                      <TableCell className="text-sm">{c.start_date} ~ {c.end_date ?? '현재'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>학교명</TableHead>
                    <TableHead>전공</TableHead>
                    <TableHead>학위</TableHead>
                    <TableHead>기간</TableHead>
                    <TableHead>졸업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {education.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">학력사항이 없습니다.</TableCell></TableRow>
                  ) : education.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.school_name}</TableCell>
                      <TableCell>{e.major}</TableCell>
                      <TableCell>{e.degree ? DEGREE_LABELS[e.degree as keyof typeof DEGREE_LABELS] : '-'}</TableCell>
                      <TableCell className="text-sm">{e.start_date} ~ {e.end_date ?? '현재'}</TableCell>
                      <TableCell><Badge variant={e.is_graduated ? 'default' : 'secondary'}>{e.is_graduated ? '졸업' : '재학'}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certification">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>자격증명</TableHead>
                    <TableHead>발급기관</TableHead>
                    <TableHead>취득일</TableHead>
                    <TableHead>만료일</TableHead>
                    <TableHead>번호</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certs.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">자격증이 없습니다.</TableCell></TableRow>
                  ) : certs.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.issuer}</TableCell>
                      <TableCell>{c.issue_date}</TableCell>
                      <TableCell>{c.expiry_date ?? '없음'}</TableCell>
                      <TableCell className="font-mono text-xs">{c.certificate_number}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="family">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>관계</TableHead>
                    <TableHead>생년월일</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>부양가족</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {family.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">가족사항이 없습니다.</TableCell></TableRow>
                  ) : family.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>{f.relation}</TableCell>
                      <TableCell>{f.birth_date}</TableCell>
                      <TableCell>{f.phone ?? '-'}</TableCell>
                      <TableCell><Badge variant={f.is_dependent ? 'default' : 'outline'}>{f.is_dependent ? '예' : '아니오'}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
