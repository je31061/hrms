'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthSession, DemoAccount, UserRole } from '@/types';

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo-admin',
    email: 'admin@demo.com',
    name: '김관리',
    role: 'admin',
    employee_id: 'e010',
    department: '경영지원팀',
    position: '팀장',
    password: 'demo1234',
  },
  {
    id: 'demo-hr',
    email: 'hr@demo.com',
    name: '이인사',
    role: 'hr_manager',
    employee_id: 'e011',
    department: '인사팀',
    position: '과장',
    password: 'demo1234',
  },
  {
    id: 'demo-manager',
    email: 'manager@demo.com',
    name: '박부장',
    role: 'dept_manager',
    employee_id: 'e020',
    department: '개발팀',
    position: '부장',
    password: 'demo1234',
  },
  {
    id: 'demo-employee',
    email: 'employee@demo.com',
    name: '정사원',
    role: 'employee',
    employee_id: 'e022',
    department: '개발팀',
    position: '사원',
    password: 'demo1234',
  },
];

interface AuthState {
  session: AuthSession | null;
  loginDemo: (email: string, password: string) => boolean;
  loginDemoByRole: (role: UserRole) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,

      loginDemo: (email: string, password: string) => {
        const account = DEMO_ACCOUNTS.find(
          (a) => a.email === email && a.password === password
        );
        if (!account) return false;

        set({
          session: {
            account_id: account.id,
            user_id: account.id,
            user_name: account.name,
            user_email: account.email,
            role: account.role,
            employee_id: account.employee_id,
            session_id: crypto.randomUUID(),
            logged_in_at: new Date().toISOString(),
            is_demo: true,
          },
        });
        return true;
      },

      loginDemoByRole: (role: UserRole) => {
        const account = DEMO_ACCOUNTS.find((a) => a.role === role)!;
        set({
          session: {
            account_id: account.id,
            user_id: account.id,
            user_name: account.name,
            user_email: account.email,
            role: account.role,
            employee_id: account.employee_id,
            session_id: crypto.randomUUID(),
            logged_in_at: new Date().toISOString(),
            is_demo: true,
          },
        });
      },

      clearSession: () => {
        set({ session: null });
      },
    }),
    { name: 'hrms-auth' }
  )
);
