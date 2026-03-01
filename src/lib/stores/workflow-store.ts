'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkflowType, WorkflowStatus, WorkflowTaskStatus } from '@/types';

// ---- Interfaces ----

export interface WorkflowTemplateTask {
  id: string;
  title: string;
  assignee_role: string;
  is_required: boolean;
  sort_order: number;
}

export interface WorkflowTemplateStep {
  id: string;
  title: string;
  sort_order: number;
  tasks: WorkflowTemplateTask[];
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  type: WorkflowType;
  description: string;
  steps: WorkflowTemplateStep[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTaskInstance {
  id: string;
  template_task_id: string;
  step_index: number;
  title: string;
  assignee_role: string;
  is_required: boolean;
  sort_order: number;
  status: WorkflowTaskStatus;
  completed_by: string | null;
  completed_at: string | null;
  note: string | null;
}

export interface WorkflowInstance {
  id: string;
  template_id: string;
  template_name: string;
  type: WorkflowType;
  employee_id: string;
  employee_name: string;
  department: string;
  status: WorkflowStatus;
  current_step: number;
  total_steps: number;
  step_names: string[];
  tasks: WorkflowTaskInstance[];
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

// ---- Default Templates ----

const defaultTemplates: WorkflowTemplate[] = [
  {
    id: 'tpl-onboarding',
    name: '신입사원 입사',
    type: 'onboarding',
    description: '신입사원 입사 시 필요한 전체 프로세스',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    steps: [
      {
        id: 'step-ob-1', title: '서류수집', sort_order: 0,
        tasks: [
          { id: 'task-ob-1-1', title: '근로계약서 작성 및 서명', assignee_role: 'hr', is_required: true, sort_order: 0 },
          { id: 'task-ob-1-2', title: '신분증 사본 수집', assignee_role: 'hr', is_required: true, sort_order: 1 },
          { id: 'task-ob-1-3', title: '통장사본 수집', assignee_role: 'hr', is_required: true, sort_order: 2 },
        ],
      },
      {
        id: 'step-ob-2', title: '시스템설정', sort_order: 1,
        tasks: [
          { id: 'task-ob-2-1', title: '사내 이메일 계정 생성', assignee_role: 'it', is_required: true, sort_order: 0 },
          { id: 'task-ob-2-2', title: 'PC 및 장비 준비', assignee_role: 'it', is_required: true, sort_order: 1 },
          { id: 'task-ob-2-3', title: '시스템 접근권한 설정', assignee_role: 'it', is_required: true, sort_order: 2 },
        ],
      },
      {
        id: 'step-ob-3', title: '인사등록', sort_order: 2,
        tasks: [
          { id: 'task-ob-3-1', title: 'HRMS 인사정보 등록', assignee_role: 'hr', is_required: true, sort_order: 0 },
          { id: 'task-ob-3-2', title: '4대보험 취득신고', assignee_role: 'hr', is_required: true, sort_order: 1 },
          { id: 'task-ob-3-3', title: '사원증 발급', assignee_role: 'admin', is_required: false, sort_order: 2 },
        ],
      },
      {
        id: 'step-ob-4', title: '교육', sort_order: 3,
        tasks: [
          { id: 'task-ob-4-1', title: '사내규정 및 취업규칙 교육', assignee_role: 'hr', is_required: true, sort_order: 0 },
          { id: 'task-ob-4-2', title: '정보보안 교육 수료', assignee_role: 'it', is_required: true, sort_order: 1 },
        ],
      },
      {
        id: 'step-ob-5', title: '부서배치', sort_order: 4,
        tasks: [
          { id: 'task-ob-5-1', title: '부서 인사 소개', assignee_role: 'manager', is_required: true, sort_order: 0 },
          { id: 'task-ob-5-2', title: '멘토 지정 및 OJT 시작', assignee_role: 'mentor', is_required: false, sort_order: 1 },
        ],
      },
      {
        id: 'step-ob-6', title: '완료', sort_order: 5,
        tasks: [
          { id: 'task-ob-6-1', title: '입사 프로세스 최종 확인', assignee_role: 'hr', is_required: true, sort_order: 0 },
        ],
      },
    ],
  },
  {
    id: 'tpl-offboarding',
    name: '퇴사 처리',
    type: 'offboarding',
    description: '퇴사 시 필요한 전체 프로세스',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    steps: [
      {
        id: 'step-off-1', title: '퇴사접수', sort_order: 0,
        tasks: [
          { id: 'task-off-1-1', title: '사직서 접수 확인', assignee_role: 'hr', is_required: true, sort_order: 0 },
          { id: 'task-off-1-2', title: '퇴사일 확정', assignee_role: 'hr', is_required: true, sort_order: 1 },
          { id: 'task-off-1-3', title: '잔여 연차 확인', assignee_role: 'hr', is_required: true, sort_order: 2 },
        ],
      },
      {
        id: 'step-off-2', title: '인수인계', sort_order: 1,
        tasks: [
          { id: 'task-off-2-1', title: '업무 인수인계서 작성', assignee_role: 'employee', is_required: true, sort_order: 0 },
          { id: 'task-off-2-2', title: '인수인계 확인 (부서장)', assignee_role: 'manager', is_required: true, sort_order: 1 },
          { id: 'task-off-2-3', title: '프로젝트 자료 이관', assignee_role: 'employee', is_required: true, sort_order: 2 },
        ],
      },
      {
        id: 'step-off-3', title: '자산반납/계정해지', sort_order: 2,
        tasks: [
          { id: 'task-off-3-1', title: 'PC 및 장비 반납', assignee_role: 'it', is_required: true, sort_order: 0 },
          { id: 'task-off-3-2', title: '시스템 계정 해지', assignee_role: 'it', is_required: true, sort_order: 1 },
          { id: 'task-off-3-3', title: '사원증 회수', assignee_role: 'admin', is_required: true, sort_order: 2 },
        ],
      },
      {
        id: 'step-off-4', title: '퇴직정산', sort_order: 3,
        tasks: [
          { id: 'task-off-4-1', title: '퇴직금 산정', assignee_role: 'finance', is_required: true, sort_order: 0 },
          { id: 'task-off-4-2', title: '4대보험 상실신고', assignee_role: 'hr', is_required: true, sort_order: 1 },
        ],
      },
    ],
  },
  {
    id: 'tpl-promotion',
    name: '승진 처리',
    type: 'promotion',
    description: '승진 시 필요한 전체 프로세스',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    steps: [
      {
        id: 'step-pr-1', title: '승진심사', sort_order: 0,
        tasks: [
          { id: 'task-pr-1-1', title: '승진 대상자 평가 확인', assignee_role: 'hr', is_required: true, sort_order: 0 },
          { id: 'task-pr-1-2', title: '승진심사위원회 심의', assignee_role: 'hr', is_required: true, sort_order: 1 },
        ],
      },
      {
        id: 'step-pr-2', title: '발령처리', sort_order: 1,
        tasks: [
          { id: 'task-pr-2-1', title: '승진 발령 공문 작성', assignee_role: 'hr', is_required: true, sort_order: 0 },
          { id: 'task-pr-2-2', title: 'HRMS 직급 변경', assignee_role: 'hr', is_required: true, sort_order: 1 },
          { id: 'task-pr-2-3', title: '급여 테이블 조정', assignee_role: 'finance', is_required: true, sort_order: 2 },
        ],
      },
      {
        id: 'step-pr-3', title: '완료', sort_order: 2,
        tasks: [
          { id: 'task-pr-3-1', title: '승진 축하 안내 발송', assignee_role: 'hr', is_required: false, sort_order: 0 },
        ],
      },
    ],
  },
];

// ---- Demo Instances ----

function createDemoInstances(): WorkflowInstance[] {
  const onboardingTemplate = defaultTemplates[0];
  const promotionTemplate = defaultTemplates[2];

  // In-progress onboarding: step 3 (인사등록) reached, steps 0-1 complete
  const onboardingTasks: WorkflowTaskInstance[] = [];
  onboardingTemplate.steps.forEach((step, stepIdx) => {
    step.tasks.forEach((task) => {
      const isCompleted = stepIdx < 2; // steps 0,1 completed
      onboardingTasks.push({
        id: `inst-ob-${task.id}`,
        template_task_id: task.id,
        step_index: stepIdx,
        title: task.title,
        assignee_role: task.assignee_role,
        is_required: task.is_required,
        sort_order: task.sort_order,
        status: isCompleted ? 'completed' : 'pending',
        completed_by: isCompleted ? '서팀장' : null,
        completed_at: isCompleted ? '2026-02-20T10:00:00Z' : null,
        note: null,
      });
    });
  });

  // Completed promotion
  const promotionTasks: WorkflowTaskInstance[] = [];
  promotionTemplate.steps.forEach((step, stepIdx) => {
    step.tasks.forEach((task) => {
      promotionTasks.push({
        id: `inst-pr-${task.id}`,
        template_task_id: task.id,
        step_index: stepIdx,
        title: task.title,
        assignee_role: task.assignee_role,
        is_required: task.is_required,
        sort_order: task.sort_order,
        status: 'completed',
        completed_by: '서팀장',
        completed_at: '2026-02-15T10:00:00Z',
        note: null,
      });
    });
  });

  return [
    {
      id: 'wf-inst-001',
      template_id: onboardingTemplate.id,
      template_name: onboardingTemplate.name,
      type: 'onboarding',
      employee_id: 'e041',
      employee_name: '하사원',
      department: '해외영업팀',
      status: 'in_progress',
      current_step: 2,
      total_steps: onboardingTemplate.steps.length,
      step_names: onboardingTemplate.steps.map((s) => s.title),
      tasks: onboardingTasks,
      started_at: '2026-02-18T09:00:00Z',
      completed_at: null,
      created_at: '2026-02-18T09:00:00Z',
    },
    {
      id: 'wf-inst-002',
      template_id: promotionTemplate.id,
      template_name: promotionTemplate.name,
      type: 'promotion',
      employee_id: 'e022',
      employee_name: '권대리',
      department: '개발1팀',
      status: 'completed',
      current_step: 2,
      total_steps: promotionTemplate.steps.length,
      step_names: promotionTemplate.steps.map((s) => s.title),
      tasks: promotionTasks,
      started_at: '2026-02-10T09:00:00Z',
      completed_at: '2026-02-15T10:00:00Z',
      created_at: '2026-02-10T09:00:00Z',
    },
  ];
}

// ---- Store ----

interface WorkflowState {
  templates: WorkflowTemplate[];
  instances: WorkflowInstance[];

  // Template actions
  addTemplate: (template: Omit<WorkflowTemplate, 'id' | 'created_at' | 'updated_at'>) => void;
  updateTemplate: (id: string, updates: Partial<WorkflowTemplate>) => void;
  deleteTemplate: (id: string) => void;
  toggleTemplateActive: (id: string) => void;

  // Instance actions
  createInstance: (templateId: string, employeeId: string, employeeName: string, department: string) => string | null;
  completeTask: (instanceId: string, taskId: string, completedBy: string, note?: string) => void;
  skipTask: (instanceId: string, taskId: string) => void;
  cancelInstance: (instanceId: string) => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      templates: defaultTemplates,
      instances: createDemoInstances(),

      addTemplate: (template) => {
        const now = new Date().toISOString();
        const newTemplate: WorkflowTemplate = {
          ...template,
          id: `tpl-${Date.now()}`,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({ templates: [...state.templates, newTemplate] }));
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
          ),
        }));
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      toggleTemplateActive: (id) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, is_active: !t.is_active, updated_at: new Date().toISOString() } : t
          ),
        }));
      },

      createInstance: (templateId, employeeId, employeeName, department) => {
        const template = get().templates.find((t) => t.id === templateId);
        if (!template) return null;

        const instanceId = `wf-inst-${Date.now()}`;
        const now = new Date().toISOString();

        const tasks: WorkflowTaskInstance[] = [];
        template.steps.forEach((step, stepIdx) => {
          step.tasks.forEach((task) => {
            tasks.push({
              id: `${instanceId}-${task.id}`,
              template_task_id: task.id,
              step_index: stepIdx,
              title: task.title,
              assignee_role: task.assignee_role,
              is_required: task.is_required,
              sort_order: task.sort_order,
              status: 'pending',
              completed_by: null,
              completed_at: null,
              note: null,
            });
          });
        });

        const instance: WorkflowInstance = {
          id: instanceId,
          template_id: template.id,
          template_name: template.name,
          type: template.type,
          employee_id: employeeId,
          employee_name: employeeName,
          department,
          status: 'in_progress',
          current_step: 0,
          total_steps: template.steps.length,
          step_names: template.steps.map((s) => s.title),
          tasks,
          started_at: now,
          completed_at: null,
          created_at: now,
        };

        set((state) => ({ instances: [...state.instances, instance] }));
        return instanceId;
      },

      completeTask: (instanceId, taskId, completedBy, note) => {
        set((state) => ({
          instances: state.instances.map((inst) => {
            if (inst.id !== instanceId) return inst;

            const updatedTasks = inst.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    status: 'completed' as WorkflowTaskStatus,
                    completed_by: completedBy,
                    completed_at: new Date().toISOString(),
                    note: note || t.note,
                  }
                : t
            );

            // Check if current step required tasks are all completed
            const currentStepTasks = updatedTasks.filter((t) => t.step_index === inst.current_step);
            const requiredDone = currentStepTasks
              .filter((t) => t.is_required)
              .every((t) => t.status === 'completed' || t.status === 'skipped');

            let newStep = inst.current_step;
            let newStatus = inst.status;
            let completedAt = inst.completed_at;

            if (requiredDone && inst.current_step < inst.total_steps - 1) {
              newStep = inst.current_step + 1;
            } else if (requiredDone && inst.current_step === inst.total_steps - 1) {
              newStatus = 'completed';
              completedAt = new Date().toISOString();
            }

            return {
              ...inst,
              tasks: updatedTasks,
              current_step: newStep,
              status: newStatus,
              completed_at: completedAt,
            };
          }),
        }));
      },

      skipTask: (instanceId, taskId) => {
        set((state) => ({
          instances: state.instances.map((inst) => {
            if (inst.id !== instanceId) return inst;

            const updatedTasks = inst.tasks.map((t) =>
              t.id === taskId && !t.is_required
                ? { ...t, status: 'skipped' as WorkflowTaskStatus }
                : t
            );

            return { ...inst, tasks: updatedTasks };
          }),
        }));
      },

      cancelInstance: (instanceId) => {
        set((state) => ({
          instances: state.instances.map((inst) =>
            inst.id === instanceId
              ? { ...inst, status: 'cancelled' as WorkflowStatus, completed_at: new Date().toISOString() }
              : inst
          ),
        }));
      },
    }),
    { name: 'hrms-workflow' }
  )
);
