'use client';

import { useState, useCallback, useMemo } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { OrgTree } from '@/components/org-chart/org-tree';
import { DepartmentCard } from '@/components/org-chart/department-card';
import { OrgChartCanvas } from '@/components/org-chart/org-chart-canvas';
import { SimulationToolbar } from '@/components/org-chart/simulation-toolbar';
import { DragOverlay } from '@/components/org-chart/drag-overlay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  cloneTree,
  findDepartment,
  isAncestorOf,
  reparentDepartment,
  moveEmployee,
  recomputeCounts,
} from '@/lib/tree-utils';
import type { Department, Employee, DragPayload, SimulationMove } from '@/types';

// Demo data - in production from Supabase
const demoTree: Department[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: '대표이사',
    code: 'CEO',
    parent_id: null,
    level: 1,
    sort_order: 1,
    is_active: true,
    effective_from: null,
    effective_to: null,
    created_at: '',
    updated_at: '',
    children: [
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: '경영지원본부',
        code: 'MGT',
        parent_id: '00000000-0000-0000-0000-000000000001',
        level: 2,
        sort_order: 1,
        is_active: true,
        effective_from: null,
        effective_to: null,
        created_at: '',
        updated_at: '',
        children: [
          { id: '00000000-0000-0000-0000-000000000005', name: '인사팀', code: 'HR', parent_id: '00000000-0000-0000-0000-000000000002', level: 3, sort_order: 1, is_active: true, effective_from: null, effective_to: null, created_at: '', updated_at: '' },
          { id: '00000000-0000-0000-0000-000000000006', name: '재무팀', code: 'FIN', parent_id: '00000000-0000-0000-0000-000000000002', level: 3, sort_order: 2, is_active: true, effective_from: null, effective_to: null, created_at: '', updated_at: '' },
          { id: '00000000-0000-0000-0000-000000000007', name: '총무팀', code: 'GA', parent_id: '00000000-0000-0000-0000-000000000002', level: 3, sort_order: 3, is_active: true, effective_from: null, effective_to: null, created_at: '', updated_at: '' },
        ],
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        name: '개발본부',
        code: 'DEV',
        parent_id: '00000000-0000-0000-0000-000000000001',
        level: 2,
        sort_order: 2,
        is_active: true,
        effective_from: null,
        effective_to: null,
        created_at: '',
        updated_at: '',
        children: [
          { id: '00000000-0000-0000-0000-000000000008', name: '개발1팀', code: 'DEV1', parent_id: '00000000-0000-0000-0000-000000000003', level: 3, sort_order: 1, is_active: true, effective_from: null, effective_to: null, created_at: '', updated_at: '' },
          { id: '00000000-0000-0000-0000-000000000009', name: '개발2팀', code: 'DEV2', parent_id: '00000000-0000-0000-0000-000000000003', level: 3, sort_order: 2, is_active: true, effective_from: null, effective_to: null, created_at: '', updated_at: '' },
          { id: '00000000-0000-0000-0000-000000000010', name: 'QA팀', code: 'QA', parent_id: '00000000-0000-0000-0000-000000000003', level: 3, sort_order: 3, is_active: true, effective_from: null, effective_to: null, created_at: '', updated_at: '' },
        ],
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        name: '영업본부',
        code: 'SALES',
        parent_id: '00000000-0000-0000-0000-000000000001',
        level: 2,
        sort_order: 3,
        is_active: true,
        effective_from: null,
        effective_to: null,
        created_at: '',
        updated_at: '',
        children: [
          { id: '00000000-0000-0000-0000-000000000011', name: '국내영업팀', code: 'DS', parent_id: '00000000-0000-0000-0000-000000000004', level: 3, sort_order: 1, is_active: true, effective_from: null, effective_to: null, created_at: '', updated_at: '' },
          { id: '00000000-0000-0000-0000-000000000012', name: '해외영업팀', code: 'IS', parent_id: '00000000-0000-0000-0000-000000000004', level: 3, sort_order: 2, is_active: true, effective_from: null, effective_to: null, created_at: '', updated_at: '' },
        ],
      },
    ],
  },
];

const originalEmployeeCounts: Record<string, number> = {
  '00000000-0000-0000-0000-000000000001': 1,
  '00000000-0000-0000-0000-000000000002': 2,
  '00000000-0000-0000-0000-000000000003': 3,
  '00000000-0000-0000-0000-000000000004': 2,
  '00000000-0000-0000-0000-000000000005': 8,
  '00000000-0000-0000-0000-000000000006': 6,
  '00000000-0000-0000-0000-000000000007': 5,
  '00000000-0000-0000-0000-000000000008': 25,
  '00000000-0000-0000-0000-000000000009': 20,
  '00000000-0000-0000-0000-000000000010': 12,
  '00000000-0000-0000-0000-000000000011': 15,
  '00000000-0000-0000-0000-000000000012': 10,
};

