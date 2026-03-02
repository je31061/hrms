'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useSettingsStore } from '@/lib/stores/settings-store';

const PUBLIC_PATHS = ['/login'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAuthStore((s) => s.session);
  const menuPermissions = useSettingsStore((s) => s.menuPermissions);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const isPublic = PUBLIC_PATHS.includes(pathname);

    if (!session && !isPublic) {
      router.replace('/login');
    } else if (session && isPublic) {
      router.replace('/');
    } else if (session && !isPublic && menuPermissions) {
      // Check menu permissions - find the base path
      const role = session.role;
      const allowed = menuPermissions[role] ?? [];
      const basePath = '/' + (pathname.split('/')[1] ?? '');
      const effectivePath = basePath === '/' ? '/' : basePath;

      if (!allowed.includes(effectivePath) && effectivePath !== '/') {
        router.replace('/');
      }
    }
  }, [hydrated, session, pathname, router, menuPermissions]);

  if (!hydrated) return null;

  const isPublic = PUBLIC_PATHS.includes(pathname);
  if (!session && !isPublic) return null;

  return <>{children}</>;
}
