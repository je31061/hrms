'use client';

import { use } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EmployeeCard } from '@/components/employee/employee-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import type { Employee, CareerHistory, EducationHistory, Certification, FamilyMember } from '@/types';
import { DEGREE_LABELS } from '@/lib/constants/positions';

const demoEmployee: Employee = {
  id: '1', employee_number: 'EMP-001', name: '김철수', name_en: 'Kim Cheolsu', email: 'kim@company.com',
  phone: '010-1234-5678', birth_date: '1985-03-15', gender: 'M', address: '서울시 강남구 역삼로 123',
  address_detail: '101동 1001호', zip_code: '06241', department_id: 'd1',
  position_rank_id: 'r3', position_title_id: 't3', employment_type: 'regular',
  hire_date: '2018-03-02', resignation_date: null, status: 'active', base_salary: 5000000,
  bank_name: '국민은행', bank_account: '123-456-789012', profile_image_url: null,
  emergency_contact_name: '김배우자', emergency_contact_phone: '010-9999-8888',
  emergency_contact_relation: '배우자', created_at: '', updated_at: '',
  department: { id: 'd1', name: '개발1팀', code: 'DEV1', parent_id: null, level: 3, sort_order: 1, is_active: true, created_at: '', updated_at: '' },
  position_rank: { id: 'r3', name: '과장', level: 3, is_active: true },
  position_title: { id: 't3', name: '팀장', level: 3, is_active: true },
};

const demoCareer: CareerHistory[] = [
  { id: '1', employee_id: '1', company_name: '(주)이전회사', department: '개발팀', position: '대리', start_date: '2013-03-01', end_date: '2018-02-28', description: '웹 서비스 개발' },
  { id: '2', employee_id: '1', company_name: '(주)첫회사', department: 'IT팀', position: '사원', start_date: '2010-01-04', end_date: '2013-02-28', description: '시스템 운영' },
];

const demoEducation: EducationHistory[] = [
  { id: '1', employee_id: '1', school_name: '서울대학교', major: '컴퓨터공학', degree: 'bachelor', start_date: '2004-03-01', end_date: '2010-02-28', is_graduated: true },
];

const demoCerts: Certification[] = [
  { id: '1', employee_id: '1', name: '정보처리기사', issuer: '한국산업인력공단', issue_date: '2012-06-15', expiry_date: null, certificate_number: '12345678' },
  { id: '2', employee_id: '1', name: 'AWS Solutions Architect', issuer: 'Amazon', issue_date: '2023-01-20', expiry_date: '2026-01-19', certificate_number: 'AWS-SAA-0001' },
];

const demoFamily: FamilyMember[] = [
  { id: '1', employee_id: '1', name: '김배우자', relation: '배우자', birth_date: '1987-05-10', phone: '010-9999-8888', is_dependent: true },
  { id: '2', employee_id: '1', name: '김자녀', relation: '자녀', birth_date: '2015-08-20', phone: null, is_dependent: true },
];

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

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

      <EmployeeCard employee={demoEmployee} />

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
              <div><p className="text-sm text-muted-foreground">사원번호</p><p className="font-medium">{demoEmployee.employee_number}</p></div>
              <div><p className="text-sm text-muted-foreground">이메일</p><p className="font-medium">{demoEmployee.email}</p></div>
              <div><p className="text-sm text-muted-foreground">전화번호</p><p className="font-medium">{demoEmployee.phone}</p></div>
              <div><p className="text-sm text-muted-foreground">생년월일</p><p className="font-medium">{demoEmployee.birth_date}</p></div>
              <div><p className="text-sm text-muted-foreground">주소</p><p className="font-medium">{demoEmployee.address} {demoEmployee.address_detail}</p></div>
              <div><p className="text-sm text-muted-foreground">은행</p><p className="font-medium">{demoEmployee.bank_name} {demoEmployee.bank_account}</p></div>
              <div><p className="text-sm text-muted-foreground">비상연락처</p><p className="font-medium">{demoEmployee.emergency_contact_name} ({demoEmployee.emergency_contact_relation}) {demoEmployee.emergency_contact_phone}</p></div>
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
                  {demoCareer.map((c) => (
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
                  {demoEducation.map((e) => (
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
                  {demoCerts.map((c) => (
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
                  {demoFamily.map((f) => (
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
