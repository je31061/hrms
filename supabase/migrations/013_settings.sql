-- =============================================
-- 013: Settings tables for HRMS configuration
-- =============================================

-- 1. Company Settings (key-value store by category)
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value TEXT,
  description VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, key)
);

-- 2. Work Schedules (flexible work type definitions)
CREATE TABLE IF NOT EXISTS work_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('fixed', 'staggered', 'selective', 'remote', 'flexible', 'compressed')),
  start_time TIME NOT NULL DEFAULT '09:00',
  end_time TIME NOT NULL DEFAULT '18:00',
  core_start_time TIME,
  core_end_time TIME,
  break_minutes INT NOT NULL DEFAULT 60,
  weekly_hours DECIMAL(4,1) NOT NULL DEFAULT 40.0,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Employee Work Schedules (assignment history)
CREATE TABLE IF NOT EXISTS employee_work_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  work_schedule_id UUID NOT NULL REFERENCES work_schedules(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Holidays
CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('legal', 'substitute', 'company')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, name)
);

-- 5. Approval Templates
CREATE TABLE IF NOT EXISTS approval_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Evaluation Criteria
CREATE TABLE IF NOT EXISTS evaluation_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  weight DECIMAL(5,2) NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Condolence Leave Rules
CREATE TABLE IF NOT EXISTS condolence_leave_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR(100) NOT NULL,
  days INT NOT NULL,
  is_paid BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE condolence_leave_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Read access for all authenticated users
CREATE POLICY "settings_read" ON company_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "work_schedules_read" ON work_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "employee_work_schedules_read" ON employee_work_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "holidays_read" ON holidays FOR SELECT TO authenticated USING (true);
CREATE POLICY "approval_templates_read" ON approval_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "evaluation_criteria_read" ON evaluation_criteria FOR SELECT TO authenticated USING (true);
CREATE POLICY "condolence_leave_rules_read" ON condolence_leave_rules FOR SELECT TO authenticated USING (true);

-- RLS Policies: Write access for admin/hr_manager only
CREATE POLICY "settings_write" ON company_settings FOR ALL TO authenticated
  USING (get_user_role() IN ('admin', 'hr_manager'));
CREATE POLICY "work_schedules_write" ON work_schedules FOR ALL TO authenticated
  USING (get_user_role() IN ('admin', 'hr_manager'));
CREATE POLICY "employee_work_schedules_write" ON employee_work_schedules FOR ALL TO authenticated
  USING (get_user_role() IN ('admin', 'hr_manager'));
CREATE POLICY "holidays_write" ON holidays FOR ALL TO authenticated
  USING (get_user_role() IN ('admin', 'hr_manager'));
CREATE POLICY "approval_templates_write" ON approval_templates FOR ALL TO authenticated
  USING (get_user_role() IN ('admin', 'hr_manager'));
CREATE POLICY "evaluation_criteria_write" ON evaluation_criteria FOR ALL TO authenticated
  USING (get_user_role() IN ('admin', 'hr_manager'));
CREATE POLICY "condolence_leave_rules_write" ON condolence_leave_rules FOR ALL TO authenticated
  USING (get_user_role() IN ('admin', 'hr_manager'));

-- =============================================
-- Seed Data
-- =============================================

-- Default work schedule (fixed)
INSERT INTO work_schedules (name, type, start_time, end_time, break_minutes, weekly_hours, is_default, settings) VALUES
  ('기본 고정근무', 'fixed', '09:00', '18:00', 60, 40.0, TRUE, '{}'),
  ('시차출퇴근제', 'staggered', '09:00', '18:00', 60, 40.0, FALSE,
    '{"earliest_start": "07:00", "latest_start": "10:00"}'),
  ('선택적 근로시간제', 'selective', '09:00', '18:00', 60, 40.0, FALSE,
    '{"settlement_period": "1month"}');

-- 2026년 법정공휴일
INSERT INTO holidays (date, name, type) VALUES
  ('2026-01-01', '신정', 'legal'),
  ('2026-02-16', '설날 전날', 'legal'),
  ('2026-02-17', '설날', 'legal'),
  ('2026-02-18', '설날 다음날', 'legal'),
  ('2026-03-01', '삼일절', 'legal'),
  ('2026-05-05', '어린이날', 'legal'),
  ('2026-05-24', '부처님오신날', 'legal'),
  ('2026-06-06', '현충일', 'legal'),
  ('2026-08-15', '광복절', 'legal'),
  ('2026-09-24', '추석 전날', 'legal'),
  ('2026-09-25', '추석', 'legal'),
  ('2026-09-26', '추석 다음날', 'legal'),
  ('2026-10-03', '개천절', 'legal'),
  ('2026-10-09', '한글날', 'legal'),
  ('2026-12-25', '크리스마스', 'legal');

-- 경조사 휴가 규정
INSERT INTO condolence_leave_rules (event_name, days, is_paid) VALUES
  ('본인 결혼', 5, TRUE),
  ('자녀 결혼', 1, TRUE),
  ('부모 사망', 5, TRUE),
  ('배우자 사망', 5, TRUE),
  ('자녀 사망', 5, TRUE),
  ('배우자 부모 사망', 3, TRUE),
  ('조부모 사망', 3, TRUE),
  ('형제자매 사망', 3, TRUE),
  ('배우자 조부모 사망', 1, TRUE),
  ('배우자 형제자매 사망', 1, TRUE);

