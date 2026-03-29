'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/lib/stores/settings-store';
import type { Workplace } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = {
  code: '', name: '', business_number: '', representative: '', address: '',
  tax_office: '', industry_type: '', business_type: '', is_headquarters: false, is_active: true,
};

export default function WorkplaceSettings() {
  const workplaces = useSettingsStore((s) => s.workplaces);
  const addWorkplace = useSettingsStore((s) => s.addWorkplace);
  const updateWorkplace = useSettingsStore((s) => s.updateWorkplace);
  const deleteWorkplace = useSettingsStore((s) => s.deleteWorkplace);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Workplace | null>(null);
  const [form, setForm] = useState(emptyForm);

  const handleAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleEdit = (wp: Workplace) => {
    setEditing(wp);
    setForm({
      code: wp.code, name: wp.name, business_number: wp.business_number,
      representative: wp.representative, address: wp.address, tax_office: wp.tax_office,
      industry_type: wp.industry_type, business_type: wp.business_type,
      is_headquarters: wp.is_headquarters, is_active: wp.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = (wp: Workplace) => {
    if (wp.is_headquarters) { toast.error('본사 사업장은 삭제할 수 없습니다.'); return; }
    if (window.confirm(`"${wp.name}" 사업장을 삭제하시겠습니까?`)) {
      deleteWorkplace(wp.id);
      toast.success('사업장이 삭제되었습니다.');
    }
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim()) { toast.error('코드와 명칭을 입력해주세요.'); return; }
    if (!form.business_number.trim()) { toast.error('사업자등록번호를 입력해주세요.'); return; }
    const now = new Date().toISOString();
    if (editing) {
      updateWorkplace(editing.id, { ...form });
      toast.success('사업장이 수정되었습니다.');
    } else {
      addWorkplace({
        id: `wp-${crypto.randomUUID().slice(0, 8)}`,
        ...form,
        sort_order: workplaces.length + 1,
        created_at: now, updated_at: now,
      });
      toast.success('사업장이 추가되었습니다.');
    }
    setDialogOpen(false);
  };

  const sorted = [...workplaces].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>사업장 관리</CardTitle>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />사업장 추가
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            법인별 급여사업장과 근무지를 코드 기반으로 등록·관리합니다. 원천징수부 발급 시 사업장 정보가 표시됩니다.
          </p>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>코드</TableHead>
                  <TableHead>사업장명</TableHead>
                  <TableHead>사업자등록번호</TableHead>
                  <TableHead>대표자</TableHead>
                  <TableHead>관할세무서</TableHead>
                  <TableHead>업종</TableHead>
                  <TableHead>소재지</TableHead>
                  <TableHead>구분</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">등록된 사업장이 없습니다.</TableCell>
                  </TableRow>
                ) : sorted.map((wp) => (
                  <TableRow key={wp.id} className={!wp.is_active ? 'opacity-50' : ''}>
                    <TableCell className="font-mono text-sm font-bold">{wp.code}</TableCell>
                    <TableCell className="font-medium">{wp.name}</TableCell>
                    <TableCell className="text-sm font-mono">{wp.business_number}</TableCell>
                    <TableCell className="text-sm">{wp.representative}</TableCell>
                    <TableCell className="text-sm">{wp.tax_office}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{wp.industry_type}/{wp.business_type}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{wp.address}</TableCell>
                    <TableCell>
                      {wp.is_headquarters ? (
                        <Badge variant="default" className="text-xs">본사</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">지사/공장</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={wp.is_active ? 'default' : 'secondary'} className="text-xs">
                        {wp.is_active ? '활성' : '비활성'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(wp)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        {!wp.is_headquarters && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(wp)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? '사업장 수정' : '사업장 추가'}</DialogTitle>
            <DialogDescription>사업장 정보를 입력하세요. 원천징수부에 표시됩니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>사업장 코드</Label>
                <Input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="예: HQ, FAC2" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>사업장명</Label>
                <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="예: 본사 (미음산단)" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>사업자등록번호</Label>
                <Input value={form.business_number} onChange={(e) => setForm((p) => ({ ...p, business_number: e.target.value }))} placeholder="000-00-00000" />
              </div>
              <div className="space-y-2">
                <Label>대표자</Label>
                <Input value={form.representative} onChange={(e) => setForm((p) => ({ ...p, representative: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>소재지</Label>
              <Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>관할세무서</Label>
                <Input value={form.tax_office} onChange={(e) => setForm((p) => ({ ...p, tax_office: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>업태</Label>
                <Input value={form.industry_type} onChange={(e) => setForm((p) => ({ ...p, industry_type: e.target.value }))} placeholder="예: 제조업" />
              </div>
              <div className="space-y-2">
                <Label>종목</Label>
                <Input value={form.business_type} onChange={(e) => setForm((p) => ({ ...p, business_type: e.target.value }))} placeholder="예: 선박 구성 부분품" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_headquarters} onCheckedChange={(v) => setForm((p) => ({ ...p, is_headquarters: v }))} />
                <Label>본사</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))} />
                <Label>활성</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>취소</Button>
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
