'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Network } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ALL_MENU_ITEMS } from '@/lib/constants/menu-items';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useAuthStore } from '@/lib/stores/auth-store';

export function Sidebar() {
  const pathname = usePathname();
  const session = useAuthStore((s) => s.session);
  const menuPermissions = useSettingsStore((s) => s.menuPermissions);

  const role = session?.role ?? 'employee';
  const allowedHrefs = menuPermissions?.[role] ?? ALL_MENU_ITEMS.map((m) => m.href);

  const visibleItems = ALL_MENU_ITEMS.filter((item) => allowedHrefs.includes(item.href));

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r bg-gradient-to-b from-background to-muted/30">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Network className="h-6 w-6 text-primary" />
          <span>HRMS</span>
        </Link>
      </div>
      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <nav className="space-y-1 p-3">
          {visibleItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 hover:translate-x-0.5',
                  isActive
                    ? 'bg-primary/10 text-primary border-l-2 border-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
