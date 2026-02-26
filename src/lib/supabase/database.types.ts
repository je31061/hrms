// This file should be auto-generated using:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/database.types.ts
//
// For now, we use the types defined in @/types/index.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          employee_id: string | null;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          employee_id?: string | null;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string | null;
          role?: string;
          created_at?: string;
        };
      };
      departments: {
        Row: {
          id: string;
          name: string;
          code: string;
          parent_id: string | null;
          level: number;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          parent_id?: string | null;
          level?: number;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          code?: string;
          parent_id?: string | null;
          level?: number;
          sort_order?: number;
          is_active?: boolean;
        };
      };
      employees: {
        Row: {
          id: string;
          employee_number: string;
          name: string;
          name_en: string | null;
          email: string;
          phone: string | null;
          birth_date: string | null;
          gender: string | null;
          address: string | null;
          address_detail: string | null;
          zip_code: string | null;
          department_id: string | null;
          position_rank_id: string | null;
          position_title_id: string | null;
          employment_type: string;
          hire_date: string;
          resignation_date: string | null;
          status: string;
          base_salary: number;
          bank_name: string | null;
          bank_account: string | null;
          profile_image_url: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          emergency_contact_relation: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          employee_number: string;
          name: string;
          email: string;
          hire_date: string;
          [key: string]: unknown;
        };
        Update: {
          [key: string]: unknown;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
      get_user_employee_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
}
