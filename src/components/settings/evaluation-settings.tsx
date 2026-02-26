'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/lib/stores/settings-store';
import type { EvaluationCriterion } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_LABELS: Record<string, string> = {
  performance: '업무성과',
  competency: '업무역량',
  leadership: '리더십',
  attitude: '태도',
  development: '자기개발',
};

interface CriterionFormData {
  name: string;
  category: string;
  weight: number;
  description: string;
}

const emptyCriterionForm: CriterionFormData = {
  name: '',
  category: '',
  weight: 0,
  description: '',
};

export default function EvaluationSettings() {
  const evaluation = useSettingsStore((s) => s.evaluation);
  const evaluationCriteria = useSettingsStore((s) => s.evaluationCriteria);
  const updateEvaluation = useSettingsStore((s) => s.updateEvaluation);
  const addEvaluationCriterion = useSettingsStore((s) => s.addEvaluationCriterion);
  const updateEvaluationCriterion = useSettingsStore((s) => s.updateEvaluationCriterion);
  const deleteEvaluationCriterion = useSettingsStore((s) => s.deleteEvaluationCriterion);

  // Weight form
  const [weightForm, setWeightForm] = useState({
    self_weight: 0,
    manager_weight: 0,
    peer_weight: 0,
  });

  // Grade ratio form
  const [gradeForm, setGradeForm] = useState({
    grade_s_ratio: 0,
    grade_a_ratio: 0,
    grade_b_ratio: 0,
    grade_c_ratio: 0,
    grade_d_ratio: 0,
  });

  // Criterion dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [criterionForm, setCriterionForm] = useState<CriterionFormData>({
    ...emptyCriterionForm,
  });

  useEffect(() => {
    setWeightForm({
      self_weight: evaluation.self_weight,
      manager_weight: evaluation.manager_weight,
      peer_weight: evaluation.peer_weight,
    });
    setGradeForm({
      grade_s_ratio: evaluation.grade_s_ratio,
      grade_a_ratio: evaluation.grade_a_ratio,
      grade_b_ratio: evaluation.grade_b_ratio,
      grade_c_ratio: evaluation.grade_c_ratio,
      grade_d_ratio: evaluation.grade_d_ratio,
    });
  }, [evaluation]);

  const weightSum = weightForm.self_weight + weightForm.manager_weight + weightForm.peer_weight;
  const gradeSum =
    gradeForm.grade_s_ratio +
    gradeForm.grade_a_ratio +
    gradeForm.grade_b_ratio +
    gradeForm.grade_c_ratio +
    gradeForm.grade_d_ratio;

  const handleWeightSave = () => {
    updateEvaluation(weightForm);
    toast.success('평가 가중치가 저장되었습니다.');
  };

  const handleGradeSave = () => {
    updateEvaluation(gradeForm);
    toast.success('등급 배분율이 저장되었습니다.');
  };

  const openCreateCriterionDialog = () => {
    setEditingId(null);
    setCriterionForm({ ...emptyCriterionForm });
    setDialogOpen(true);
  };

  const openEditCriterionDialog = (criterion: EvaluationCriterion) => {
    setEditingId(criterion.id);
    setCriterionForm({
      name: criterion.name,
      category: criterion.category,
      weight: criterion.weight,
      description: criterion.description ?? '',
    });
    setDialogOpen(true);
  };

  const handleDeleteCriterion = (id: string, name: string) => {
    if (window.confirm(`"${name}" 평가 항목을 삭제하시겠습니까?`)) {
      deleteEvaluationCriterion(id);
      toast.success('평가 항목이 삭제되었습니다.');
    }
  };

  const handleCriterionSave = () => {
    if (!criterionForm.name.trim()) {
      toast.error('항목명을 입력해주세요.');
      return;
    }
    if (!criterionForm.category) {
      toast.error('분류를 선택해주세요.');
      return;
    }

    const now = new Date().toISOString();

    if (editingId) {
      updateEvaluationCriterion(editingId, {
        name: criterionForm.name,
        category: criterionForm.category,
        weight: criterionForm.weight,
        description: criterionForm.description || null,
        updated_at: now,
      });
      toast.success('평가 항목이 수정되었습니다.');
    } else {
      const newCriterion: EvaluationCriterion = {
        id: `ec-${Date.now()}`,
        name: criterionForm.name,
        category: criterionForm.category,
        weight: criterionForm.weight,
        description: criterionForm.description || null,
        is_active: true,
        created_at: now,
        updated_at: now,
      };
      addEvaluationCriterion(newCriterion);
      toast.success('평가 항목이 추가되었습니다.');
    }

    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Card 1: 평가 가중치 */}
      <Card>
        <CardHeader>
          <CardTitle>평가 가중치</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="self-weight">자기평가 (%)</Label>
              <Input
                id="self-weight"
                type="number"
                min={0}
                max={100}
                value={weightForm.self_weight}
                onChange={(e) =>
                  setWeightForm((prev) => ({
                    ...prev,
                    self_weight: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager-weight">상사평가 (%)</Label>
              <Input
                id="manager-weight"
                type="number"
                min={0}
                max={100}
                value={weightForm.manager_weight}
                onChange={(e) =>
                  setWeightForm((prev) => ({
                    ...prev,
                    manager_weight: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="peer-weight">동료평가 (%)</Label>
              <Input
                id="peer-weight"
                type="number"
                min={0}
                max={100}
                value={weightForm.peer_weight}
                onChange={(e) =>
                  setWeightForm((prev) => ({
                    ...prev,
                    peer_weight: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-sm ${weightSum !== 100 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
              합계: {weightSum}% {weightSum !== 100 && '(합계가 100%이어야 합니다)'}
            </p>
            <Button onClick={handleWeightSave} disabled={weightSum !== 100}>
              저장
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: 등급 배분율 */}
      <Card>
        <CardHeader>
          <CardTitle>등급 배분율</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade-s">S등급 (%)</Label>
              <Input
                id="grade-s"
                type="number"
                min={0}
                max={100}
                value={gradeForm.grade_s_ratio}
                onChange={(e) =>
                  setGradeForm((prev) => ({
                    ...prev,
                    grade_s_ratio: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade-a">A등급 (%)</Label>
              <Input
                id="grade-a"
                type="number"
                min={0}
                max={100}
                value={gradeForm.grade_a_ratio}
                onChange={(e) =>
                  setGradeForm((prev) => ({
                    ...prev,
                    grade_a_ratio: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade-b">B등급 (%)</Label>
              <Input
                id="grade-b"
                type="number"
                min={0}
                max={100}
                value={gradeForm.grade_b_ratio}
                onChange={(e) =>
                  setGradeForm((prev) => ({
                    ...prev,
                    grade_b_ratio: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade-c">C등급 (%)</Label>
              <Input
                id="grade-c"
                type="number"
                min={0}
                max={100}
                value={gradeForm.grade_c_ratio}
                onChange={(e) =>
                  setGradeForm((prev) => ({
                    ...prev,
                    grade_c_ratio: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade-d">D등급 (%)</Label>
              <Input
                id="grade-d"
                type="number"
                min={0}
                max={100}
                value={gradeForm.grade_d_ratio}
                onChange={(e) =>
                  setGradeForm((prev) => ({
                    ...prev,
                    grade_d_ratio: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-sm ${gradeSum !== 100 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
              합계: {gradeSum}% {gradeSum !== 100 && '(합계가 100%이어야 합니다)'}
            </p>
            <Button onClick={handleGradeSave} disabled={gradeSum !== 100}>
              저장
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: 평가 항목 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>평가 항목</CardTitle>
            <Button onClick={openCreateCriterionDialog} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>항목명</TableHead>
                <TableHead>분류</TableHead>
                <TableHead>가중치(%)</TableHead>
                <TableHead>설명</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluationCriteria.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{CATEGORY_LABELS[c.category] ?? c.category}</TableCell>
                  <TableCell>{c.weight}%</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.description ?? '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditCriterionDialog(c)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCriterion(c.id, c.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {evaluationCriteria.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    등록된 평가 항목이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Criterion Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? '평가 항목 수정' : '평가 항목 추가'}
            </DialogTitle>
            <DialogDescription>
              평가 항목 정보를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="criterion-name">항목명</Label>
              <Input
                id="criterion-name"
                value={criterionForm.name}
                onChange={(e) =>
                  setCriterionForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="예: 업무 성과"
              />
            </div>
            <div className="space-y-2">
              <Label>분류</Label>
              <Select
                value={criterionForm.category}
                onValueChange={(value) =>
                  setCriterionForm((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="분류 선택" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="criterion-weight">가중치 (%)</Label>
              <Input
                id="criterion-weight"
                type="number"
                min={0}
                max={100}
                value={criterionForm.weight}
                onChange={(e) =>
                  setCriterionForm((prev) => ({
                    ...prev,
                    weight: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="criterion-description">설명</Label>
              <textarea
                id="criterion-description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={criterionForm.description}
                onChange={(e) =>
                  setCriterionForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="평가 항목에 대한 설명을 입력해주세요."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCriterionSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
