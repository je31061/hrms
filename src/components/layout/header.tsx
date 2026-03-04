'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const { user, role, signOut } = useAuth();

  const roleLabels: Record<string, string> = {
    admin: '시스템관리자',
    hr_manager: '인사담당자',
    dept_manager: '부서관리자',
    employee: '일반사원',
  };

  return (
    <header className="fixed top-0 left-60 right-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-6">
      <div />
      <div className="flex items-center gap-4">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.email ?? 'user')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                    alt={user.email ?? ''}
                  />
                  <AvatarFallback className="text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {role ? roleLabels[role] : ''}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/my">
                  <User className="mr-2 h-4 w-4" />
                  내 정보
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
