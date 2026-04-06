'use client';

import { useState } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FileText, Clock, PenTool, CheckCircle, Plus, Eye, Send, Download, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// --- Types ---

type ContractStatus = 'draft' | 'pending_sign' | 'signed' | 'expired' | 'cancelled';
type ContractType = '근로계약서' | '연봉계약서' | '비밀유지계약서(NDA)' | '겸업금지계약서';

interface Contract {
  id: string;
  type: ContractType;
  employeeName: string;
  department: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  createdAt: string;
}

// --- Constants ---

const CONTRACT_TYPE_OPTIONS: ContractType[] = [
  '근로계약서',
  '연봉계약서',
  '비밀유지계약서(NDA)',
  '겸업금지계약서',
];

const STATUS_LABEL: Record<ContractStatus, string> = {
  draft: '작성중',
  pending_sign: '서명대기',
  signed: '서명완료',
  expired: '만료',
  cancelled: '취소',
};

const statusVariant = (status: ContractStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'signed': return 'default';
    case 'pending_sign': return 'secondary';
    case 'expired':
    case 'cancelled': return 'destructive';
    default: return 'outline';
  }
};

// --- Demo Data ---

const DEMO_EMPLOYEES = [
  { name: '김민수', department: '개발1팀' },
  { name: '이지은', department: '디자인팀' },
  { name: '박서준', department: '영업팀' },
  { name: '최유진', department: '인사팀' },
  { name: '정하늘', department: '개발2팀' },
  { name: '한소희', department: '마케팅팀' },
  { name: '오세훈', department: '경영지원팀' },
  { name: '윤서연', department: 'QA팀' },
  { name: '강도현', department: '개발1팀' },
  { name: '임수정', department: '재무팀' },
];

const initialContracts: Contract[] = [
  { id: 'c001', type: '근로계약서', employeeName: '김민수', department: '개발1팀', startDate: '2026-04-01', endDate: '2027-03-31', status: 'signed', createdAt: '2026-03-25' },
  { id: 'c002', type: '연봉계약서', employeeName: '이지은', department: '디자인팀', startDate: '2026-04-01', endDate: '2027-03-31', status: 'pending_sign', createdAt: '2026-03-28' },
  { id: 'c003', type: '비밀유지계약서(NDA)', employeeName: '박서준', department: '영업팀', startDate: '2026-04-01', endDate: '2028-03-31', status: 'signed', createdAt: '2026-03-20' },
  { id: 'c004', type: '근로계약서', employeeName: '최유진', department: '인사팀', startDate: '2026-04-01', endDate: '2027-03-31', status: 'pending_sign', createdAt: '2026-04-01' },
  { id: 'c005', type: '겸업금지계약서', employeeName: '정하늘', department: '개발2팀', startDate: '2026-03-15', endDate: '2027-03-14', status: 'signed', createdAt: '2026-03-10' },
  { id: 'c006', type: '연봉계약서', employeeName: '한소희', department: '마케팅팀', startDate: '2026-04-01', endDate: '2027-03-31', status: 'draft', createdAt: '2026-04-03' },
  { id: 'c007', type: '근로계약서', employeeName: '오세훈', department: '경영지원팀', startDate: '2025-04-01', endDate: '2026-03-31', status: 'expired', createdAt: '2025-03-25' },
  { id: 'c008', type: '비밀유지계약서(NDA)', employeeName: '윤서연', department: 'QA팀', startDate: '2026-04-01', endDate: '2028-03-31', status: 'pending_sign', createdAt: '2026-04-02' },
  { id: 'c009', type: '연봉계약서', employeeName: '강도현', department: '개발1팀', startDate: '2025-07-01', endDate: '2026-06-30', status: 'signed', createdAt: '2025-06-20' },
  { id: 'c010', type: '근로계약서', employeeName: '임수정', department: '재무팀', startDate: '2026-04-01', endDate: '2027-03-31', status: 'draft', createdAt: '2026-04-05' },
];

