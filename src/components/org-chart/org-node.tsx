'use client';

import { useState, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Building2, Mail, Phone, User, ExternalLink } from 'lucide-react';
import { DraggableEmployee } from './draggable-employee';
import type { Employee, DragPayload } from '@/types';

// 1x1 transparent image to hide native drag ghost
const EMPTY_IMG = typeof Image !== 'undefined' ? (() => {
  const img = new Image(1, 1);
  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  return img;
})() : null;

interface OrgNodeProps {
  name: string;
  title?: string;
  rank?: string;
  employeeCount?: number;
  isExpanded?: boolean;
  onToggle?: () => void;
  employees?: Employee[];
  departmentId?: string;
  isSimulating?: boolean;
  isModified?: boolean;
  onDropItem?: (payload: DragPayload, targetDeptId: string) => void;
  onDragPreviewStart?: (payload: DragPayload) => void;
  onDragPreviewEnd?: () => void;
}

export function OrgNode({
  name,
  title,
  rank,
  employeeCount,
  isExpanded,
  onToggle,
  employees,
  departmentId,
  isSimulating,
  isModified,
  onDropItem,
  onDragPreviewStart,
  onDragPreviewEnd,
}: OrgNodeProps) {
  const router = useRouter();
  const hasEmployees = employees && employees.length > 0;
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e: DragEvent) => {
    if (!isSimulating || !departmentId) return;
    e.stopPropagation();
    const payload: DragPayload = {
      type: 'department',
      id: departmentId,
      sourceDepartmentId: departmentId,
      name,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';

    // Hide native ghost, show custom overlay
    if (EMPTY_IMG) {
      e.dataTransfer.setDragImage(EMPTY_IMG, 0, 0);
    }
    onDragPreviewStart?.(payload);
  };

  const handleDragEnd = () => {
    onDragPreviewEnd?.();
  };

  const handleDragOver = (e: DragEvent) => {
    if (!isSimulating) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (!isSimulating || !departmentId || !onDropItem) return;
    try {
      const payload: DragPayload = JSON.parse(e.dataTransfer.getData('application/json'));
      if (payload.sourceDepartmentId === departmentId && payload.type === 'employee') return;
      if (payload.id === departmentId && payload.type === 'department') return;
      onDropItem(payload, departmentId);
    } catch {
      // ignore invalid data
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex flex-col items-center">
          <div
            draggable={isSimulating}
            onDragStart={isSimulating ? handleDragStart : undefined}
            onDragEnd={isSimulating ? handleDragEnd : undefined}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border rounded-lg p-3 bg-background shadow-sm min-w-[160px] cursor-pointer hover:shadow-md transition-shadow ${
              isSimulating ? 'cursor-grab active:cursor-grabbing' : ''
            } ${isDragOver ? 'ring-2 ring-primary bg-primary/5' : ''} ${
              isModified ? 'border-l-4 border-l-amber-500' : ''
            }`}
            onClick={onToggle}
          >
            <p className="font-semibold text-sm text-center">{name}</p>
            {title && <p className="text-xs text-muted-foreground text-center">{title}</p>}
            {rank && <p className="text-xs text-muted-foreground text-center">{rank}</p>}
            {employeeCount !== undefined && (
              <Badge variant="secondary" className="mt-1 mx-auto block w-fit text-xs">
                {employeeCount}명
              </Badge>
            )}
          </div>
          {isExpanded && hasEmployees && (
            <div className="mt-2 space-y-1">
              {employees.map((emp) =>
                isSimulating ? (
                  <DraggableEmployee
                    key={emp.id}
                    employee={emp}
                    departmentId={departmentId ?? ''}
                    isSimulating
                    onDragPreviewStart={onDragPreviewStart}
                    onDragPreviewEnd={onDragPreviewEnd}
                  />
                ) : (
                  <div key={emp.id} className="flex items-center gap-2 text-xs px-2 py-1 rounded hover:bg-muted">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[10px]">{emp.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{emp.name}</span>
                    {emp.position_rank && (
                      <span className="text-muted-foreground">{emp.position_rank.name}</span>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-56">
        <ContextMenuLabel className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          {name}
        </ContextMenuLabel>
        <ContextMenuSeparator />

        {departmentId && (
          <ContextMenuItem onClick={() => router.push(`/organization/departments/${departmentId}`)}>
            <ExternalLink className="h-4 w-4" />
            부서 상세 보기
          </ContextMenuItem>
        )}

        {hasEmployees && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <User className="h-4 w-4" />
              소속 직원 ({employees.length}명)
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-64">
              {employees.map((emp) => (
                <ContextMenuSub key={emp.id}>
                  <ContextMenuSubTrigger>
                    <Avatar className="h-5 w-5 mr-1">
                      <AvatarFallback className="text-[10px]">{emp.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{emp.name}</span>
                    {emp.position_rank && (
                      <span className="ml-auto text-xs text-muted-foreground">{emp.position_rank.name}</span>
                    )}
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent className="w-60">
                    <ContextMenuLabel>{emp.name} {emp.position_rank?.name}</ContextMenuLabel>
                    <ContextMenuSeparator />
                    {emp.email && (
                      <ContextMenuItem disabled>
                        <Mail className="h-4 w-4" />
                        {emp.email}
                      </ContextMenuItem>
                    )}
                    {emp.phone && (
                      <ContextMenuItem disabled>
                        <Phone className="h-4 w-4" />
                        {emp.phone}
                      </ContextMenuItem>
                    )}
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => router.push(`/employees/${emp.id}`)}>
                      <ExternalLink className="h-4 w-4" />
                      직원 상세 보기
                    </ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

        {!hasEmployees && (
          <ContextMenuItem disabled>
            <User className="h-4 w-4" />
            소속 직원 없음
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
