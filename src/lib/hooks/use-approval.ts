'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Approval } from '@/types';

export function useApprovals(status?: string) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApprovals() {
      const supabase = createClient();
      let query = supabase
        .from('approvals')
        .select(`
          *,
          requester:employees!requester_id(*),
          lines:approval_lines(
            *,
            approver:employees!approver_id(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (!error && data) {
        setApprovals(data as Approval[]);
      }
      setLoading(false);
    }

    fetchApprovals();
  }, [status]);

  return { approvals, loading };
}

export function useApproval(id: string) {
  const [approval, setApproval] = useState<Approval | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApproval() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('approvals')
        .select(`
          *,
          requester:employees!requester_id(*),
          lines:approval_lines(
            *,
            approver:employees!approver_id(*)
          )
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        setApproval(data as Approval);
      }
      setLoading(false);
    }

    fetchApproval();
  }, [id]);

  return { approval, loading };
}
