'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkflowType, WorkflowStatus, WorkflowTaskStatus, DocumentSubmissionStatus } from '@/types';

// ---- Interfaces ----

export interface DocumentRequirement {
  id: string;
  title: string;
  description: string;
  is_required: boolean;
  responsible_role: string;
  deadline_days: number | null;
  sort_order: number;
}

export interface DocumentInstance {
  id: string;
  requirement_id: string;
  task_instance_id: string;
  title: string;
  is_required: boolean;
  responsible_role: string;
  status: DocumentSubmissionStatus;
  submitted_by: string | null;
  submitted_at: string | null;
  rejected_reason: string | null;
  note: string | null;
}

export interface WorkflowTemplateTask {
  id: string;
  title: string;
  assignee_role: string;
  is_required: boolean;
  sort_order: number;
  documents: DocumentRequirement[];
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
  documents: DocumentInstance[];
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
          {
            id: 'task-ob-1-1', title: '근로계약서 작성 및 서명', assignee_role: 'hr', is_required: true, sort_order: 0,
            documents: [
              { id: 'doc-ob-1', title: '근로계약서', description: '서명된 근로계약서 원본', is_required: true, responsible_role: 'hr', deadline_days: 3, sort_order: 0 },
            ],
          },
          {
            id: 'task-ob-1-2', title: '신분증 사본 수집', assignee_role: 'hr', is_required: true, sort_order: 1,
            documents: [
              { id: 'doc-ob-2', title: '신분증 사본', description: '주민등록증 또는 운전면허증 사본', is_required: true, responsible_role: 'employee', deadline_days: 3, sort_order: 0 },
            ],
          },
          {
            id: 'task-ob-1-3', title: '통장사본 수집', assignee_role: 'hr', is_required: true, sort_order: 2,
            documents: [
              { id: 'doc-ob-3', title: '통장사본', description: '급여 입금용 본인 명의 통장 사본', is_required: true, responsible_role: 'employee', deadline_days: 3, sort_order: 0 },
              { id: 'doc-ob-4', title: '졸업증명서', description: '최종학력 졸업증명서', is_required: false, responsible_role: 'employee', deadline_days: 7, sort_order: 1 },
              { id: 'doc-ob-5', title: '건강검진결과서', description: '최근 6개월 이내 건강검진 결과서', is_required: false, responsible_role: 'employee', deadline_days: 7, sort_order: 2 },
            ],
          },
        ],
      },
      {
        id: 'step-ob-2', title: '시스템설정', sort_order: 1,
        tasks: [
          { id: 'task-ob-2-1', title: '사내 이메일 계정 생성', assignee_role: 'it', is_required: true, sort_order: 0, documents: [] },
          { id: 'task-ob-2-2', title: 'PC 및 장비 준비', assignee_role: 'it', is_required: true, sort_order: 1, documents: [] },
          { id: 'task-ob-2-3', title: '시스템 접근권한 설정', assignee_role: 'it', is_required: true, sort_order: 2, documents: [] },
        ],
      },
      {
        id: 'step-ob-3', title: '인사등록', sort_order: 2,
        tasks: [
          { id: 'task-ob-3-1', title: 'HRMS 인사정보 등록', assignee_role: 'hr', is_required: true, sort_order: 0, documents: [] },
          { id: 'task-ob-3-2', title: '4대보험 취득신고', assignee_role: 'hr', is_required: true, sort_order: 1, documents: [] },
          { id: 'task-ob-3-3', title: '사원증 발급', assignee_role: 'admin', is_required: false, sort_order: 2, documents: [] },
        ],
      },
      {
        id: 'step-ob-4', title: '교육', sort_order: 3,
        tasks: [
          { id: 'task-ob-4-1', title: '사내규정 및 취업규칙 교육', assignee_role: 'hr', is_required: true, sort_order: 0, documents: [] },
          { id: 'task-ob-4-2', title: '정보보안 교육 수료', assignee_role: 'it', is_required: true, sort_order: 1, documents: [] },
        ],
      },
      {
        id: 'step-ob-5', title: '부서배치', sort_order: 4,
        tasks: [
          { id: 'task-ob-5-1', title: '부서 인사 소개', assignee_role: 'manager', is_required: true, sort_order: 0, documents: [] },
          { id: 'task-ob-5-2', title: '멘토 지정 및 OJT 시작', assignee_role: 'mentor', is_required: false, sort_order: 1, documents: [] },
        ],
      },
      {
        id: 'step-ob-6', title: '완료', sort_order: 5,
        tasks: [
          { id: 'task-ob-6-1', title: '입사 프로세스 최종 확인', assignee_role: 'hr', is_required: true, sort_order: 0, documents: [] },
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
          { id: 'task-off-1-1', title: '사직서 접수 확인', assignee_role: 'hr', is_required: true, sort_order: 0, documents: [] },
          { id: 'task-off-1-2', title: '퇴사일 확정', assignee_role: 'hr', is_required: true, sort_order: 1, documents: [] },
          { id: 'task-off-1-3', title: '잔여 연차 확인', assignee_role: 'hr', is_required: true, sort_order: 2, documents: [] },
        ],
      },
      {
        id: 'step-off-2', title: '인수인계', sort_order: 1,
        tasks: [
          { id: 'task-off-2-1', title: '업무 인수인계서 작성', assignee_role: 'employee', is_required: true, sort_order: 0, documents: [] },
          { id: 'task-off-2-2', title: '인수인계 확인 (부서장)', assignee_role: 'manager', is_required: true, sort_order: 1, documents: [] },
          { id: 'task-off-2-3', title: '프로젝트 자료 이관', assignee_role: 'employee', is_required: true, sort_order: 2, documents: [] },
        ],
      },
      {
        id: 'step-off-3', title: '자산반납/계정해지', sort_order: 2,
        tasks: [
          { id: 'task-off-3-1', title: 'PC 및 장비 반납', assignee_role: 'it', is_required: true, sort_order: 0, documents: [] },
          { id: 'task-off-3-2', title: '시스템 계정 해지', assignee_role: 'it', is_required: true, sort_order: 1, documents: [] },
          { id: 'task-off-3-3', title: '사원증 회수', assignee_role: 'admin', is_required: true, sort_order: 2, documents: [] },
        ],
      },
      {
        id: 'step-off-4', title: '퇴직정산', sort_order: 3,
        tasks: [
          { id: 'task-off-4-1', title: '퇴직금 산정', assignee_role: 'finance', is_required: true, sort_order: 0, documents: [] },
          { id: 'task-off-4-2', title: '4대보험 상실신고', assignee_role: 'hr', is_required: true, sort_order: 1, documents: [] },
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
          { id: 'task-pr-1-1', title: '승진 대상자 평가 확인', assignee_role: 'hr', is_required: true, sort_order: 0, documents: [] },
          { id: 'task-pr-1-2', title: '승진심사위원회 심의', assignee_role: 'hr', is_required: true, sort_order: 1, documents: [] },
        ],
      },
      {
        id: 'step-pr-2', title: '발령처리', sort_order: 1,
        tasks: [
          { id: 'task-pr-2-1', title: '승진 발령 공문 작성', assignee_role: 'hr', is_required: true, sort_order: 0, documents: [] },
          { id: 'task-pr-2-2', title: 'HRMS 직급 변경', assignee_role: 'hr', is_required: true, sort_order: 1, documents: [] },
          { id: 'task-pr-2-3', title: '급여 테이블 조정', assignee_role: 'finance', is_required: true, sort_order: 2, documents: [] },
        ],
      },
      {
        id: 'step-pr-3', title: '완료', sort_order: 2,
        tasks: [
          { id: 'task-pr-3-1', title: '승진 축하 안내 발송', assignee_role: 'hr', is_required: false, sort_order: 0, documents: [] },
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
      const documents: DocumentInstance[] = (task.documents || []).map((doc) => {
        // For completed steps, mark all docs as submitted
        // For step 2 (current), leave as pending
        let docStatus: DocumentSubmissionStatus = 'pending';
        let submittedBy: string | null = null;
        let submittedAt: string | null = null;
        if (isCompleted) {
          docStatus = 'submitted';
          submittedBy = '하사원';
          submittedAt = '2026-02-19T14:00:00Z';
        }
        return {
          id: `dinst-ob-${doc.id}`,
          requirement_id: doc.id,
          task_instance_id: `inst-ob-${task.id}`,
          title: doc.title,
          is_required: doc.is_required,
          responsible_role: doc.responsible_role,
          status: docStatus,
          submitted_by: submittedBy,
          submitted_at: submittedAt,
          rejected_reason: null,
          note: null,
        };
      });

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
        documents,
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
        documents: [],
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

  // Template step/task/document editing actions
  addStep: (templateId: string, title: string) => void;
  updateStep: (templateId: string, stepId: string, title: string) => void;
  removeStep: (templateId: string, stepId: string) => void;
  addTask: (templateId: string, stepId: string, title: string, assigneeRole: string, isRequired: boolean) => void;
  updateTask: (templateId: string, stepId: string, taskId: string, updates: Partial<Pick<WorkflowTemplateTask, 'title' | 'assignee_role' | 'is_required'>>) => void;
  removeTask: (templateId: string, stepId: string, taskId: string) => void;
  addDocumentRequirement: (templateId: string, stepId: string, taskId: string, doc: Omit<DocumentRequirement, 'id' | 'sort_order'>) => void;
  updateDocumentRequirement: (templateId: string, stepId: string, taskId: string, docId: string, updates: Partial<DocumentRequirement>) => void;
  removeDocumentRequirement: (templateId: string, stepId: string, taskId: string, docId: string) => void;

  // Instance actions
  createInstance: (templateId: string, employeeId: string, employeeName: string, department: string) => string | null;
  completeTask: (instanceId: string, taskId: string, completedBy: string, note?: string) => void;
  skipTask: (instanceId: string, taskId: string) => void;
  cancelInstance: (instanceId: string) => void;

  // Document instance actions
  submitDocument: (instanceId: string, taskId: string, docId: string, submittedBy: string) => void;
  rejectDocument: (instanceId: string, taskId: string, docId: string, reason: string) => void;
  resetDocumentStatus: (instanceId: string, taskId: string, docId: string) => void;
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

      // ---- Step/Task/Document template editing ----

      addStep: (templateId, title) => {
        set((state) => ({
          templates: state.templates.map((t) => {
            if (t.id !== templateId) return t;
            const newStep: WorkflowTemplateStep = {
              id: `step-${Date.now()}`,
              title,
              sort_order: t.steps.length,
              tasks: [],
            };
            return { ...t, steps: [...t.steps, newStep], updated_at: new Date().toISOString() };
          }),
        }));
      },

      updateStep: (templateId, stepId, title) => {
        set((state) => ({
          templates: state.templates.map((t) => {
            if (t.id !== templateId) return t;
            return {
              ...t,
              steps: t.steps.map((s) => (s.id === stepId ? { ...s, title } : s)),
              updated_at: new Date().toISOString(),
            };
          }),
        }));
      },

      removeStep: (templateId, stepId) => {
        set((state) => ({
          templates: state.templates.map((t) => {
            if (t.id !== templateId) return t;
            return {
              ...t,
              steps: t.steps.filter((s) => s.id !== stepId).map((s, i) => ({ ...s, sort_order: i })),
              updated_at: new Date().toISOString(),
            };
          }),
        }));
      },

      addTask: (templateId, stepId, title, assigneeRole, isRequired) => {
        set((state) => ({
          templates: state.templates.map((t) => {
            if (t.id !== templateId) return t;
            return {
              ...t,
              steps: t.steps.map((s) => {
                if (s.id !== stepId) return s;
                const newTask: WorkflowTemplateTask = {
                  id: `task-${Date.now()}`,
                  title,
                  assignee_role: assigneeRole,
                  is_required: isRequired,
                  sort_order: s.tasks.length,
                  documents: [],
                };
                return { ...s, tasks: [...s.tasks, newTask] };
              }),
              updated_at: new Date().toISOString(),
            };
          }),
        }));
      },

      updateTask: (templateId, stepId, taskId, updates) => {
        set((state) => ({
          templates: state.templates.map((t) => {
            if (t.id !== templateId) return t;
            return {
              ...t,
              steps: t.steps.map((s) => {
                if (s.id !== stepId) return s;
                return { ...s, tasks: s.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)) };
              }),
              updated_at: new Date().toISOString(),
            };
          }),
        }));
      },

      removeTask: (templateId, stepId, taskId) => {
        set((state) => ({
          templates: state.templates.map((t) => {
            if (t.id !== templateId) return t;
            return {
              ...t,
              steps: t.steps.map((s) => {
                if (s.id !== stepId) return s;
                return { ...s, tasks: s.tasks.filter((task) => task.id !== taskId).map((task, i) => ({ ...task, sort_order: i })) };
              }),
              updated_at: new Date().toISOString(),
            };
          }),
        }));
      },

      addDocumentRequirement: (templateId, stepId, taskId, doc) => {
        set((state) => ({
          templates: state.templates.map((t) => {
            if (t.id !== templateId) return t;
            return {
              ...t,
              steps: t.steps.map((s) => {
                if (s.id !== stepId) return s;
                return {
                  ...s,
                  tasks: s.tasks.map((task) => {
                    if (task.id !== taskId) return task;
                    const newDoc: DocumentRequirement = {
                      ...doc,
                      id: `doc-${Date.now()}`,
                      sort_order: task.documents.length,
                    };
                    return { ...task, documents: [...task.documents, newDoc] };
                  }),
                };
              }),
              updated_at: new Date().toISOString(),
            };
          }),
        }));
      },

      updateDocumentRequirement: (templateId, stepId, taskId, docId, updates) => {
        set((state) => ({
          templates: state.templates.map((t) => {
            if (t.id !== templateId) return t;
            return {
              ...t,
              steps: t.steps.map((s) => {
                if (s.id !== stepId) return s;
                return {
                  ...s,
                  tasks: s.tasks.map((task) => {
                    if (task.id !== taskId) return task;
                    return { ...task, documents: task.documents.map((d) => (d.id === docId ? { ...d, ...updates } : d)) };
                  }),
                };
              }),
              updated_at: new Date().toISOString(),
            };
          }),
        }));
      },

      removeDocumentRequirement: (templateId, stepId, taskId, docId) => {
        set((state) => ({
          templates: state.templates.map((t) => {
            if (t.id !== templateId) return t;
            return {
              ...t,
              steps: t.steps.map((s) => {
                if (s.id !== stepId) return s;
                return {
                  ...s,
                  tasks: s.tasks.map((task) => {
                    if (task.id !== taskId) return task;
                    return { ...task, documents: task.documents.filter((d) => d.id !== docId).map((d, i) => ({ ...d, sort_order: i })) };
                  }),
                };
              }),
              updated_at: new Date().toISOString(),
            };
          }),
        }));
      },

      // ---- Instance actions ----

      createInstance: (templateId, employeeId, employeeName, department) => {
        const template = get().templates.find((t) => t.id === templateId);
        if (!template) return null;

        const instanceId = `wf-inst-${Date.now()}`;
        const now = new Date().toISOString();

        const tasks: WorkflowTaskInstance[] = [];
        template.steps.forEach((step, stepIdx) => {
          step.tasks.forEach((task) => {
            const taskInstanceId = `${instanceId}-${task.id}`;
            const documents: DocumentInstance[] = (task.documents || []).map((doc) => ({
              id: `dinst-${Date.now()}-${doc.id}`,
              requirement_id: doc.id,
              task_instance_id: taskInstanceId,
              title: doc.title,
              is_required: doc.is_required,
              responsible_role: doc.responsible_role,
              status: 'pending' as DocumentSubmissionStatus,
              submitted_by: null,
              submitted_at: null,
              rejected_reason: null,
              note: null,
            }));

            tasks.push({
              id: taskInstanceId,
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
              documents,
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

      // ---- Document instance actions ----

      submitDocument: (instanceId, taskId, docId, submittedBy) => {
        set((state) => ({
          instances: state.instances.map((inst) => {
            if (inst.id !== instanceId) return inst;
            return {
              ...inst,
              tasks: inst.tasks.map((t) => {
                if (t.id !== taskId) return t;
                return {
                  ...t,
                  documents: t.documents.map((d) =>
                    d.id === docId
                      ? { ...d, status: 'submitted' as DocumentSubmissionStatus, submitted_by: submittedBy, submitted_at: new Date().toISOString(), rejected_reason: null }
                      : d
                  ),
                };
              }),
            };
          }),
        }));
      },

      rejectDocument: (instanceId, taskId, docId, reason) => {
        set((state) => ({
          instances: state.instances.map((inst) => {
            if (inst.id !== instanceId) return inst;
            return {
              ...inst,
              tasks: inst.tasks.map((t) => {
                if (t.id !== taskId) return t;
                return {
                  ...t,
                  documents: t.documents.map((d) =>
                    d.id === docId
                      ? { ...d, status: 'rejected' as DocumentSubmissionStatus, rejected_reason: reason }
                      : d
                  ),
                };
              }),
            };
          }),
        }));
      },

      resetDocumentStatus: (instanceId, taskId, docId) => {
        set((state) => ({
          instances: state.instances.map((inst) => {
            if (inst.id !== instanceId) return inst;
            return {
              ...inst,
              tasks: inst.tasks.map((t) => {
                if (t.id !== taskId) return t;
                return {
                  ...t,
                  documents: t.documents.map((d) =>
                    d.id === docId
                      ? { ...d, status: 'pending' as DocumentSubmissionStatus, submitted_by: null, submitted_at: null, rejected_reason: null }
                      : d
                  ),
                };
              }),
            };
          }),
        }));
      },
    }),
    { name: 'hrms-workflow' }
  )
);
