'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore, DEMO_ACCOUNTS } from '@/lib/stores/auth-store';
import { useAuditLogStore } from '@/lib/stores/audit-log-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types';

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && url.startsWith('http') && key.length > 20);
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: '시스템관리자',
  hr_manager: '인사담당자',
  dept_manager: '부서관리자',
  employee: '일반사원',
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  hr_manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  dept_manager: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  employee: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const demoMode = !isSupabaseConfigured();

  const loginDemo = useAuthStore((s) => s.loginDemo);
  const loginDemoByRole = useAuthStore((s) => s.loginDemoByRole);
  const addLog = useAuditLogStore((s) => s.addLog);

  const recordLoginLog = (userId: string, userName: string, userRole: UserRole, sessionId: string) => {
    addLog({
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      action_type: 'login',
      target_type: '/login',
      target_id: null,
      target_label: '로그인',
      details: { method: 'demo' },
      session_id: sessionId,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (demoMode) {
      if (email && password) {
        const success = loginDemo(email, password);
        if (!success) {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.');
          setLoading(false);
          return;
        }
        const session = useAuthStore.getState().session!;
        recordLoginLog(session.user_id, session.user_name, session.role, session.session_id);
      } else {
        // Default: login as admin
        loginDemoByRole('admin');
        const session = useAuthStore.getState().session!;
        recordLoginLog(session.user_id, session.user_name, session.role, session.session_id);
      }
      router.push('/');
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    loginDemoByRole(role);
    const session = useAuthStore.getState().session!;
    recordLoginLog(session.user_id, session.user_name, session.role, session.session_id);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">HRMS</CardTitle>
            <CardDescription>인사관리시스템에 로그인하세요</CardDescription>
            {demoMode && (
              <Badge variant="secondary" className="mt-2 mx-auto">
                데모 모드 - Supabase 미연결
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={!demoMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!demoMode}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '로그인 중...' : demoMode ? '데모로 시작' : '로그인'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {demoMode && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">데모 계정 빠른 선택</CardTitle>
              <CardDescription className="text-xs">
                아래 버튼을 클릭하면 해당 역할로 바로 로그인됩니다. (비밀번호: demo1234)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <Button
                    key={account.id}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-start gap-1"
                    onClick={() => handleQuickLogin(account.role)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{account.name}</span>
                      <Badge className={`text-[10px] px-1.5 py-0 ${ROLE_COLORS[account.role]}`}>
                        {ROLE_LABELS[account.role]}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{account.department} · {account.position}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