-- Default company settings
INSERT INTO company_settings (category, key, value, description) VALUES
  ('company', 'name', '(주)테스트컴퍼니', '회사명'),
  ('company', 'business_number', '123-45-67890', '사업자등록번호'),
  ('company', 'ceo_name', '홍길동', '대표자명'),
  ('company', 'address', '서울특별시 강남구 테헤란로 123', '주소'),
  ('company', 'industry', 'IT/소프트웨어', '업종'),
  ('work', 'default_start_time', '09:00', '기본 출근시간'),
  ('work', 'default_end_time', '18:00', '기본 퇴근시간'),
  ('work', 'lunch_break_minutes', '60', '점심시간(분)'),
  ('work', 'weekly_hours', '40', '주당 근무시간'),
  ('work', 'overtime_limit_weekly', '12', '주당 연장근로 한도(시간)'),
  ('work', 'max_weekly_hours', '52', '주 최대 근무시간'),
  ('work', 'overtime_warning_hours', '48', '초과근무 경고 기준(시간)'),
  ('work', 'enforce_52h_rule', 'true', '주 52시간제 적용'),
  ('work', 'overtime_rate', '1.5', '연장근로 수당율'),
  ('work', 'night_rate', '0.5', '야간근로 가산율'),
  ('work', 'holiday_rate', '1.5', '휴일근로 수당율'),
  ('work', 'holiday_overtime_rate', '2.0', '휴일연장 수당율'),
  ('leave', 'auto_grant_annual', 'true', '연차 자동부여'),
  ('leave', 'allow_half_day', 'true', '반차 허용'),
  ('leave', 'allow_quarter_day', 'false', '반반차 허용'),
  ('leave', 'unused_leave_policy', 'carryover', '미사용 연차 처리 (carryover/payout)'),
  ('leave', 'carryover_limit', '5', '이월 한도 일수'),
  ('payroll', 'pay_day', '25', '급여일'),
  ('payroll', 'national_pension_rate', '4.5', '국민연금 요율(%)'),
  ('payroll', 'health_insurance_rate', '3.545', '건강보험 요율(%)'),
  ('payroll', 'long_term_care_rate', '12.95', '장기요양보험 요율(%)'),
  ('payroll', 'employment_insurance_rate', '0.9', '고용보험 요율(%)'),
  ('payroll', 'meal_allowance_limit', '200000', '식대 비과세 한도'),
  ('payroll', 'transport_allowance_limit', '200000', '교통비 비과세 한도'),
  ('notification', 'approval_alert', 'true', '결재 알림'),
  ('notification', 'leave_alert', 'true', '휴가 알림'),
  ('notification', 'birthday_alert', 'true', '생일 알림'),
  ('notification', 'attendance_alert', 'true', '근태이상 알림'),
  ('notification', 'payroll_alert', 'true', '급여 알림'),
  ('security', 'session_timeout_minutes', '30', '세션 타임아웃(분)'),
  ('security', 'min_password_length', '8', '비밀번호 최소길이'),
  ('security', 'require_special_char', 'true', '특수문자 필수'),
  ('security', 'require_number', 'true', '숫자 필수'),
  ('evaluation', 'self_weight', '20', '자기평가 가중치(%)'),
  ('evaluation', 'manager_weight', '60', '상위자 평가 가중치(%)'),
  ('evaluation', 'peer_weight', '20', '동료 평가 가중치(%)'),
  ('evaluation', 'grade_s_ratio', '5', 'S등급 배분율(%)'),
  ('evaluation', 'grade_a_ratio', '20', 'A등급 배분율(%)'),
  ('evaluation', 'grade_b_ratio', '50', 'B등급 배분율(%)'),
  ('evaluation', 'grade_c_ratio', '20', 'C등급 배분율(%)'),
  ('evaluation', 'grade_d_ratio', '5', 'D등급 배분율(%)'),
  ('holiday', 'auto_substitute', 'true', '대체공휴일 자동적용');

-- Default approval templates
INSERT INTO approval_templates (name, document_type, steps) VALUES
  ('휴가 결재', 'leave', '[{"step": 1, "role": "dept_manager"}, {"step": 2, "role": "hr_manager"}]'),
  ('경비 결재', 'expense', '[{"step": 1, "role": "dept_manager"}, {"step": 2, "role": "hr_manager"}, {"step": 3, "role": "admin"}]'),
  ('인사발령 결재', 'appointment', '[{"step": 1, "role": "hr_manager"}, {"step": 2, "role": "admin"}]');

-- Default evaluation criteria
INSERT INTO evaluation_criteria (name, category, weight, description) VALUES
  ('업무 성과', 'performance', 30, '목표 달성도 및 업무 품질'),
  ('업무 역량', 'competency', 25, '직무 수행에 필요한 전문 역량'),
  ('리더십', 'leadership', 15, '팀워크 및 리더십 발휘'),
  ('태도', 'attitude', 15, '근무 태도 및 조직 적응'),
  ('자기 개발', 'development', 15, '자기 개발 및 학습 노력');
