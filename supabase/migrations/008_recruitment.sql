CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  position_rank_id UUID REFERENCES position_ranks(id),
  employment_type TEXT DEFAULT 'regular',
  description TEXT,
  requirements TEXT,
  headcount INT DEFAULT 1,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','open','closed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  stage TEXT DEFAULT 'applied'
    CHECK (stage IN ('applied','screening','interview','offer','hired','rejected')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES applicants(id),
  interviewer_id UUID REFERENCES employees(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  type TEXT CHECK (type IN ('phone','video','onsite')),
  result TEXT CHECK (result IN ('pass','fail','pending')),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
