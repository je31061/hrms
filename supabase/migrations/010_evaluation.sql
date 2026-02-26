CREATE TABLE evaluation_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  year INT NOT NULL,
  half TEXT CHECK (half IN ('H1','H2','annual')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','in_progress','completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL REFERENCES evaluation_periods(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  evaluator_id UUID NOT NULL REFERENCES employees(id),
  type TEXT DEFAULT 'manager'
    CHECK (type IN ('self','peer','manager','subordinate')),
  scores JSONB DEFAULT '{}',
  total_score NUMERIC(5,2),
  grade TEXT,
  comment TEXT,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','confirmed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(period_id, employee_id, evaluator_id, type)
);
