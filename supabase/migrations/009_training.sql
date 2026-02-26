CREATE TABLE training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  instructor TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  max_participants INT,
  status TEXT DEFAULT 'planned'
    CHECK (status IN ('planned','in_progress','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE training_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id UUID NOT NULL REFERENCES training_programs(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  status TEXT DEFAULT 'enrolled'
    CHECK (status IN ('enrolled','completed','cancelled','no_show')),
  score NUMERIC(5,2),
  feedback TEXT,
  completed_at TIMESTAMPTZ,
  UNIQUE(training_id, employee_id)
);
