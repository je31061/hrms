'use client';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { APPOINTMENT_TYPES } from '@/lib/constants/codes';

const employees = [
  { id: '1', name: '김철수 (EMP-001)', department: '개발1팀', rank: '과장' },
  { id: '2', name: '이영희 (EMP-002)', department: '개발1팀', rank: '대리' },
  { id: '3', name: '박민수 (EMP-003)', department: '인사팀', rank: '사원' },
];

const departments = [
  { id: 'd1', name: '개발1팀' },
  { id: 'd2', name: '인사팀' },
  { id: 'd3', name: '재무팀' },
  { id: 'd4', name: '개발2팀' },
  { id: 'd5', name: 'QA팀' },
];

const ranks = ['사원', '대리', '과장', '차장', '부장', '이사'];
const titles = ['팀원', '파트장', '팀장', '실장', '본부장'];

export default function NewAppointmentPage() {
  const router = useRouter();

  return (
    <div>
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-6">발령 등록</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.success('발령이 등록되었습니다.');
          router.push('/appointments');
        }}
        className="space-y-6 max-w-2xl"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">발령 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>대상자</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="사원 선택" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name} - {e.department} {e.rank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>발령 유형</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="유형 선택" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(APPOINTMENT_TYPES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>발령일</Label>
              <Input type="date" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">변경 내용</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">변경 전</h4>
                <div className="space-y-2">
                  <Label>부서</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="부서 선택" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>직급</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="직급 선택" /></SelectTrigger>
                    <SelectContent>
                      {ranks.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>직책</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="직책 선택" /></SelectTrigger>
                    <SelectContent>
                      {titles.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">변경 후</h4>
                <div className="space-y-2">
                  <Label>부서</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="부서 선택" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>직급</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="직급 선택" /></SelectTrigger>
                    <SelectContent>
                      {ranks.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>직책</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="직책 선택" /></SelectTrigger>
                    <SelectContent>
                      {titles.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label>발령 사유</Label>
              <Textarea placeholder="발령 사유를 입력하세요" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>취소</Button>
          <Button type="submit">발령 등록</Button>
        </div>
      </form>
    </div>
  );
}