// --- Helper: check if contract expires within 30 days ---
function isExpiringSoon(contract: Contract): boolean {
  if (contract.status !== 'signed') return false;
  const today = new Date();
  const endDate = new Date(contract.endDate);
  const diffDays = (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 30;
}

// --- Component ---

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // New contract form state
  const [newType, setNewType] = useState<ContractType | ''>('');
  const [newEmployee, setNewEmployee] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');

  // Stats
  const totalCount = contracts.length;
  const pendingCount = contracts.filter((c) => c.status === 'pending_sign').length;
  const draftCount = contracts.filter((c) => c.status === 'draft').length;
  const signedCount = contracts.filter((c) => c.status === 'signed').length;
  const expiringSoonCount = contracts.filter(isExpiringSoon).length;

  // Filter contracts by tab
  const filteredContracts = contracts.filter((c) => {
    switch (activeTab) {
      case 'pending': return c.status === 'pending_sign';
      case 'in_progress': return c.status === 'draft';
      case 'completed': return c.status === 'signed';
      case 'expiring': return isExpiringSoon(c);
      default: return true;
    }
  });

  const resetForm = () => {
    setNewType('');
    setNewEmployee('');
    setNewStartDate('');
    setNewEndDate('');
  };

  const handleCreate = () => {
    if (!newType || !newEmployee || !newStartDate || !newEndDate) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }

    const employee = DEMO_EMPLOYEES.find((e) => e.name === newEmployee);
    if (!employee) {
      toast.error('직원을 선택해주세요.');
      return;
    }

    const newContract: Contract = {
      id: `c${String(contracts.length + 1).padStart(3, '0')}`,
      type: newType as ContractType,
      employeeName: employee.name,
      department: employee.department,
      startDate: newStartDate,
      endDate: newEndDate,
      status: 'draft',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setContracts((prev) => [newContract, ...prev]);
    resetForm();
    setDialogOpen(false);
    toast.success('계약서가 생성되었습니다.');
  };

  const handleSendForSign = (id: string) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'pending_sign' as ContractStatus } : c))
    );
    toast.success('서명 요청이 발송되었습니다.');
  };

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">전자계약</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              계약서 작성
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 계약서 작성</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">계약유형</label>
                <Select value={newType} onValueChange={(v) => setNewType(v as ContractType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="계약유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPE_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">직원 선택</label>
                <Select value={newEmployee} onValueChange={setNewEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="직원 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMO_EMPLOYEES.map((e) => (
                      <SelectItem key={e.name} value={e.name}>
                        {e.name} ({e.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">시작일</label>
                  <Input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">종료일</label>
                  <Input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                취소
              </Button>
              <Button onClick={handleCreate}>생성</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard title="전체 계약" value={totalCount} icon={FileText} color="blue" />
        <StatsCard title="서명 대기" value={pendingCount} icon={PenTool} color="amber" />
        <StatsCard title="진행 중" value={draftCount} icon={Clock} color="purple" />
        <StatsCard title="완료" value={signedCount} icon={CheckCircle} color="green" />
      </div>

      {/* Tabs + Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="pending">서명대기</TabsTrigger>
          <TabsTrigger value="in_progress">진행중</TabsTrigger>
          <TabsTrigger value="completed">완료</TabsTrigger>
          <TabsTrigger value="expiring">
            만료예정
            {expiringSoonCount > 0 && (
              <span className="ml-1 text-xs bg-red-100 text-red-700 rounded-full px-1.5 py-0.5">
                {expiringSoonCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>계약유형</TableHead>
                    <TableHead>직원명</TableHead>
                    <TableHead>부서</TableHead>
                    <TableHead>시작일</TableHead>
                    <TableHead>종료일</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        해당하는 계약이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{contract.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{contract.employeeName}</TableCell>
                        <TableCell>{contract.department}</TableCell>
                        <TableCell>{contract.startDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {contract.endDate}
                            {isExpiringSoon(contract) && (
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(contract.status)}>
                            {STATUS_LABEL[contract.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" title="보기">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {contract.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="서명 요청"
                                onClick={() => handleSendForSign(contract.id)}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            {contract.status === 'signed' && (
                              <Button variant="ghost" size="sm" title="다운로드">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
