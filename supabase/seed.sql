-- Seed position ranks (직급)
INSERT INTO position_ranks (name, level, is_active) VALUES
  ('사원', 1, true),
  ('대리', 2, true),
  ('과장', 3, true),
  ('차장', 4, true),
  ('부장', 5, true),
  ('이사', 6, true),
  ('상무', 7, true),
  ('전무', 8, true),
  ('부사장', 9, true),
  ('사장', 10, true);

-- Seed position titles (직책)
INSERT INTO position_titles (name, level, is_active) VALUES
  ('팀원', 1, true),
  ('파트장', 2, true),
  ('팀장', 3, true),
  ('실장', 4, true),
  ('본부장', 5, true),
  ('대표이사', 6, true);

-- Seed departments
INSERT INTO departments (id, name, code, parent_id, level, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', '대표이사', 'CEO', NULL, 1, 1),
  ('00000000-0000-0000-0000-000000000002', '경영지원본부', 'MGT', '00000000-0000-0000-0000-000000000001', 2, 1),
  ('00000000-0000-0000-0000-000000000003', '개발본부', 'DEV', '00000000-0000-0000-0000-000000000001', 2, 2),
  ('00000000-0000-0000-0000-000000000004', '영업본부', 'SALES', '00000000-0000-0000-0000-000000000001', 2, 3),
  ('00000000-0000-0000-0000-000000000005', '인사팀', 'HR', '00000000-0000-0000-0000-000000000002', 3, 1),
  ('00000000-0000-0000-0000-000000000006', '재무팀', 'FIN', '00000000-0000-0000-0000-000000000002', 3, 2),
  ('00000000-0000-0000-0000-000000000007', '총무팀', 'GA', '00000000-0000-0000-0000-000000000002', 3, 3),
  ('00000000-0000-0000-0000-000000000008', '개발1팀', 'DEV1', '00000000-0000-0000-0000-000000000003', 3, 1),
  ('00000000-0000-0000-0000-000000000009', '개발2팀', 'DEV2', '00000000-0000-0000-0000-000000000003', 3, 2),
  ('00000000-0000-0000-0000-000000000010', 'QA팀', 'QA', '00000000-0000-0000-0000-000000000003', 3, 3),
  ('00000000-0000-0000-0000-000000000011', '국내영업팀', 'DS', '00000000-0000-0000-0000-000000000004', 3, 1),
  ('00000000-0000-0000-0000-000000000012', '해외영업팀', 'IS', '00000000-0000-0000-0000-000000000004', 3, 2);

-- Seed leave types
INSERT INTO leave_types (name, code, is_paid, max_days) VALUES
  ('연차', 'ANNUAL', true, 25),
  ('병가', 'SICK', true, 60),
  ('경조사휴가', 'FAMILY_EVENT', true, NULL),
  ('출산휴가', 'MATERNITY', true, 90),
  ('배우자출산휴가', 'PATERNITY', true, 10),
  ('공가', 'PUBLIC', true, NULL),
  ('무급휴가', 'UNPAID', false, NULL);

-- Seed payroll items
INSERT INTO payroll_items (name, code, category, is_taxable) VALUES
  ('기본급', 'BASE_SALARY', 'earning', true),
  ('식대', 'MEAL', 'earning', false),
  ('교통비', 'TRANSPORT', 'earning', false),
  ('연장근로수당', 'OVERTIME', 'earning', true),
  ('성과급', 'BONUS', 'earning', true),
  ('국민연금', 'NPS', 'deduction', false),
  ('건강보험', 'NHI', 'deduction', false),
  ('장기요양보험', 'LTC', 'deduction', false),
  ('고용보험', 'EI', 'deduction', false),
  ('소득세', 'INCOME_TAX', 'deduction', false),
  ('지방소득세', 'LOCAL_TAX', 'deduction', false);
