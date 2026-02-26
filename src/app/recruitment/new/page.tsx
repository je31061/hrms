'use client';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function NewRecruitmentPage() {
  const router = useRouter();

  return (
    <div>
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-6">채용공고 등록</h1>

      <form
        onSubmit={(e) => { e.preventDefault(); toast.success('채용공고가 등록되었습니다.'); router.push('/recruitment'); }}
        className="space-y-6 max-w-2xl"
      >
        <Card>
          <CardHeader><CardTitle className="text-base">공고 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>채용 제목</Label>
              <Input placeholder="예: 프론트엔드 개발자" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>부서</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="부서 선택" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev1">개발1팀</SelectItem>
                    <SelectItem value="dev2">개발2팀</SelectItem>
                    <SelectItem value="hr">인사팀</SelectItem>
                    <SelectItem value="qa">QA팀</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>고용형태</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">정규직</SelectItem>
                    <SelectItem value="contract">계약직</SelectItem>
                    <SelectItem value="intern">인턴</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>채용 인원</Label>
                <Input type="number" min={1} defaultValue={1} />
              </div>
              <div className="space-y-2">
                <Label>공고 시작일</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>공고 마감일</Label>
                <Input type="date" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">상세 내용</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>업무 설명</Label>
              <Textarea placeholder="담당 업무를 상세히 기술하세요" rows={4} />
            </div>
            <div className="space-y-2">
              <Label>자격 요건</Label>
              <Textarea placeholder="필수/우대 자격 요건을 기술하세요" rows={4} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>취소</Button>
          <Button type="submit">등록</Button>
        </div>
      </form>
    </div>
  );
}
