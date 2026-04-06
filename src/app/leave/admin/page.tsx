'use client';

import { useState, useMemo } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { useLeaveStore, demoEmployees } from '@/lib/stores/leave-store';
import { usePendingRequests } from '@/lib/hooks/use-leave';
import { useCodeMap, CODE } from '@/lib/hooks/use-code';
import EmployeeLeaveDetail from '@/components/leave/employee-leave-detail';
import LeaveTypeManagement from '@/components/leave/leave-type-management';
import BulkGrantDialog from '@/components/leave/bulk-grant-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Check, X, Users, BarChart3, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LeaveAdminPage() {
  const LEAVE_REQUEST_STATUS = useCodeMap(CODE.LEAVE_REQUEST_STATUS);
  const leaveTypes = useLeaveStore((s) => s.leaveTypes);
  const leaveBalances = useLeaveStore((s) => s.leaveBalances);
  const approveLeaveRequest = useLeaveStore((s) => s.approveLeaveRequest);
  const rejectLeaveRequest = useLeaveStore((s) => s.rejectLeaveRequest);
  const pendingRequests = usePendingRequests();

  const [search, setSearch] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [bulkGrantOpen, setBulkGrantOpen] = useState(false);

  // Employee table data
  const employeeRows = useMemo(() => {
    return demoEmployees
      .filter(
        (emp) =>
          emp.name.includes(search) || emp.department.includes(search)
      )
      .map((emp) => {
        const annualBalance = leaveBalances.find(
          (b) =>
            b.employee_id === emp.id &&
            b.leave_type_id === 'lt-annual' &&
            b.year === 2026
        );
        const total = annualBalance?.total_days ?? 0;
        const used = annualBalance?.used_days ?? 0;
        const remaining = annualBalance?.remaining_days ?? 0;
        const rate = total > 0 ? Math.round((used / total) * 100) : 0;
        return { ...emp, total, used, remaining, rate };
      });
  }, [leaveBalances, search]);

  // Summary cards
  const totalEmployees = demoEmployees.length;
  const avgRate = useMemo(() => {
    const rates = employeeRows.map((r) => r.rate);
    return rates.length > 0 ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;
  }, [employeeRows]);
  const lowRemainingCount = employeeRows.filter((r) => r.remaining <= 3 && r.remaining >= 0).length;

  const handleApprove = (id: string) => {
    approveLeaveRequest(id);
    toast.success('승인되었습니다. 잔액이 차감됩니다.');
  };

  const handleReject = (id: string) => {
    rejectLeaveRequest(id);
    toast.success('반려되었습니다.');
  };

  const handleRowClick = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setDetailOpen(true);
  };

  return (
    <div>
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-6">휴가 관리 (HR)</h1>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            승인 대기
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="overview">개인별 연차 현황</TabsTrigger>
          <TabsTrigger value="settings">연차 설정</TabsTrigger>
        </TabsList>

        {/* Tab 1: Pending Approvals */}
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                승인 대기 ({pendingRequests.length}건)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>신청자</TableHead>
                      <TableHead>부서</TableHead>
                      <TableHead>유형</TableHead>
                      <TableHead>기간</TableHead>
                      <TableHead className="text-center">일수</TableHead>
                      <TableHead>사유</TableHead>
                      <TableHead>신청일</TableHead>
                      <TableHead>처리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          승인 대기 중인 요청이 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingRequests.map((req) => {
                        const emp = demoEmployees.find((e) => e.id === req.employee_id);
                        return (
                          <TableRow key={req.id}>
                            <TableCell className="font-medium">{emp?.name ?? ''}</TableCell>
                            <TableCell>{emp?.department ?? ''}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{req.leave_type?.name ?? ''}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {req.start_date}
                              {req.start_date !== req.end_date && ` ~ ${req.end_date}`}
                            </TableCell>
                            <TableCell className="text-center">{req.days}일</TableCell>
                            <TableCell className="text-sm">{req.reason}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {req.created_at}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-7 px-2"
                                  onClick={() => handleApprove(req.id)}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  승인
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 px-2"
                                  onClick={() => handleReject(req.id)}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  반려
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Employee Overview */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Summary Cards */}
          <div className="grid gap-4 grid-cols-3">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">전체 직원수</span>
                </div>
                <span className="text-2xl font-bold">{totalEmployees}명</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">평균 소진율</span>
                </div>
                <span className="text-2xl font-bold">{avgRate}%</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">잔여 3일 미만</span>
                </div>
                <span className="text-2xl font-bold">{lowRemainingCount}명</span>
              </CardContent>
            </Card>
          </div>

          {/* Search & Bulk Grant */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="이름 또는 부서 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <div className="flex-1" />
            <Button variant="outline" onClick={() => setBulkGrantOpen(true)}>
              <Download className="h-4 w-4 mr-2" />
              연차 일괄 부여
            </Button>
          </div>

          {/* Employee Table */}
          <Card>
            <CardContent className="pt-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>부서</TableHead>
                      <TableHead>입사일</TableHead>
                      <TableHead className="text-center">총 연차</TableHead>
                      <TableHead className="text-center">사용</TableHead>
                      <TableHead className="text-center">잔여</TableHead>
                      <TableHead className="w-[120px]">소진율</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeRows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer"
                        onClick={() => handleRowClick(row.id)}
                      >
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell>{row.department}</TableCell>
                        <TableCell className="text-sm">{row.hire_date}</TableCell>
                        <TableCell className="text-center">{row.total}</TableCell>
                        <TableCell className="text-center">{row.used}</TableCell>
                        <TableCell className="text-center font-bold">{row.remaining}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={row.rate} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground w-8">
                              {row.rate}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(row.id);
                            }}
                          >
                            상세
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Leave Settings */}
        <TabsContent value="settings" className="mt-4 space-y-4">
          <LeaveTypeManagement />
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                연차 정책(반차/반반차 허용, 미사용 연차 처리 등)은{' '}
                <Link href="/settings" className="text-primary underline">
                  시스템 설정 &gt; 연차/휴가 정책
                </Link>
                에서 관리할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      {selectedEmployeeId && (
        <EmployeeLeaveDetail
          employeeId={selectedEmployeeId}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}

      {/* Bulk Grant Dialog */}
      <BulkGrantDialog open={bulkGrantOpen} onOpenChange={setBulkGrantOpen} />
    </div>
  );
}
