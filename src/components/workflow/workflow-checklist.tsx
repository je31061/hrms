'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { WORKFLOW_ASSIGNEE_ROLES, WORKFLOW_TASK_STATUS } from '@/lib/constants/codes';
import type { WorkflowTaskInstance } from '@/lib/stores/workflow-store';
import { format } from 'date-fns';

interface WorkflowChecklistProps {
  tasks: WorkflowTaskInstance[];
  stepIndex: number;
  currentStep: number;
  instanceStatus: string;
  onComplete: (taskId: string) => void;
  onSkip: (taskId: string) => void;
}

export default function WorkflowChecklist({
  tasks,
  stepIndex,
  currentStep,
  instanceStatus,
  onComplete,
  onSkip,
}: WorkflowChecklistProps) {
  const stepTasks = tasks
    .filter((t) => t.step_index === stepIndex)
    .sort((a, b) => a.sort_order - b.sort_order);

  const isEditable = instanceStatus === 'in_progress' && stepIndex === currentStep;
  const isPast = stepIndex < currentStep || instanceStatus === 'completed';

  return (
    <div className="space-y-3">
      {stepTasks.map((task) => {
        const isDone = task.status === 'completed';
        const isSkipped = task.status === 'skipped';
        const roleLabel =
          WORKFLOW_ASSIGNEE_ROLES[task.assignee_role as keyof typeof WORKFLOW_ASSIGNEE_ROLES] ||
          task.assignee_role;

        return (
          <div
            key={task.id}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg border',
              isDone && 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900',
              isSkipped && 'bg-muted/50 border-muted',
              !isDone && !isSkipped && 'bg-background'
            )}
          >
            <Checkbox
              checked={isDone}
              disabled={!isEditable || isDone || isSkipped}
              onCheckedChange={(checked) => {
                if (checked) onComplete(task.id);
              }}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isDone && 'line-through text-muted-foreground',
                    isSkipped && 'line-through text-muted-foreground'
                  )}
                >
                  {task.title}
                </span>
                <Badge variant="outline" className="text-xs shrink-0">
                  {roleLabel}
                </Badge>
                {task.is_required ? (
                  <Badge variant="destructive" className="text-xs shrink-0">
                    필수
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    선택
                  </Badge>
                )}
                {isSkipped && (
                  <Badge variant="secondary" className="text-xs">
                    {WORKFLOW_TASK_STATUS.skipped}
                  </Badge>
                )}
              </div>
              {isDone && task.completed_by && (
                <p className="text-xs text-muted-foreground mt-1">
                  {task.completed_by} 완료
                  {task.completed_at &&
                    ` (${format(new Date(task.completed_at), 'yyyy-MM-dd HH:mm')})`}
                  {task.note && ` — ${task.note}`}
                </p>
              )}
              {isEditable && !isDone && !isSkipped && !task.is_required && (
                <button
                  onClick={() => onSkip(task.id)}
                  className="text-xs text-muted-foreground hover:text-foreground mt-1 underline"
                >
                  건너뛰기
                </button>
              )}
            </div>
          </div>
        );
      })}
      {stepTasks.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          이 단계에 등록된 태스크가 없습니다.
        </p>
      )}
      {isPast && !isEditable && (
        <p className="text-xs text-muted-foreground text-center">
          완료된 단계입니다 (읽기 전용)
        </p>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
