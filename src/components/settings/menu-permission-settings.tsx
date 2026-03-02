'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { ALL_MENU_ITEMS } from '@/lib/constants/menu-items';
import type { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const ROLES: { value: UserRole; label: string; color: string }[] = [
  { value: 'admin', label: '시스템관리자', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'hr_manager', label: '인사담당자', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'dept_manager', label: '부서관리자', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'employee', label: '일반사원', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
];

export default function MenuPermissionSettings() {
  const menuPermissions = useSettingsStore((s) => s.menuPermissions);
  const updateMenuPermissions = useSettingsStore((s) => s.updateMenuPermissions);

  const [localPerms, setLocalPerms] = useState<Record<UserRole, string[]>>({
    ...menuPermissions,
  });

  const toggleMenu = (role: UserRole, href: string) => {
    setLocalPerms((prev) => {
      const current = prev[role] ?? [];
      const next = current.includes(href)
        ? current.filter((h) => h !== href)
        : [...current, href];
      return { ...prev, [role]: next };
    });
  };

  const selectAll = (role: UserRole) => {
    setLocalPerms((prev) => ({
      ...prev,
      [role]: ALL_MENU_ITEMS.map((m) => m.href),
    }));
  };

  const deselectAll = (role: UserRole) => {
    // Always keep dashboard
    setLocalPerms((prev) => ({
      ...prev,
      [role]: ['/'],
    }));
  };

  const handleSave = (role: UserRole) => {
    updateMenuPermissions(role, localPerms[role]);
    toast.success(`${ROLES.find((r) => r.value === role)?.label} 메뉴 권한이 저장되었습니다.`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>메뉴 접근 권한 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            각 역할별로 접근 가능한 메뉴를 설정합니다. 대시보드(/)는 모든 역할에 기본 포함됩니다.
          </p>

          <Tabs defaultValue="admin">
            <TabsList className="mb-4">
              {ROLES.map((role) => (
                <TabsTrigger key={role.value} value={role.value}>
                  {role.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {ROLES.map((role) => (
              <TabsContent key={role.value} value={role.value}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={role.color}>{role.label}</Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => selectAll(role.value)}>
                        전체 선택
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deselectAll(role.value)}>
                        전체 해제
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ALL_MENU_ITEMS.map((item) => {
                      const checked = (localPerms[role.value] ?? []).includes(item.href);
                      const isRequired = item.href === '/';
                      return (
                        <label
                          key={item.href}
                          className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => {
                              if (isRequired) return;
                              toggleMenu(role.value, item.href);
                            }}
                            disabled={isRequired}
                          />
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                              <div className="text-sm font-medium">{item.label}</div>
                              <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-muted-foreground">
                      {(localPerms[role.value] ?? []).length}/{ALL_MENU_ITEMS.length} 메뉴 선택됨
                    </span>
                    <Button onClick={() => handleSave(role.value)}>저장</Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