// Demo employee data per department
const makeEmployee = (
  id: string,
  name: string,
  email: string,
  phone: string,
  deptId: string,
  rankName: string,
  titleName?: string,
): Employee => ({
  id,
  employee_number: `EMP-${id.slice(-3)}`,
  name,
  name_en: null,
  email,
  phone,
  birth_date: null,
  gender: null,
  address: null,
  address_detail: null,
  zip_code: null,
  department_id: deptId,
  position_rank_id: null,
  position_title_id: null,
  employment_type: 'regular',
  hire_date: '2020-01-01',
  resignation_date: null,
  status: 'active',
  base_salary: 0,
  bank_name: null,
  bank_account: null,
  profile_image_url: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
  emergency_contact_name: null,
  emergency_contact_phone: null,
  emergency_contact_relation: null,
  created_at: '',
  updated_at: '',
  position_rank: { id: '', name: rankName, level: 0, is_active: true, effective_from: null, effective_to: null, created_at: '', updated_at: '' },
  position_title: titleName ? { id: '', name: titleName, level: 0, is_active: true, effective_from: null, effective_to: null, created_at: '', updated_at: '' } : undefined,
});

const originalEmployeesByDept: Record<string, Employee[]> = {
  '00000000-0000-0000-0000-000000000001': [
    makeEmployee('e001', '김대표', 'ceo@company.com', '010-1234-0001', '00000000-0000-0000-0000-000000000001', '대표이사', '대표이사'),
  ],
  '00000000-0000-0000-0000-000000000002': [
    makeEmployee('e002', '이본부장', 'lee.mgt@company.com', '010-1234-0002', '00000000-0000-0000-0000-000000000002', '이사', '본부장'),
    makeEmployee('e003', '박부장', 'park.mgt@company.com', '010-1234-0003', '00000000-0000-0000-0000-000000000002', '부장'),
  ],
  '00000000-0000-0000-0000-000000000003': [
    makeEmployee('e004', '최본부장', 'choi.dev@company.com', '010-1234-0004', '00000000-0000-0000-0000-000000000003', '이사', '본부장'),
    makeEmployee('e005', '정부장', 'jung.dev@company.com', '010-1234-0005', '00000000-0000-0000-0000-000000000003', '부장'),
    makeEmployee('e006', '한차장', 'han.dev@company.com', '010-1234-0006', '00000000-0000-0000-0000-000000000003', '차장'),
  ],
  '00000000-0000-0000-0000-000000000004': [
    makeEmployee('e007', '강본부장', 'kang.sales@company.com', '010-1234-0007', '00000000-0000-0000-0000-000000000004', '이사', '본부장'),
    makeEmployee('e008', '윤부장', 'yoon.sales@company.com', '010-1234-0008', '00000000-0000-0000-0000-000000000004', '부장'),
  ],
  '00000000-0000-0000-0000-000000000005': [
    makeEmployee('e010', '서팀장', 'seo.hr@company.com', '010-1234-0010', '00000000-0000-0000-0000-000000000005', '과장', '팀장'),
    makeEmployee('e011', '임대리', 'lim.hr@company.com', '010-1234-0011', '00000000-0000-0000-0000-000000000005', '대리'),
    makeEmployee('e012', '조사원', 'cho.hr@company.com', '010-1234-0012', '00000000-0000-0000-0000-000000000005', '사원'),
  ],
  '00000000-0000-0000-0000-000000000006': [
    makeEmployee('e013', '장팀장', 'jang.fin@company.com', '010-1234-0013', '00000000-0000-0000-0000-000000000006', '과장', '팀장'),
    makeEmployee('e014', '유대리', 'yu.fin@company.com', '010-1234-0014', '00000000-0000-0000-0000-000000000006', '대리'),
  ],
  '00000000-0000-0000-0000-000000000007': [
    makeEmployee('e015', '오팀장', 'oh.ga@company.com', '010-1234-0015', '00000000-0000-0000-0000-000000000007', '과장', '팀장'),
    makeEmployee('e016', '배사원', 'bae.ga@company.com', '010-1234-0016', '00000000-0000-0000-0000-000000000007', '사원'),
  ],
  '00000000-0000-0000-0000-000000000008': [
    makeEmployee('e020', '문팀장', 'moon.dev1@company.com', '010-1234-0020', '00000000-0000-0000-0000-000000000008', '차장', '팀장'),
    makeEmployee('e021', '신과장', 'shin.dev1@company.com', '010-1234-0021', '00000000-0000-0000-0000-000000000008', '과장'),
    makeEmployee('e022', '권대리', 'kwon.dev1@company.com', '010-1234-0022', '00000000-0000-0000-0000-000000000008', '대리'),
  ],
  '00000000-0000-0000-0000-000000000009': [
    makeEmployee('e025', '황팀장', 'hwang.dev2@company.com', '010-1234-0025', '00000000-0000-0000-0000-000000000009', '차장', '팀장'),
    makeEmployee('e026', '안과장', 'an.dev2@company.com', '010-1234-0026', '00000000-0000-0000-0000-000000000009', '과장'),
  ],
  '00000000-0000-0000-0000-000000000010': [
    makeEmployee('e030', '송팀장', 'song.qa@company.com', '010-1234-0030', '00000000-0000-0000-0000-000000000010', '과장', '팀장'),
    makeEmployee('e031', '전대리', 'jeon.qa@company.com', '010-1234-0031', '00000000-0000-0000-0000-000000000010', '대리'),
  ],
  '00000000-0000-0000-0000-000000000011': [
    makeEmployee('e035', '홍팀장', 'hong.ds@company.com', '010-1234-0035', '00000000-0000-0000-0000-000000000011', '차장', '팀장'),
    makeEmployee('e036', '고대리', 'go.ds@company.com', '010-1234-0036', '00000000-0000-0000-0000-000000000011', '대리'),
  ],
  '00000000-0000-0000-0000-000000000012': [
    makeEmployee('e040', '노팀장', 'no.is@company.com', '010-1234-0040', '00000000-0000-0000-0000-000000000012', '과장', '팀장'),
    makeEmployee('e041', '하사원', 'ha.is@company.com', '010-1234-0041', '00000000-0000-0000-0000-000000000012', '사원'),
  ],
};

