'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useWorkflowStore, type WorkflowTemplate } from '@/lib/stores/workflow-store';
import { WORKFLOW_TYPE } from '@/lib/constants/codes';
import type { WorkflowType } from '@/types';
import { toast } from 'sonner';

export default function WorkflowTemplateSettings() {
  const templates = useWorkflowStore((s) => s.templates);
  const addTemplate = useWorkflowStore((s) => s.addTemplate);
  const updateTemplate = useWorkflowStore((s) => s.updateTemplate);
  const deleteTemplate = useWorkflowStore((s) => s.deleteTemplate);
  const toggleTemplateActive = useWorkflowStore((s) => s.toggleTemplateActive);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WorkflowTemplate | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'onboarding' as WorkflowType,
    description: '',
  });

  const handleAdd = () => {
    setEditing(null);
    setForm({ name: '', type: 'onboarding', description: '' });
    setDialogOpen(true);
  };

  const handleEdit = (template: WorkflowTemplate) => {
    setEditing(template);
    setForm({
      name: template.name,
      type: template.type,
      description: template.description,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('템플릿 이름을 입력해주세요.');
      return;
    }

    if (editing) {
      updateTemplate(editing.id, {
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim(),
      });
      toast.success('템플릿이 수정되었습니다.');
    } else {
      addTemplate({
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim(),
        steps: [],
        is_active: true,
      });
      toast.success('템플릿이 추가되었습니다.');
    }
    setDialogOpen(false);
  };

  const handleDelete = (template: WorkflowTemplate) => {
    deleteTemplate(template.id);
    toast.success('템플릿이 삭제되었습니다.');
  };

  const getStepCount = (t: WorkflowTemplate) => t.steps.length;
  const getTaskCount = (t: WorkflowTemplate) =>
    t.steps.reduce((sum, step) => sum + step.tasks.length, 0);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>프로세스 템플릿 관리</CardTitle>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            추가
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>유형</TableHead>
                <TableHead className="text-center">단계수</TableHead>
                <TableHead className="text-center">태스크수</TableHead>
                <TableHead className="text-center">활성</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {WORKFLOW_TYPE[t.type as keyof typeof WORKFLOW_TYPE] || t.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{getStepCount(t)}</TableCell>
                  <TableCell className="text-center">{getTaskCount(t)}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={t.is_active}
                      onCheckedChange={() => toggleTemplateActive(t.id)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(t)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(t)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {templates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    등록된 템플릿이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? '템플릿 수정' : '템플릿 추가'}</DialogTitle>
            <DialogDescription>
              프로세스 템플릿의 기본 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>템플릿 이름</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="예: 신입사원 입사"
              />
            </div>
            <div className="space-y-2">
              <Label>유형</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v as WorkflowType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WORKFLOW_TYPE).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>설명</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="프로세스 설명"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
