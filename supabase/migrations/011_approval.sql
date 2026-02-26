CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  requester_id UUID NOT NULL REFERENCES employees(id),
  content JSONB,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','in_progress','approved','rejected','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE approval_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id UUID NOT NULL REFERENCES approvals(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES employees(id),
  step INT NOT NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  comment TEXT,
  acted_at TIMESTAMPTZ,
  UNIQUE(approval_id, step)
);

-- Add FK from leave_requests to approvals
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_approval_id_fkey
  FOREIGN KEY (approval_id) REFERENCES approvals(id);

-- Add FK from appointments to approvals
ALTER TABLE appointments ADD CONSTRAINT appointments_approval_id_fkey
  FOREIGN KEY (approval_id) REFERENCES approvals(id);
