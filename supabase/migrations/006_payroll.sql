CREATE TABLE payroll_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL
    CHECK (category IN ('earning','deduction')),
  is_taxable BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE payrolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  year INT NOT NULL,
  month INT NOT NULL,
  base_salary NUMERIC(12,0),
  total_earnings NUMERIC(12,0),
  total_deductions NUMERIC(12,0),
  net_pay NUMERIC(12,0),
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','confirmed','paid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, year, month)
);

CREATE TABLE payroll_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_id UUID NOT NULL REFERENCES payrolls(id) ON DELETE CASCADE,
  payroll_item_id UUID NOT NULL REFERENCES payroll_items(id),
  amount NUMERIC(12,0) NOT NULL
);
