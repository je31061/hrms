'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuditLogStore } from '@/lib/stores/audit-log-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { AuditActionType } from '@/types';

export function useAuditLog() {
  const addLog = useAuditLogStore((s) => s.addLog);
  const session = useAuthStore((s) => s.session);
  const [clientIp, setClientIp] = useState<string | null>(null);

  // 클라이언트 IP 주소 조회 (최초 1회)
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => setClientIp(data.ip ?? null))
      .catch(() => setClientIp(null));
  }, []);

  const logAction = useCallback(
    (
      action_type: AuditActionType,
      target_type: string,
      target_id: string | null,
      target_label: string,
      details?: Record<string, unknown> | null
    ) => {
      if (!session) return;

      addLog({
        user_id: session.user_id,
        user_name: session.user_name,
        user_role: session.role,
        action_type,
        target_type,
        target_id,
        target_label,
        details: details ?? null,
        session_id: session.session_id,
        ip_address: clientIp,
      });
    },
    [addLog, session, clientIp]
  );

  return { logAction };
}
