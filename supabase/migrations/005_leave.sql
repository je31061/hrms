CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  is_paid BOOLEAN DEFAULT true,
  max_days NUMERIC(4,1),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  year INT NOT NULL,
  total_days NUMERIC(4,1) NOT NULL,
  used_days NUMERIC(4,1) DEFAULT 0,
  remaining_days NUMERIC(4,1) GENERATED ALWAYS AS (total_days - used_days) STORED,
  UNIQUE(employee_id, leave_type_id, year)
);

CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days NUMERIC(4,1) NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','cancelled')),
  approval_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
