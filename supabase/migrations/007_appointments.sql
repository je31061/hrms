CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  type TEXT NOT NULL
    CHECK (type IN ('promotion','transfer','title_change','hire','resignation','other')),
  effective_date DATE NOT NULL,
  prev_department_id UUID REFERENCES departments(id),
  prev_position_rank_id UUID REFERENCES position_ranks(id),
  prev_position_title_id UUID REFERENCES position_titles(id),
  new_department_id UUID REFERENCES departments(id),
  new_position_rank_id UUID REFERENCES position_ranks(id),
  new_position_title_id UUID REFERENCES position_titles(id),
  reason TEXT,
  approval_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
