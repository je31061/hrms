-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE position_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE position_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_lines ENABLE ROW LEVEL SECURITY;

-- Helper function: get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get user employee_id
CREATE OR REPLACE FUNCTION get_user_employee_id()
RETURNS UUID AS $$
  SELECT employee_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: users can read own, admins can read all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (get_user_role() IN ('admin','hr_manager'));
CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE USING (get_user_role() IN ('admin'));

-- Departments: everyone can read
CREATE POLICY "Everyone can view departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Admins can manage departments" ON departments FOR ALL USING (get_user_role() IN ('admin','hr_manager'));

-- Position ranks/titles: everyone can read
CREATE POLICY "Everyone can view position_ranks" ON position_ranks FOR SELECT USING (true);
CREATE POLICY "Admins can manage position_ranks" ON position_ranks FOR ALL USING (get_user_role() IN ('admin'));
CREATE POLICY "Everyone can view position_titles" ON position_titles FOR SELECT USING (true);
CREATE POLICY "Admins can manage position_titles" ON position_titles FOR ALL USING (get_user_role() IN ('admin'));

-- Employees: own data or HR/admin
CREATE POLICY "Users can view own employee data" ON employees FOR SELECT USING (id = get_user_employee_id());
CREATE POLICY "HR can view all employees" ON employees FOR SELECT USING (get_user_role() IN ('admin','hr_manager','dept_manager'));
CREATE POLICY "HR can manage employees" ON employees FOR ALL USING (get_user_role() IN ('admin','hr_manager'));

-- Attendance: own or HR
CREATE POLICY "Users can view own attendance" ON attendances FOR SELECT USING (employee_id = get_user_employee_id());
CREATE POLICY "Users can insert own attendance" ON attendances FOR INSERT WITH CHECK (employee_id = get_user_employee_id());
CREATE POLICY "HR can manage attendance" ON attendances FOR ALL USING (get_user_role() IN ('admin','hr_manager'));

-- Leave: own or HR
CREATE POLICY "Users can view own leave requests" ON leave_requests FOR SELECT USING (employee_id = get_user_employee_id());
CREATE POLICY "Users can create leave requests" ON leave_requests FOR INSERT WITH CHECK (employee_id = get_user_employee_id());
CREATE POLICY "HR can manage leave requests" ON leave_requests FOR ALL USING (get_user_role() IN ('admin','hr_manager'));
CREATE POLICY "Everyone can view leave types" ON leave_types FOR SELECT USING (true);
CREATE POLICY "Users can view own leave balances" ON leave_balances FOR SELECT USING (employee_id = get_user_employee_id());
CREATE POLICY "HR can manage leave balances" ON leave_balances FOR ALL USING (get_user_role() IN ('admin','hr_manager'));

-- Payroll: own or HR
CREATE POLICY "Users can view own payroll" ON payrolls FOR SELECT USING (employee_id = get_user_employee_id());
CREATE POLICY "HR can manage payrolls" ON payrolls FOR ALL USING (get_user_role() IN ('admin','hr_manager'));
CREATE POLICY "Everyone can view payroll_items" ON payroll_items FOR SELECT USING (true);
CREATE POLICY "HR can manage payroll_items" ON payroll_items FOR ALL USING (get_user_role() IN ('admin','hr_manager'));
CREATE POLICY "Users can view own payroll details" ON payroll_details FOR SELECT USING (
  EXISTS (SELECT 1 FROM payrolls WHERE payrolls.id = payroll_details.payroll_id AND payrolls.employee_id = get_user_employee_id())
);
CREATE POLICY "HR can manage payroll_details" ON payroll_details FOR ALL USING (get_user_role() IN ('admin','hr_manager'));

-- Approvals: requester or approver
CREATE POLICY "Users can view own approvals" ON approvals FOR SELECT USING (requester_id = get_user_employee_id());
CREATE POLICY "Approvers can view approvals" ON approvals FOR SELECT USING (
  EXISTS (SELECT 1 FROM approval_lines WHERE approval_lines.approval_id = approvals.id AND approval_lines.approver_id = get_user_employee_id())
);
CREATE POLICY "Users can create approvals" ON approvals FOR INSERT WITH CHECK (requester_id = get_user_employee_id());
CREATE POLICY "HR can manage approvals" ON approvals FOR ALL USING (get_user_role() IN ('admin','hr_manager'));
CREATE POLICY "Approvers can view lines" ON approval_lines FOR SELECT USING (true);
CREATE POLICY "Approvers can update own lines" ON approval_lines FOR UPDATE USING (approver_id = get_user_employee_id());

-- Recruitment: HR can manage, everyone can view open postings
CREATE POLICY "Everyone can view open job postings" ON job_postings FOR SELECT USING (status = 'open' OR get_user_role() IN ('admin','hr_manager'));
CREATE POLICY "HR can manage job_postings" ON job_postings FOR ALL USING (get_user_role() IN ('admin','hr_manager'));
CREATE POLICY "HR can manage applicants" ON applicants FOR ALL USING (get_user_role() IN ('admin','hr_manager'));
CREATE POLICY "HR can manage interviews" ON interviews FOR ALL USING (get_user_role() IN ('admin','hr_manager'));

-- Training: everyone can view, HR manages
CREATE POLICY "Everyone can view training programs" ON training_programs FOR SELECT USING (true);
CREATE POLICY "HR can manage training" ON training_programs FOR ALL USING (get_user_role() IN ('admin','hr_manager'));
CREATE POLICY "Users can view own enrollments" ON training_enrollments FOR SELECT USING (employee_id = get_user_employee_id());
CREATE POLICY "HR can manage enrollments" ON training_enrollments FOR ALL USING (get_user_role() IN ('admin','hr_manager'));

-- Evaluation
CREATE POLICY "Users can view own evaluations" ON evaluations FOR SELECT USING (employee_id = get_user_employee_id() OR evaluator_id = get_user_employee_id());
CREATE POLICY "HR can manage evaluations" ON evaluations FOR ALL USING (get_user_role() IN ('admin','hr_manager'));
CREATE POLICY "Everyone can view evaluation periods" ON evaluation_periods FOR SELECT USING (true);
CREATE POLICY "HR can manage evaluation periods" ON evaluation_periods FOR ALL USING (get_user_role() IN ('admin','hr_manager'));

-- Appointments
CREATE POLICY "Users can view own appointments" ON appointments FOR SELECT USING (employee_id = get_user_employee_id());
CREATE POLICY "HR can manage appointments" ON appointments FOR ALL USING (get_user_role() IN ('admin','hr_manager'));

-- Sub-tables for employees
CREATE POLICY "Users can view own career" ON career_histories FOR SELECT USING (employee_id = get_user_employee_id());
CREATE POLICY "HR can manage career" ON career_histories FOR ALL USING (get_user_role() IN ('admin','hr_manager'));
CREATE POLICY "Users can view own education" ON education_histories FOR SELECT USING (employee_id = get_user_employee_id());
CREATE POLICY "HR can manage education" ON education_histories FOR ALL USING (get_user_role() IN ('admin','hr_manager'));
CREATE POLICY "Users can view own certs" ON certifications FOR SELECT USING (employee_id = get_user_employee_id());
CREATE POLICY "HR can manage certs" ON certifications FOR ALL USING (get_user_role() IN ('admin','hr_manager'));
CREATE POLICY "Users can view own family" ON family_members FOR SELECT USING (employee_id = get_user_employee_id());
CREATE POLICY "HR can manage family" ON family_members FOR ALL USING (get_user_role() IN ('admin','hr_manager'));
