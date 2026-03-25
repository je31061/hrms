-- =============================================
-- 014: Additional tables for full HRMS coverage
-- =============================================

-- Attendance Type Configs
CREATE TABLE IF NOT EXISTS attendance_type_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  effective_from DATE,
  effective_to DATE,
  requires_approval BOOLEAN DEFAULT false,
  requires_location BOOLEAN DEFAULT false,
  requires_purpose BOOLEAN DEFAULT false,
  counts_as_work BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Extended attendance fields
ALTER TABLE attendances ADD COLUMN IF NOT EXISTS attendance_type TEXT;
ALTER TABLE attendances ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE attendances ADD COLUMN IF NOT EXISTS purpose TEXT;
ALTER TABLE attendances ADD COLUMN IF NOT EXISTS leave_time_period TEXT CHECK (leave_time_period IN ('am_half','pm_half','am_quarter','pm_quarter'));
ALTER TABLE attendances ADD COLUMN IF NOT EXISTS scheduled_start TEXT;
ALTER TABLE attendances ADD COLUMN IF NOT EXISTS scheduled_end TEXT;
ALTER TABLE attendances DROP CONSTRAINT IF EXISTS attendances_status_check;
ALTER TABLE attendances ADD CONSTRAINT attendances_status_check CHECK (status IN ('normal','late','early_leave','absent','holiday','leave','half_day','quarter_day'));

-- Leave request time period
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS leave_time_period TEXT CHECK (leave_time_period IN ('am_half','pm_half','am_quarter','pm_quarter'));

-- Leave balance adjustments
CREATE TABLE IF NOT EXISTS leave_balance_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  year INT NOT NULL,
  adjustment_days NUMERIC(4,1) NOT NULL,
  reason TEXT NOT NULL,
  adjusted_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enhanced payroll item configs
CREATE TABLE IF NOT EXISTS payroll_item_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('earning','deduction')),
  calc_type TEXT NOT NULL DEFAULT 'fixed' CHECK (calc_type IN ('fixed','hours_rate','auto')),
  is_taxable BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  rate_multiplier NUMERIC(4,2),
  formula_description TEXT,
  default_amount NUMERIC(12,0) DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Employee payroll settings (개인별 수당/공제 with effective dates)
CREATE TABLE IF NOT EXISTS employee_payroll_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('earning','deduction')),
  amount NUMERIC(12,0) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  effective_from DATE NOT NULL,
  effective_to DATE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enhanced payroll details
ALTER TABLE payroll_details ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE payroll_details ADD COLUMN IF NOT EXISTS is_taxable BOOLEAN DEFAULT true;
ALTER TABLE payroll_details ADD COLUMN IF NOT EXISTS formula TEXT;

-- Payrolls dependents
ALTER TABLE payrolls ADD COLUMN IF NOT EXISTS dependents INT DEFAULT 1;

-- HR Issues
CREATE TABLE IF NOT EXISTS hr_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('grievance','safety','policy_violation','payroll_dispute','harassment','other')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','under_review','resolved','closed')),
  reporter_id UUID REFERENCES employees(id),
  assignee_id UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Workflow system
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('onboarding','offboarding','promotion','transfer','custom')),
  tasks JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES workflow_templates(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  type TEXT NOT NULL CHECK (type IN ('onboarding','offboarding','promotion','transfer','custom')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflow_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_role TEXT,
  assignee_id UUID REFERENCES employees(id),
  due_days INT,
  sort_order INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','skipped')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Code management
CREATE TABLE IF NOT EXISTS code_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS code_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES code_groups(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, code)
);

-- Change History
CREATE TABLE IF NOT EXISTS change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_label TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create','update','delete')),
  changes JSONB NOT NULL DEFAULT '[]',
  changed_by TEXT NOT NULL,
  changed_by_name TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_change_history_entity ON change_history(entity_type, entity_id);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT now(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  target_label TEXT NOT NULL,
  details JSONB,
  session_id TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON audit_logs(timestamp DESC);

-- Menu Permissions
CREATE TABLE IF NOT EXISTS menu_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL UNIQUE CHECK (role IN ('admin','hr_manager','dept_manager','employee')),
  allowed_paths JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization effective dates
ALTER TABLE departments ADD COLUMN IF NOT EXISTS effective_from DATE;
ALTER TABLE departments ADD COLUMN IF NOT EXISTS effective_to DATE;
ALTER TABLE position_ranks ADD COLUMN IF NOT EXISTS effective_from DATE;
ALTER TABLE position_ranks ADD COLUMN IF NOT EXISTS effective_to DATE;
ALTER TABLE position_ranks ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE position_ranks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE position_titles ADD COLUMN IF NOT EXISTS effective_from DATE;
ALTER TABLE position_titles ADD COLUMN IF NOT EXISTS effective_to DATE;
ALTER TABLE position_titles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE position_titles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Job Categories & Salary Grades
CREATE TABLE IF NOT EXISTS job_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS salary_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rank_id UUID REFERENCES position_ranks(id),
  step INT NOT NULL,
  base_amount NUMERIC(12,0) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Work schedule effective dates
ALTER TABLE work_schedules ADD COLUMN IF NOT EXISTS effective_from DATE;
ALTER TABLE work_schedules ADD COLUMN IF NOT EXISTS effective_to DATE;
