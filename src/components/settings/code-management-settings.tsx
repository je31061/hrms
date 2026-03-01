'use client';

import { useState, useMemo } from 'react';
import { useCodeStore, type CodeGroup, type CodeItem } from '@/lib/stores/code-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Shield } from 'lucide-react';

// ---- Group Dialog ----

function GroupDialog({
  open,
  onOpenChange,
  editGroup,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editGroup: CodeGroup | null;
}) {
  const addCodeGroup = useCodeStore((s) => s.addCodeGroup);
  const updateCodeGroup = useCodeStore((s) => s.updateCodeGroup);

  const [form, setForm] = useState({
    group_code: '',
    group_name: '',
    description: '',
    sort_order: 1,
  });

  const resetForm = (group?: CodeGroup | null) => {
    if (group) {
      setForm({
        group_code: group.group_code,
        group_name: group.group_name,
        description: group.description,
        sort_order: group.sort_order,
      });
    } else {
      setForm({ group_code: '', group_name: '', description: '', sort_order: 1 });
    }
  };

  // Reset form when dialog opens
  const handleOpenChange = (v: boolean) => {
    if (v) resetForm(editGroup);
    onOpenChange(v);
  };

  const handleSave = () => {
    if (!form.group_code.trim() || !form.group_name.trim()) {
      toast.error('코드와 이름은 필수입니다.');
      return;
    }

    if (editGroup) {
      updateCodeGroup(editGroup.id, {
        group_name: form.group_name,
        description: form.description,
        sort_order: form.sort_order,
      });
      toast.success('코드그룹이 수정되었습니다.');
    } else {
      addCodeGroup({
        group_code: form.group_code.toUpperCase(),
        group_name: form.group_name,
        description: form.description,
        sort_order: form.sort_order,
        is_active: true,
      });
      toast.success('코드그룹이 추가되었습니다.');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editGroup ? '코드그룹 수정' : '코드그룹 추가'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>그룹코드</Label>
            <Input
              value={form.group_code}
              onChange={(e) => setForm((f) => ({ ...f, group_code: e.target.value }))}
              placeholder="예: CUSTOM_STATUS"
              disabled={!!editGroup}
            />
          </div>
          <div className="space-y-2">
            <Label>그룹명</Label>
            <Input
              value={form.group_name}
              onChange={(e) => setForm((f) => ({ ...f, group_name: e.target.value }))}
              placeholder="예: 사용자정의상태"
            />
          </div>
          <div className="space-y-2">
            <Label>설명</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="코드그룹 설명"
            />
          </div>
          <div className="space-y-2">
            <Label>정렬순서</Label>
            <Input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Item Dialog ----

function ItemDialog({
  open,
  onOpenChange,
  groupId,
  editItem,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  groupId: string;
  editItem: CodeItem | null;
}) {
  const addCodeItem = useCodeStore((s) => s.addCodeItem);
  const updateCodeItem = useCodeStore((s) => s.updateCodeItem);

  const [form, setForm] = useState({
    code: '',
    label: '',
    sort_order: 1,
  });

  const resetForm = (item?: CodeItem | null) => {
    if (item) {
      setForm({ code: item.code, label: item.label, sort_order: item.sort_order });
    } else {
      setForm({ code: '', label: '', sort_order: 1 });
    }
  };

  const handleOpenChange = (v: boolean) => {
    if (v) resetForm(editItem);
    onOpenChange(v);
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.label.trim()) {
      toast.error('코드와 라벨은 필수입니다.');
      return;
    }

    if (editItem) {
      updateCodeItem(editItem.id, {
        label: form.label,
        sort_order: form.sort_order,
      });
      toast.success('코드항목이 수정되었습니다.');
    } else {
      addCodeItem({
        group_id: groupId,
        code: form.code,
        label: form.label,
        sort_order: form.sort_order,
        is_active: true,
      });
      toast.success('코드항목이 추가되었습니다.');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editItem ? '코드항목 수정' : '코드항목 추가'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>코드키</Label>
            <Input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="예: custom_value"
              disabled={!!editItem}
            />
          </div>
          <div className="space-y-2">
            <Label>라벨명</Label>
            <Input
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="예: 사용자정의값"
            />
          </div>
          <div className="space-y-2">
            <Label>정렬순서</Label>
            <Input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Main Component ----

export default function CodeManagementSettings() {
  const codeGroups = useCodeStore((s) => s.codeGroups);
  const codeItems = useCodeStore((s) => s.codeItems);
  const deleteCodeGroup = useCodeStore((s) => s.deleteCodeGroup);
  const toggleCodeGroupActive = useCodeStore((s) => s.toggleCodeGroupActive);
  const deleteCodeItem = useCodeStore((s) => s.deleteCodeItem);
  const toggleCodeItemActive = useCodeStore((s) => s.toggleCodeItemActive);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    codeGroups[0]?.id ?? null
  );
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<CodeGroup | null>(null);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<CodeItem | null>(null);

  const sortedGroups = useMemo(
    () => [...codeGroups].sort((a, b) => a.sort_order - b.sort_order),
    [codeGroups]
  );

  const selectedGroup = codeGroups.find((g) => g.id === selectedGroupId) ?? null;

  const groupItems = useMemo(
    () =>
      codeItems
        .filter((i) => i.group_id === selectedGroupId)
        .sort((a, b) => a.sort_order - b.sort_order),
    [codeItems, selectedGroupId]
  );

  const handleAddGroup = () => {
    setEditGroup(null);
    setGroupDialogOpen(true);
  };

  const handleEditGroup = () => {
    if (!selectedGroup) return;
    setEditGroup(selectedGroup);
    setGroupDialogOpen(true);
  };

  const handleDeleteGroup = () => {
    if (!selectedGroup) return;
    if (selectedGroup.is_system) {
      toast.error('시스템 코드그룹은 삭제할 수 없습니다.');
      return;
    }
    if (!window.confirm(`"${selectedGroup.group_name}" 그룹을 삭제하시겠습니까? 하위 항목도 모두 삭제됩니다.`)) return;
    const success = deleteCodeGroup(selectedGroup.id);
    if (success) {
      toast.success('코드그룹이 삭제되었습니다.');
      setSelectedGroupId(sortedGroups.find((g) => g.id !== selectedGroup.id)?.id ?? null);
    }
  };

  const handleAddItem = () => {
    setEditItem(null);
    setItemDialogOpen(true);
  };

  const handleEditItem = (item: CodeItem) => {
    setEditItem(item);
    setItemDialogOpen(true);
  };

  const handleDeleteItem = (item: CodeItem) => {
    if (item.is_system) {
      toast.error('시스템 코드항목은 삭제할 수 없습니다.');
      return;
    }
    if (!window.confirm(`"${item.label}" 항목을 삭제하시겠습니까?`)) return;
    const success = deleteCodeItem(item.id);
    if (success) {
      toast.success('코드항목이 삭제되었습니다.');
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="flex min-h-[600px]">
            {/* Left Panel - Group List */}
            <div className="w-64 border-r flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-sm">코드그룹</h3>
                <Button size="sm" variant="outline" onClick={handleAddGroup}>
                  <Plus className="h-4 w-4 mr-1" />
                  추가
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {sortedGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroupId(group.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedGroupId === group.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="truncate flex-1">{group.group_name}</span>
                        {group.is_system && (
                          <Shield className="h-3 w-3 shrink-0 opacity-60" />
                        )}
                        {!group.is_active && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">
                            비활성
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Right Panel - Items */}
            <div className="flex-1 flex flex-col">
              {selectedGroup ? (
                <>
                  {/* Group Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{selectedGroup.group_name}</h3>
                        <Badge variant="outline" className="font-mono text-xs">
                          {selectedGroup.group_code}
                        </Badge>
                        {selectedGroup.is_system && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            시스템
                          </Badge>
                        )}
                      </div>
                      {selectedGroup.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedGroup.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 mr-2">
                        <Label htmlFor="group-active" className="text-sm">활성</Label>
                        <Switch
                          id="group-active"
                          checked={selectedGroup.is_active}
                          onCheckedChange={() => toggleCodeGroupActive(selectedGroup.id)}
                        />
                      </div>
                      <Button size="sm" variant="outline" onClick={handleEditGroup}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {!selectedGroup.is_system && (
                        <Button size="sm" variant="outline" onClick={handleDeleteGroup}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="p-4 flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium">
                        코드항목 ({groupItems.length}개)
                      </h4>
                      <Button size="sm" onClick={handleAddItem}>
                        <Plus className="h-4 w-4 mr-1" />
                        항목 추가
                      </Button>
                    </div>

                    {groupItems.length === 0 ? (
                      <div className="text-center text-muted-foreground py-12">
                        등록된 코드항목이 없습니다.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>코드키</TableHead>
                            <TableHead>라벨명</TableHead>
                            <TableHead className="w-20 text-center">정렬</TableHead>
                            <TableHead className="w-20 text-center">상태</TableHead>
                            <TableHead className="w-24 text-center">관리</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-mono text-sm">
                                <div className="flex items-center gap-1.5">
                                  {item.code}
                                  {item.is_system && (
                                    <Shield className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{item.label}</TableCell>
                              <TableCell className="text-center">{item.sort_order}</TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={item.is_active}
                                  onCheckedChange={() => toggleCodeItemActive(item.id)}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditItem(item)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  {!item.is_system && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteItem(item)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  좌측에서 코드그룹을 선택하세요.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <GroupDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        editGroup={editGroup}
      />
      {selectedGroupId && (
        <ItemDialog
          open={itemDialogOpen}
          onOpenChange={setItemDialogOpen}
          groupId={selectedGroupId}
          editItem={editItem}
        />
      )}
    </>
  );
}
