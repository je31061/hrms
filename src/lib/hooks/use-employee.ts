'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Employee } from '@/types';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployees() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          department:departments(*),
          position_rank:position_ranks(*),
          position_title:position_titles(*)
        `)
        .order('employee_number');

      if (!error && data) {
        setEmployees(data as Employee[]);
      }
      setLoading(false);
    }

    fetchEmployees();
  }, []);

  return { employees, loading };
}

export function useEmployee(id: string) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployee() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          department:departments(*),
          position_rank:position_ranks(*),
          position_title:position_titles(*)
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        setEmployee(data as Employee);
      }
      setLoading(false);
    }

    fetchEmployee();
  }, [id]);

  return { employee, loading };
}