const deptCards = [
  { id: '00000000-0000-0000-0000-000000000005', name: '인사팀', code: 'HR', count: 8 },
  { id: '00000000-0000-0000-0000-000000000006', name: '재무팀', code: 'FIN', count: 6 },
  { id: '00000000-0000-0000-0000-000000000007', name: '총무팀', code: 'GA', count: 5 },
  { id: '00000000-0000-0000-0000-000000000008', name: '개발1팀', code: 'DEV1', count: 25 },
  { id: '00000000-0000-0000-0000-000000000009', name: '개발2팀', code: 'DEV2', count: 20 },
  { id: '00000000-0000-0000-0000-000000000010', name: 'QA팀', code: 'QA', count: 12 },
  { id: '00000000-0000-0000-0000-000000000011', name: '국내영업팀', code: 'DS', count: 15 },
  { id: '00000000-0000-0000-0000-000000000012', name: '해외영업팀', code: 'IS', count: 10 },
];

export default function OrganizationPage() {
  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simTree, setSimTree] = useState<Department[]>(() => cloneTree(demoTree));
  const [simEmployeesByDept, setSimEmployeesByDept] = useState<Record<string, Employee[]>>(() => ({ ...originalEmployeesByDept }));
  const [moves, setMoves] = useState<SimulationMove[]>([]);
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);

  // Active data: original when not simulating, sim data when simulating
  const activeTree = isSimulating ? simTree : demoTree;
  const activeEmployeesByDept = isSimulating ? simEmployeesByDept : originalEmployeesByDept;
  const activeEmployeeCounts = isSimulating ? recomputeCounts(simEmployeesByDept) : originalEmployeeCounts;

  // Set of department IDs that have been modified
  const modifiedDeptIds = useMemo(() => {
    const ids = new Set<string>();
    for (const move of moves) {
      ids.add(move.fromDepartmentId);
      ids.add(move.toDepartmentId);
      // For department moves, also mark the moved department itself
      if (move.type === 'department') {
        ids.add(move.itemId);
      }
    }
    return ids;
  }, [moves]);

  const handleDropItem = useCallback((payload: DragPayload, targetDeptId: string) => {
    if (payload.type === 'department') {
      // Prevent moving to self
      if (payload.id === targetDeptId) return;

      // Prevent circular reference: can't move a dept to its own descendant
      if (isAncestorOf(simTree, payload.id, targetDeptId)) return;

      // Find source and target department names
      const sourceDept = findDepartment(simTree, payload.sourceDepartmentId);
      const targetDept = findDepartment(simTree, targetDeptId);
      // Find current parent of the department being moved
      const movingDept = findDepartment(simTree, payload.id);
      const currentParentId = movingDept?.parent_id;
      // Don't reparent if already a child of target
      if (currentParentId === targetDeptId) return;

      const fromName = sourceDept ? findDepartment(simTree, currentParentId ?? '')?.name ?? '최상위' : '최상위';
      const toName = targetDept?.name ?? '';

      const newTree = reparentDepartment(simTree, payload.id, targetDeptId);
      setSimTree(newTree);

      const move: SimulationMove = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: 'department',
        itemId: payload.id,
        itemName: payload.name,
        fromDepartmentId: currentParentId ?? payload.sourceDepartmentId,
        fromDepartmentName: fromName,
        toDepartmentId: targetDeptId,
        toDepartmentName: toName,
      };
      setMoves((prev) => [...prev, move]);
    } else {
      // Employee move
      if (payload.sourceDepartmentId === targetDeptId) return;

      const fromDept = findDepartment(simTree, payload.sourceDepartmentId);
      const toDept = findDepartment(simTree, targetDeptId);

      const newEmps = moveEmployee(simEmployeesByDept, payload.id, payload.sourceDepartmentId, targetDeptId);
      setSimEmployeesByDept(newEmps);

      const move: SimulationMove = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: 'employee',
        itemId: payload.id,
        itemName: payload.name,
        fromDepartmentId: payload.sourceDepartmentId,
        fromDepartmentName: fromDept?.name ?? '',
        toDepartmentId: targetDeptId,
        toDepartmentName: toDept?.name ?? '',
      };
      setMoves((prev) => [...prev, move]);
    }
  }, [simTree, simEmployeesByDept]);

  const handleReset = useCallback(() => {
    setSimTree(cloneTree(demoTree));
    setSimEmployeesByDept({ ...originalEmployeesByDept });
    setMoves([]);
  }, []);

  const handleUndoLast = useCallback(() => {
    if (moves.length === 0) return;
    // Safe undo: replay all moves except the last one from original state
    const newMoves = moves.slice(0, -1);
    let tree = cloneTree(demoTree);
    let emps: Record<string, Employee[]> = { ...originalEmployeesByDept };

    for (const m of newMoves) {
      if (m.type === 'department') {
        tree = reparentDepartment(tree, m.itemId, m.toDepartmentId);
      } else {
        emps = moveEmployee(emps, m.itemId, m.fromDepartmentId, m.toDepartmentId);
      }
    }

    setSimTree(tree);
    setSimEmployeesByDept(emps);
    setMoves(newMoves);
  }, [moves]);

  const handleDragPreviewStart = useCallback((payload: DragPayload) => {
    setDragPayload(payload);
  }, []);

  const handleDragPreviewEnd = useCallback(() => {
    setDragPayload(null);
  }, []);

  const handleToggleSimulation = useCallback((on: boolean) => {
    if (on) {
      // Entering simulation: clone original data
      setSimTree(cloneTree(demoTree));
      setSimEmployeesByDept({ ...originalEmployeesByDept });
    }
    // Always clear moves on toggle (entering or exiting)
    setMoves([]);
    setIsSimulating(on);
  }, []);

  return (
    <div>
      <DragOverlay payload={dragPayload} />
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-6">조직도</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">조직 트리</CardTitle>
            </CardHeader>
            <CardContent>
              <OrgTree departments={activeTree} employeeCounts={activeEmployeeCounts} />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          {/* Simulation Toolbar */}
          <div className="mb-4">
            <SimulationToolbar
              isSimulating={isSimulating}
              onToggle={handleToggleSimulation}
              moves={moves}
              onUndoLast={handleUndoLast}
              onReset={handleReset}
            />
          </div>

          <Tabs defaultValue="chart">
            <TabsList>
              <TabsTrigger value="chart">조직도 차트</TabsTrigger>
              <TabsTrigger value="cards">부서 카드</TabsTrigger>
            </TabsList>
            <TabsContent value="chart" className="mt-4">
              <OrgChartCanvas
                departments={activeTree}
                employeeCounts={activeEmployeeCounts}
                employeesByDept={activeEmployeesByDept}
                isSimulating={isSimulating}
                onDropItem={handleDropItem}
                modifiedDeptIds={isSimulating ? modifiedDeptIds : undefined}
                onDragPreviewStart={handleDragPreviewStart}
                onDragPreviewEnd={handleDragPreviewEnd}
              />
            </TabsContent>
            <TabsContent value="cards" className="mt-4">
              <h2 className="text-lg font-semibold mb-4">부서 현황</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {deptCards.map((dept) => (
                  <DepartmentCard
                    key={dept.id}
                    department={{
                      id: dept.id,
                      name: dept.name,
                      code: dept.code,
                      parent_id: null,
                      level: 3,
                      sort_order: 0,
                      is_active: true,
                      effective_from: null,
                      effective_to: null,
                      created_at: '',
                      updated_at: '',
                    }}
                    employeeCount={dept.count}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
