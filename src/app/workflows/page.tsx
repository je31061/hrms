'use client';

import { useState } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { useCodeMap, CODE } from '@/lib/hooks/use-code';
import WorkflowProgressCard from '@/components/workflow/workflow-progress-card';
import { toast } from 'sonner';

export default function WorkflowsPage() {
  const WORKFLOW_TYPE = useCodeMap(CODE.WORKFLOW_TYPE);
  const instances = useWorkflowStore((s) => s.instances);
  const templates = useWorkflowStore((s) => s.templates);
  const createInstance = useWorkflowStore((s) => s.createInstance);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeDepartment, setEmployeeDepartment] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const activeTemplates = templates.filter((t) => t.is_active);

  const filteredByType = (items: typeof instances) =>
    typeFilter === 'all' ? items : items.filter((i) => i.type === typeFilter);

  const inProgress = filteredByType(
    instances.filter((i) => i.status === 'in_progress' || i.status === 'pending')
  );
  const completed = filteredByType(
    instances.filter((i) => i.status === 'completed')
  );
  const all = filteredByType(instances);

  const handleCreate = () => {
    if (!selectedTemplate || !employeeName.trim()) {
      toast.error('템플릿과 직원명을 입력해주세요.');
      return;
    }
    const id = createInstance(
      selectedTemplate,
      `e-${Date.now()}`,
      employeeName.trim(),
      employeeDepartment.trim() || '-'
    );
    if (id) {
      toast.success('프로세스가 시작되었습니다.');
      setDialogOpen(false);
      setSelectedTemplate('');
      setEmployeeName('');
      setEmployeeDepartment('');
    }
  };

  return (
    <div>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">업무프로세스</h1>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          새 프로세스 시작
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Label className="text-sm text-muted-foreground">유형:</Label>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {Object.entries(WORKFLOW_TYPE).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="in_progress" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="in_progress">
            진행중 ({inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            완료 ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            전체 ({all.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in_progress">
          <InstanceGrid instances={inProgress} />
        </TabsContent>
        <TabsContent value="completed">
          <InstanceGrid instances={completed} />
        </TabsContent>
        <TabsContent value="all">
          <InstanceGrid instances={all} />
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 프로세스 시작</DialogTitle>
            <DialogDescription>
              템플릿을 선택하고 대상 직원 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>프로세스 템플릿</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="템플릿 선택" />
                </SelectTrigger>
                <SelectContent>
                  {activeTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({WORKFLOW_TYPE[t.type as keyof typeof WORKFLOW_TYPE]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>직원명</Label>
              <Input
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="이름 입력"
              />
            </div>
            <div className="space-y-2">
              <Label>부서</Label>
              <Input
                value={employeeDepartment}
                onChange={(e) => setEmployeeDepartment(e.target.value)}
                placeholder="부서 입력"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreate}>시작</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InstanceGrid({ instances }: { instances: ReturnType<typeof useWorkflowStore.getState>['instances'] }) {
  if (instances.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        해당하는 프로세스가 없습니다.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {instances.map((inst) => (
        <WorkflowProgressCard key={inst.id} instance={inst} />
      ))}
    </div>
  );
}
