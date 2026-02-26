CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('M','F')),
  address TEXT,
  address_detail TEXT,
  zip_code TEXT,
  department_id UUID REFERENCES departments(id),
  position_rank_id UUID REFERENCES position_ranks(id),
  position_title_id UUID REFERENCES position_titles(id),
  employment_type TEXT DEFAULT 'regular'
    CHECK (employment_type IN ('regular','contract','parttime','intern')),
  hire_date DATE NOT NULL,
  resignation_date DATE,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','on_leave','resigned','retired')),
  base_salary NUMERIC(12,0) DEFAULT 0,
  bank_name TEXT,
  bank_account TEXT,
  profile_image_url TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK from profiles to employees
ALTER TABLE profiles ADD CONSTRAINT profiles_employee_id_fkey
  FOREIGN KEY (employee_id) REFERENCES employees(id);

CREATE TABLE career_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT
);

CREATE TABLE education_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  major TEXT,
  degree TEXT CHECK (degree IN ('high_school','associate','bachelor','master','doctorate')),
  start_date DATE,
  end_date DATE,
  is_graduated BOOLEAN DEFAULT false
);

CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT,
  issue_date DATE,
  expiry_date DATE,
  certificate_number TEXT
);

CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relation TEXT NOT NULL,
  birth_date DATE,
  phone TEXT,
  is_dependent BOOLEAN DEFAULT false
);
