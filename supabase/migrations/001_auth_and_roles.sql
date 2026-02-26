-- Profiles table (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID,
  role TEXT NOT NULL DEFAULT 'employee'
    CHECK (role IN ('admin','hr_manager','dept_manager','employee')),
  created_at TIMESTAMPTZ DEFAULT now()
);
