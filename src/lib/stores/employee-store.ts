'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Department,
  PositionRank,
  PositionTitle,
  Employee,
  CareerHistory,
  EducationHistory,
  Certification,
  FamilyMember,
  EmploymentType,
  EmployeeStatus,
  JobCategory,
  SalaryGrade,
} from '@/types';

// ---------------------------------------------------------------------------
// Seed data — Panasia
// ---------------------------------------------------------------------------

const seedDepartments: Department[] = [
  { id: 'dept-01', name: '대표이사실', code: 'CEO', parent_id: null, level: 1, sort_order: 1, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-02', name: '경영지원본부', code: 'MGT', parent_id: null, level: 1, sort_order: 2, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-03', name: '영업본부', code: 'SALES', parent_id: null, level: 1, sort_order: 3, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-04', name: '기술연구소', code: 'RND', parent_id: null, level: 1, sort_order: 4, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-05', name: '스크러버사업부', code: 'SCR', parent_id: null, level: 1, sort_order: 5, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-06', name: 'BWTS사업부', code: 'BWTS', parent_id: null, level: 1, sort_order: 6, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-07', name: '연료공급사업부', code: 'FUEL', parent_id: null, level: 1, sort_order: 7, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-08', name: '계측제어사업부', code: 'IC', parent_id: null, level: 1, sort_order: 8, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-09', name: '생산본부', code: 'PROD', parent_id: null, level: 1, sort_order: 9, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-10', name: '품질관리팀', code: 'QC', parent_id: null, level: 1, sort_order: 10, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-11', name: '조달구매본부', code: 'PURCH', parent_id: null, level: 1, sort_order: 11, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-12', name: '스마트서비스본부', code: 'SMART', parent_id: null, level: 1, sort_order: 12, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-13', name: 'HSE실', code: 'HSE', parent_id: null, level: 1, sort_order: 13, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  // Sub-departments under 경영지원본부
  { id: 'dept-14', name: '인사팀', code: 'HR', parent_id: 'dept-02', level: 2, sort_order: 1, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-15', name: '재무회계팀', code: 'FIN', parent_id: 'dept-02', level: 2, sort_order: 2, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-16', name: '총무팀', code: 'GA', parent_id: 'dept-02', level: 2, sort_order: 3, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  // Sub-departments under 영업본부
  { id: 'dept-17', name: '국내영업팀', code: 'DOM', parent_id: 'dept-03', level: 2, sort_order: 1, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-18', name: '해외영업팀', code: 'INTL', parent_id: 'dept-03', level: 2, sort_order: 2, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  // Sub-department under 기술연구소
  { id: 'dept-19', name: '연구개발팀', code: 'RD', parent_id: 'dept-04', level: 2, sort_order: 1, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  // Sub-departments under 생산본부
  { id: 'dept-20', name: '생산1팀', code: 'PROD1', parent_id: 'dept-09', level: 2, sort_order: 1, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-21', name: '생산2팀', code: 'PROD2', parent_id: 'dept-09', level: 2, sort_order: 2, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  // Sub-departments under HSE실
  { id: 'dept-22', name: '안전팀', code: 'SAFE', parent_id: 'dept-13', level: 2, sort_order: 1, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-23', name: '공무팀', code: 'MAINT', parent_id: 'dept-13', level: 2, sort_order: 2, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
];

const seedPositionRanks: PositionRank[] = [
  { id: 'rank-1', name: '사원', level: 1, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'rank-2', name: '대리', level: 2, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'rank-3', name: '과장', level: 3, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'rank-4', name: '차장', level: 4, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'rank-5', name: '부장', level: 5, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'rank-6', name: '이사', level: 6, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'rank-7', name: '대표이사', level: 7, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'rank-8', name: '회장', level: 8, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
];

const seedPositionTitles: PositionTitle[] = [
  { id: 'title-1', name: '팀원', level: 1, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'title-2', name: '파트장', level: 2, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'title-3', name: '팀장', level: 3, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'title-4', name: '실장', level: 4, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'title-5', name: '본부장', level: 5, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'title-6', name: '소장', level: 6, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'title-7', name: '대표이사', level: 7, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'title-8', name: '회장', level: 8, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
];

const seedJobCategories: JobCategory[] = [
  { id: 'jc-1', name: '기술직', code: 'TECH', description: '기술 관련 직무', sort_order: 1, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'jc-2', name: '사무직', code: 'OFFICE', description: '사무 관련 직무', sort_order: 2, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'jc-3', name: '생산직', code: 'MANUF', description: '생산 관련 직무', sort_order: 3, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'jc-4', name: '영업직', code: 'SALES', description: '영업 관련 직무', sort_order: 4, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'jc-5', name: '연구직', code: 'RESEARCH', description: '연구 관련 직무', sort_order: 5, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
];

const seedSalaryGrades: SalaryGrade[] = [
  // 사원 (rank-1)
  { id: 'sg-01', rank_id: 'rank-1', step: 1, base_amount: 2800000, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'sg-02', rank_id: 'rank-1', step: 2, base_amount: 2900000, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'sg-03', rank_id: 'rank-1', step: 3, base_amount: 3000000, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  // 대리 (rank-2)
  { id: 'sg-04', rank_id: 'rank-2', step: 1, base_amount: 3500000, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'sg-05', rank_id: 'rank-2', step: 2, base_amount: 3600000, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'sg-06', rank_id: 'rank-2', step: 3, base_amount: 3700000, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  // 과장 (rank-3)
  { id: 'sg-07', rank_id: 'rank-3', step: 1, base_amount: 4200000, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'sg-08', rank_id: 'rank-3', step: 2, base_amount: 4400000, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'sg-09', rank_id: 'rank-3', step: 3, base_amount: 4600000, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  // 차장 (rank-4)
  { id: 'sg-10', rank_id: 'rank-4', step: 1, base_amount: 5000000, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'sg-11', rank_id: 'rank-4', step: 2, base_amount: 5300000, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  // 부장 (rank-5)
  { id: 'sg-12', rank_id: 'rank-5', step: 1, base_amount: 6000000, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'sg-13', rank_id: 'rank-5', step: 2, base_amount: 6500000, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  // 이사 (rank-6)
  { id: 'sg-14', rank_id: 'rank-6', step: 1, base_amount: 8000000, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'sg-15', rank_id: 'rank-6', step: 2, base_amount: 9000000, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  // 대표이사 (rank-7)
  { id: 'sg-16', rank_id: 'rank-7', step: 1, base_amount: 12000000, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
  // 회장 (rank-8)
  { id: 'sg-17', rank_id: 'rank-8', step: 1, base_amount: 15000000, is_active: true, effective_from: null, effective_to: null, created_at: '2020-01-01', updated_at: '2020-01-01' },
];

// Helper to build employee
function emp(
  id: string, num: string, name: string, deptId: string, rankId: string, titleId: string,
  empType: EmploymentType, salary: number, extra?: Partial<Employee>,
): Employee {
  const idNum = id.replace(/^e0*/, '').padStart(4, '0');
  return {
    id, employee_number: num, name, name_en: null,
    email: `${id}@panasia.co.kr`, phone: `010-0000-${idNum}`,
    birth_date: null, gender: null, address: null, address_detail: null, zip_code: null,
    department_id: deptId, position_rank_id: rankId, position_title_id: titleId,
    employment_type: empType, hire_date: '2020-01-01', resignation_date: null,
    status: 'active', base_salary: salary,
    bank_name: '국민은행', bank_account: `***-****-${idNum}`,
    profile_image_url: null,
    emergency_contact_name: null, emergency_contact_phone: null, emergency_contact_relation: null,
    workplace_id: null,
    created_at: '2020-01-01', updated_at: '2020-01-01',
    ...extra,
  };
}

const seedEmployees: Employee[] = [
  // ── 대표이사실 (3) ──
  emp('e001', 'EMP-001', '이수태', 'dept-01', 'rank-8', 'title-8', 'regular', 15000000, { hire_date: '2005-03-02', birth_date: '1958-05-12', gender: 'M', address: '부산광역시 강서구 녹산산단335로 7', zip_code: '46757' }),
  emp('e002', 'EMP-002', '이민걸', 'dept-01', 'rank-7', 'title-7', 'regular', 12000000, { hire_date: '2008-01-02', birth_date: '1965-11-03', gender: 'M', address: '부산광역시 강서구 녹산산단335로 7', zip_code: '46757' }),
  emp('e003', 'EMP-003', '정진택', 'dept-01', 'rank-7', 'title-7', 'regular', 12000000, { hire_date: '2010-03-01', birth_date: '1967-08-22', gender: 'M', address: '부산광역시 해운대구 센텀중앙로 48', zip_code: '48058' }),
  // ── 경영지원본부 (1) ──
  emp('e004', 'EMP-004', '김영수', 'dept-02', 'rank-6', 'title-5', 'regular', 9000000, { hire_date: '2012-02-01', birth_date: '1970-04-15', gender: 'M', address: '김해시 주촌면 골든루트로 80', zip_code: '50969' }),
  // ── 인사팀 (5) ──
  emp('e010', 'EMP-010', '박지현', 'dept-14', 'rank-3', 'title-3', 'regular', 5000000, { hire_date: '2017-03-02', birth_date: '1985-02-28', gender: 'F', address: '부산광역시 사상구 학감대로 272', zip_code: '46967' }),
  emp('e011', 'EMP-011', '임서연', 'dept-14', 'rank-2', 'title-1', 'regular', 3800000, { hire_date: '2019-07-01', birth_date: '1992-09-14', gender: 'F', address: '부산광역시 북구 금곡대로 236', zip_code: '46519' }),
  emp('e012', 'EMP-012', '조현우', 'dept-14', 'rank-1', 'title-1', 'regular', 3200000, { hire_date: '2022-03-02', birth_date: '1997-12-05', gender: 'M', address: '김해시 내외동 능동로 27', zip_code: '50834' }),
  emp('e032', 'EMP-032', '최은비', 'dept-14', 'rank-2', 'title-1', 'regular', 3700000, { hire_date: '2020-09-01', birth_date: '1993-06-20', gender: 'F', address: '부산광역시 사상구 가야대로 198', zip_code: '46971' }),
  emp('e033', 'EMP-033', '한동훈', 'dept-14', 'rank-1', 'title-1', 'regular', 3000000, { hire_date: '2024-01-02', birth_date: '1999-03-11', gender: 'M', address: '김해시 진영읍 진영로 87', zip_code: '50885' }),
  // ── 재무회계팀 (4) ──
  emp('e013', 'EMP-013', '장미경', 'dept-15', 'rank-3', 'title-3', 'regular', 5000000, { hire_date: '2016-01-04', birth_date: '1983-07-19', gender: 'F', address: '부산광역시 강서구 명지오션시티 5로 23', zip_code: '46726' }),
  emp('e014', 'EMP-014', '유승호', 'dept-15', 'rank-2', 'title-1', 'regular', 3800000, { hire_date: '2019-03-04', birth_date: '1991-01-30', gender: 'M', address: '부산광역시 사하구 낙동대로 208', zip_code: '49321' }),
  emp('e034', 'EMP-034', '이소라', 'dept-15', 'rank-2', 'title-1', 'regular', 3600000, { hire_date: '2021-02-01', birth_date: '1994-10-08', gender: 'F', address: '부산광역시 서구 구덕로 225', zip_code: '49243' }),
  emp('e035', 'EMP-035', '김태현', 'dept-15', 'rank-1', 'title-1', 'regular', 3000000, { hire_date: '2023-09-01', birth_date: '1998-04-17', gender: 'M', address: '김해시 장유로 158', zip_code: '50901' }),
  // ── 총무팀 (3) ──
  emp('e015', 'EMP-015', '오세진', 'dept-16', 'rank-3', 'title-3', 'regular', 5000000, { hire_date: '2015-06-01', birth_date: '1982-11-09', gender: 'M', address: '부산광역시 강서구 낙동북로 49', zip_code: '46701' }),
  emp('e036', 'EMP-036', '나현정', 'dept-16', 'rank-2', 'title-1', 'regular', 3500000, { hire_date: '2021-06-01', birth_date: '1995-01-25', gender: 'F', address: '부산광역시 북구 화명대로 3', zip_code: '46504' }),
  emp('e037', 'EMP-037', '류진우', 'dept-16', 'rank-1', 'title-1', 'regular', 2900000, { hire_date: '2024-03-04', birth_date: '2000-07-14', gender: 'M', address: '김해시 삼계로 59', zip_code: '50948' }),
  // ── 영업본부 (1) ──
  emp('e016', 'EMP-016', '강태호', 'dept-03', 'rank-6', 'title-5', 'regular', 9000000, { hire_date: '2011-04-01', birth_date: '1971-06-30', gender: 'M', address: '부산광역시 해운대구 마린시티2로 28', zip_code: '48092' }),
  // ── 국내영업팀 (5) ──
  emp('e017', 'EMP-017', '윤재석', 'dept-17', 'rank-4', 'title-3', 'regular', 6000000, { hire_date: '2014-05-01', birth_date: '1980-03-05', gender: 'M', address: '부산광역시 남구 수영로 295', zip_code: '48463' }),
  emp('e018', 'EMP-018', '배수민', 'dept-17', 'rank-2', 'title-1', 'regular', 3800000, { hire_date: '2019-09-02', birth_date: '1993-08-17', gender: 'M', address: '부산광역시 동래구 명륜로 57', zip_code: '47804' }),
  emp('e038', 'EMP-038', '정유리', 'dept-17', 'rank-2', 'title-1', 'regular', 3700000, { hire_date: '2020-03-02', birth_date: '1994-05-22', gender: 'F', address: '부산광역시 연제구 법원로 10', zip_code: '47535' }),
  emp('e039', 'EMP-039', '김동현', 'dept-17', 'rank-1', 'title-1', 'regular', 3100000, { hire_date: '2023-01-02', birth_date: '1997-11-03', gender: 'M', address: '김해시 주촌면 서부로 1610', zip_code: '50972' }),
  emp('e040', 'EMP-040', '송지아', 'dept-17', 'rank-1', 'title-1', 'contract', 3000000, { hire_date: '2025-03-03', birth_date: '2000-02-18', gender: 'F', address: '부산광역시 사상구 백양대로 123', zip_code: '46949' }),
  // ── 해외영업팀 (6) ──
  emp('e019', 'EMP-019', '노형진', 'dept-18', 'rank-3', 'title-3', 'regular', 5000000, { hire_date: '2016-07-01', birth_date: '1984-12-01', gender: 'M', address: '부산광역시 해운대구 APEC로 17', zip_code: '48060', name_en: 'Hyungjin Noh' }),
  emp('e020', 'EMP-020', '하정민', 'dept-18', 'rank-1', 'title-1', 'regular', 3200000, { hire_date: '2022-07-01', birth_date: '1998-06-09', gender: 'F', address: '부산광역시 수영구 광안해변로 255', zip_code: '48304', name_en: 'Jungmin Ha' }),
  emp('e041', 'EMP-041', '이준영', 'dept-18', 'rank-3', 'title-2', 'regular', 4800000, { hire_date: '2017-01-02', birth_date: '1986-09-27', gender: 'M', address: '부산광역시 남구 용호로 90', zip_code: '48472', name_en: 'Junyoung Lee' }),
  emp('e042', 'EMP-042', '박소영', 'dept-18', 'rank-2', 'title-1', 'regular', 3700000, { hire_date: '2020-01-02', birth_date: '1993-03-15', gender: 'F', address: '김해시 내외동 금관대로 1484', zip_code: '50832', name_en: 'Soyoung Park' }),
  emp('e043', 'EMP-043', '알렉스 킴', 'dept-18', 'rank-2', 'title-1', 'regular', 3800000, { hire_date: '2021-04-01', birth_date: '1991-07-20', gender: 'M', address: '부산광역시 해운대구 달맞이길 30', zip_code: '48099', name_en: 'Alex Kim' }),
  emp('e044', 'EMP-044', '김하은', 'dept-18', 'rank-1', 'title-1', 'regular', 3100000, { hire_date: '2024-07-01', birth_date: '1999-08-05', gender: 'F', address: '부산광역시 금정구 부산대학로 63', zip_code: '46241', name_en: 'Haeun Kim' }),
  // ── 기술연구소 (1) ──
  emp('e021', 'EMP-021', '송기원', 'dept-04', 'rank-6', 'title-6', 'regular', 9000000, { hire_date: '2010-06-01', birth_date: '1972-02-14', gender: 'M', address: '부산광역시 강서구 녹산산단335로 7', zip_code: '46757' }),
  // ── 연구개발팀 (8) ──
  emp('e022', 'EMP-022', '문성호', 'dept-19', 'rank-4', 'title-3', 'regular', 6000000, { hire_date: '2014-09-01', birth_date: '1981-10-30', gender: 'M', address: '부산광역시 강서구 명지국제6로 25', zip_code: '46726' }),
  emp('e023', 'EMP-023', '신동혁', 'dept-19', 'rank-2', 'title-1', 'regular', 3800000, { hire_date: '2019-01-02', birth_date: '1992-04-18', gender: 'M', address: '김해시 장유로 238', zip_code: '50906' }),
  emp('e045', 'EMP-045', '이재훈', 'dept-19', 'rank-3', 'title-2', 'regular', 4600000, { hire_date: '2016-03-02', birth_date: '1986-01-07', gender: 'M', address: '부산광역시 사상구 모라로 51', zip_code: '46996' }),
  emp('e046', 'EMP-046', '김민지', 'dept-19', 'rank-2', 'title-1', 'regular', 3700000, { hire_date: '2020-07-01', birth_date: '1994-08-11', gender: 'F', address: '부산광역시 북구 만덕대로 61', zip_code: '46540' }),
  emp('e047', 'EMP-047', '최영진', 'dept-19', 'rank-2', 'title-1', 'regular', 3600000, { hire_date: '2021-01-04', birth_date: '1995-05-29', gender: 'M', address: '김해시 내외동 능동로 15', zip_code: '50834' }),
  emp('e048', 'EMP-048', '윤서현', 'dept-19', 'rank-1', 'title-1', 'regular', 3100000, { hire_date: '2023-03-02', birth_date: '1998-12-20', gender: 'F', address: '부산광역시 사하구 다대로 678', zip_code: '49497' }),
  emp('e049', 'EMP-049', '박준서', 'dept-19', 'rank-1', 'title-1', 'regular', 2900000, { hire_date: '2024-09-02', birth_date: '2000-03-03', gender: 'M', address: '부산광역시 강서구 대저1동 133', zip_code: '46706' }),
  emp('e050', 'EMP-050', '정다은', 'dept-19', 'rank-1', 'title-1', 'intern', 2800000, { hire_date: '2025-09-01', birth_date: '2001-06-15', gender: 'F', address: '부산광역시 금정구 중앙대로 1815', zip_code: '46272' }),
  // ── 스크러버사업부 (8) ──
  emp('e024', 'EMP-024', '권혁준', 'dept-05', 'rank-5', 'title-5', 'regular', 7000000, { hire_date: '2013-02-01', birth_date: '1976-09-08', gender: 'M', address: '부산광역시 강서구 녹산산단335로 7', zip_code: '46757' }),
  emp('e051', 'EMP-051', '이상훈', 'dept-05', 'rank-4', 'title-3', 'regular', 5500000, { hire_date: '2015-03-02', birth_date: '1979-04-22', gender: 'M', address: '김해시 주촌면 골든루트로 60', zip_code: '50969' }),
  emp('e052', 'EMP-052', '장세진', 'dept-05', 'rank-3', 'title-2', 'regular', 4500000, { hire_date: '2017-09-01', birth_date: '1985-07-13', gender: 'M', address: '부산광역시 사상구 학감대로 158', zip_code: '46985' }),
  emp('e053', 'EMP-053', '김광호', 'dept-05', 'rank-2', 'title-1', 'regular', 3700000, { hire_date: '2020-03-02', birth_date: '1992-11-28', gender: 'M', address: '부산광역시 북구 덕천동 362', zip_code: '46525' }),
  emp('e054', 'EMP-054', '오진수', 'dept-05', 'rank-2', 'title-1', 'regular', 3600000, { hire_date: '2021-07-01', birth_date: '1993-02-10', gender: 'M', address: '김해시 진영읍 진영로 215', zip_code: '50887' }),
  emp('e055', 'EMP-055', '한미래', 'dept-05', 'rank-1', 'title-1', 'regular', 3100000, { hire_date: '2023-07-03', birth_date: '1998-10-05', gender: 'F', address: '부산광역시 사하구 하단동 632', zip_code: '49378' }),
  emp('e056', 'EMP-056', '백승우', 'dept-05', 'rank-1', 'title-1', 'regular', 2900000, { hire_date: '2024-03-04', birth_date: '1999-06-18', gender: 'M', address: '부산광역시 강서구 대저로 26', zip_code: '46705' }),
  // ── BWTS사업부 (7) ──
  emp('e025', 'EMP-025', '황인성', 'dept-06', 'rank-5', 'title-5', 'regular', 7000000, { hire_date: '2013-06-03', birth_date: '1977-03-25', gender: 'M', address: '부산광역시 강서구 녹산산단335로 7', zip_code: '46757' }),
  emp('e057', 'EMP-057', '조민우', 'dept-06', 'rank-3', 'title-3', 'regular', 4800000, { hire_date: '2016-09-01', birth_date: '1984-05-14', gender: 'M', address: '김해시 장유2동 장유로 256', zip_code: '50907' }),
  emp('e058', 'EMP-058', '강수빈', 'dept-06', 'rank-3', 'title-2', 'regular', 4400000, { hire_date: '2018-01-02', birth_date: '1987-08-30', gender: 'F', address: '부산광역시 사상구 백양대로 39', zip_code: '46943' }),
  emp('e059', 'EMP-059', '임지호', 'dept-06', 'rank-2', 'title-1', 'regular', 3700000, { hire_date: '2020-09-01', birth_date: '1994-12-22', gender: 'M', address: '부산광역시 북구 화명동 2290', zip_code: '46507' }),
  emp('e060', 'EMP-060', '서예린', 'dept-06', 'rank-2', 'title-1', 'regular', 3500000, { hire_date: '2022-01-03', birth_date: '1996-03-07', gender: 'F', address: '김해시 삼계로 118', zip_code: '50951' }),
  emp('e061', 'EMP-061', '양현우', 'dept-06', 'rank-1', 'title-1', 'regular', 3100000, { hire_date: '2023-09-01', birth_date: '1999-01-19', gender: 'M', address: '부산광역시 강서구 명지오션시티 3로 10', zip_code: '46725' }),
  emp('e062', 'EMP-062', '문지영', 'dept-06', 'rank-1', 'title-1', 'contract', 2900000, { hire_date: '2025-01-02', birth_date: '2000-09-12', gender: 'F', address: '부산광역시 사하구 낙동대로 398', zip_code: '49305' }),
  // ── 연료공급사업부 (5) ──
  emp('e063', 'EMP-063', '김용태', 'dept-07', 'rank-4', 'title-3', 'regular', 5500000, { hire_date: '2015-01-05', birth_date: '1979-11-11', gender: 'M', address: '부산광역시 강서구 녹산산단335로 7', zip_code: '46757' }),
  emp('e064', 'EMP-064', '박성민', 'dept-07', 'rank-3', 'title-2', 'regular', 4500000, { hire_date: '2018-03-05', birth_date: '1986-06-04', gender: 'M', address: '김해시 내외동 금관대로 1370', zip_code: '50831' }),
  emp('e065', 'EMP-065', '이다영', 'dept-07', 'rank-2', 'title-1', 'regular', 3600000, { hire_date: '2021-01-04', birth_date: '1995-04-16', gender: 'F', address: '부산광역시 사상구 가야대로 326', zip_code: '46978' }),
  emp('e066', 'EMP-066', '최재혁', 'dept-07', 'rank-1', 'title-1', 'regular', 3100000, { hire_date: '2023-03-02', birth_date: '1998-07-23', gender: 'M', address: '부산광역시 북구 금곡대로 312', zip_code: '46523' }),
  emp('e067', 'EMP-067', '정수연', 'dept-07', 'rank-1', 'title-1', 'regular', 2900000, { hire_date: '2025-01-02', birth_date: '2000-01-08', gender: 'F', address: '김해시 장유3동 장유로 368', zip_code: '50908' }),
  // ── 계측제어사업부 (5) ──
  emp('e068', 'EMP-068', '윤상철', 'dept-08', 'rank-4', 'title-3', 'regular', 5500000, { hire_date: '2014-07-01', birth_date: '1980-08-19', gender: 'M', address: '부산광역시 강서구 녹산산단335로 7', zip_code: '46757' }),
  emp('e069', 'EMP-069', '이민수', 'dept-08', 'rank-3', 'title-2', 'regular', 4400000, { hire_date: '2017-06-01', birth_date: '1987-02-06', gender: 'M', address: '김해시 삼계로 80', zip_code: '50949' }),
  emp('e070', 'EMP-070', '김지원', 'dept-08', 'rank-2', 'title-1', 'regular', 3600000, { hire_date: '2020-07-01', birth_date: '1994-11-30', gender: 'F', address: '부산광역시 사하구 감천동 50', zip_code: '49456' }),
  emp('e071', 'EMP-071', '박현수', 'dept-08', 'rank-1', 'title-1', 'regular', 3100000, { hire_date: '2023-01-02', birth_date: '1998-05-15', gender: 'M', address: '부산광역시 강서구 대저1동 180', zip_code: '46706' }),
  emp('e072', 'EMP-072', '한소율', 'dept-08', 'rank-1', 'title-1', 'contract', 2900000, { hire_date: '2025-07-01', birth_date: '2001-03-28', gender: 'F', address: '부산광역시 금정구 부산대학로 125', zip_code: '46245' }),
  // ── 생산본부 (1) ──
  emp('e026', 'EMP-026', '안지훈', 'dept-09', 'rank-6', 'title-5', 'regular', 9000000, { hire_date: '2011-01-03', birth_date: '1973-12-20', gender: 'M', address: '부산광역시 강서구 녹산산단335로 7', zip_code: '46757' }),
  // ── 생산1팀 (10) ──
  emp('e027', 'EMP-027', '전상우', 'dept-20', 'rank-3', 'title-3', 'regular', 5000000, { hire_date: '2015-02-02', birth_date: '1982-06-14', gender: 'M', address: '부산광역시 사상구 학감대로 200', zip_code: '46967' }),
  emp('e073', 'EMP-073', '김철민', 'dept-20', 'rank-3', 'title-2', 'regular', 4600000, { hire_date: '2016-04-01', birth_date: '1984-03-22', gender: 'M', address: '김해시 진례면 진례로 100', zip_code: '50867' }),
  emp('e074', 'EMP-074', '이종석', 'dept-20', 'rank-2', 'title-1', 'regular', 3700000, { hire_date: '2018-09-03', birth_date: '1990-07-08', gender: 'M', address: '부산광역시 북구 구포동 819', zip_code: '46504' }),
  emp('e075', 'EMP-075', '박성준', 'dept-20', 'rank-2', 'title-1', 'regular', 3600000, { hire_date: '2019-04-01', birth_date: '1991-11-15', gender: 'M', address: '김해시 주촌면 서부로 1420', zip_code: '50971' }),
  emp('e076', 'EMP-076', '오태영', 'dept-20', 'rank-2', 'title-1', 'regular', 3500000, { hire_date: '2020-01-02', birth_date: '1993-02-28', gender: 'M', address: '부산광역시 사상구 모라로 25', zip_code: '46996' }),
  emp('e077', 'EMP-077', '강민호', 'dept-20', 'rank-1', 'title-1', 'regular', 3100000, { hire_date: '2022-01-03', birth_date: '1997-08-19', gender: 'M', address: '부산광역시 강서구 신호동 515', zip_code: '46754' }),
  emp('e078', 'EMP-078', '정호진', 'dept-20', 'rank-1', 'title-1', 'regular', 3000000, { hire_date: '2023-03-02', birth_date: '1998-04-03', gender: 'M', address: '김해시 삼방동 221', zip_code: '50941' }),
  emp('e079', 'EMP-079', '서형석', 'dept-20', 'rank-1', 'title-1', 'regular', 2900000, { hire_date: '2024-01-02', birth_date: '1999-10-25', gender: 'M', address: '부산광역시 사하구 장림동 72', zip_code: '49493' }),
  emp('e080', 'EMP-080', '임도현', 'dept-20', 'rank-1', 'title-1', 'parttime', 2400000, { hire_date: '2025-03-03', birth_date: '2001-01-12', gender: 'M', address: '부산광역시 북구 화명3동 2095', zip_code: '46509' }),
  // ── 생산2팀 (9) ──
  emp('e028', 'EMP-028', '홍민기', 'dept-21', 'rank-3', 'title-3', 'regular', 5000000, { hire_date: '2015-06-01', birth_date: '1983-09-02', gender: 'M', address: '부산광역시 사상구 가야대로 480', zip_code: '46988' }),
  emp('e081', 'EMP-081', '유재원', 'dept-21', 'rank-3', 'title-2', 'regular', 4500000, { hire_date: '2017-01-02', birth_date: '1985-12-11', gender: 'M', address: '김해시 장유2동 장유로 175', zip_code: '50904' }),
  emp('e082', 'EMP-082', '이경태', 'dept-21', 'rank-2', 'title-1', 'regular', 3700000, { hire_date: '2019-01-02', birth_date: '1991-05-20', gender: 'M', address: '부산광역시 북구 만덕3동 775', zip_code: '46544' }),
  emp('e083', 'EMP-083', '김한솔', 'dept-21', 'rank-2', 'title-1', 'regular', 3600000, { hire_date: '2020-03-02', birth_date: '1993-08-14', gender: 'M', address: '김해시 진영읍 진영로 302', zip_code: '50889' }),
  emp('e084', 'EMP-084', '박진성', 'dept-21', 'rank-1', 'title-1', 'regular', 3100000, { hire_date: '2022-03-02', birth_date: '1997-01-07', gender: 'M', address: '부산광역시 강서구 대저2동 50', zip_code: '46708' }),
  emp('e085', 'EMP-085', '윤태호', 'dept-21', 'rank-1', 'title-1', 'regular', 3000000, { hire_date: '2023-01-02', birth_date: '1998-06-22', gender: 'M', address: '부산광역시 사하구 하단1동 901', zip_code: '49389' }),
  emp('e086', 'EMP-086', '최진혁', 'dept-21', 'rank-1', 'title-1', 'regular', 2900000, { hire_date: '2024-07-01', birth_date: '1999-12-30', gender: 'M', address: '김해시 삼방동 180', zip_code: '50941' }),
  emp('e087', 'EMP-087', '조영준', 'dept-21', 'rank-1', 'title-1', 'parttime', 2400000, { hire_date: '2025-07-01', birth_date: '2001-04-17', gender: 'M', address: '부산광역시 사상구 학감대로 102', zip_code: '46961' }),
  // ── 품질관리팀 (5) ──
  emp('e029', 'EMP-029', '고승현', 'dept-10', 'rank-4', 'title-3', 'regular', 6000000, { hire_date: '2014-03-03', birth_date: '1980-10-16', gender: 'M', address: '부산광역시 강서구 녹산산단335로 7', zip_code: '46757' }),
  emp('e088', 'EMP-088', '정현아', 'dept-10', 'rank-3', 'title-2', 'regular', 4500000, { hire_date: '2017-03-02', birth_date: '1986-04-25', gender: 'F', address: '김해시 장유로 120', zip_code: '50900' }),
  emp('e089', 'EMP-089', '이우진', 'dept-10', 'rank-2', 'title-1', 'regular', 3700000, { hire_date: '2020-01-02', birth_date: '1993-09-18', gender: 'M', address: '부산광역시 사상구 백양대로 78', zip_code: '46947' }),
  emp('e090', 'EMP-090', '김나연', 'dept-10', 'rank-1', 'title-1', 'regular', 3100000, { hire_date: '2023-07-03', birth_date: '1999-02-08', gender: 'F', address: '부산광역시 북구 금곡대로 190', zip_code: '46517' }),
  emp('e091', 'EMP-091', '박시현', 'dept-10', 'rank-1', 'title-1', 'contract', 2900000, { hire_date: '2025-03-03', birth_date: '2000-11-22', gender: 'M', address: '김해시 내외동 능동로 40', zip_code: '50835' }),
  // ── 조달구매본부 (4) ──
  emp('e092', 'EMP-092', '이한규', 'dept-11', 'rank-5', 'title-5', 'regular', 7000000, { hire_date: '2013-04-01', birth_date: '1975-06-09', gender: 'M', address: '부산광역시 해운대구 반여로 5', zip_code: '48073' }),
  emp('e093', 'EMP-093', '김민수', 'dept-11', 'rank-3', 'title-3', 'regular', 4800000, { hire_date: '2018-01-02', birth_date: '1987-03-14', gender: 'M', address: '김해시 주촌면 골든루트로 125', zip_code: '50970' }),
  emp('e094', 'EMP-094', '서지연', 'dept-11', 'rank-2', 'title-1', 'regular', 3600000, { hire_date: '2021-03-02', birth_date: '1995-10-01', gender: 'F', address: '부산광역시 사상구 모라로 80', zip_code: '46998' }),
  emp('e095', 'EMP-095', '윤태영', 'dept-11', 'rank-1', 'title-1', 'regular', 3000000, { hire_date: '2024-01-02', birth_date: '1999-07-27', gender: 'M', address: '부산광역시 강서구 명지오션시티 9로 12', zip_code: '46728' }),
  // ── 스마트서비스본부 (5) ──
  emp('e096', 'EMP-096', '장동건', 'dept-12', 'rank-5', 'title-5', 'regular', 7000000, { hire_date: '2014-01-02', birth_date: '1976-08-20', gender: 'M', address: '부산광역시 해운대구 센텀중앙로 60', zip_code: '48058' }),
  emp('e097', 'EMP-097', '이승재', 'dept-12', 'rank-3', 'title-3', 'regular', 4800000, { hire_date: '2018-07-02', birth_date: '1988-01-30', gender: 'M', address: '김해시 장유3동 장유로 410', zip_code: '50909' }),
  emp('e098', 'EMP-098', '최유진', 'dept-12', 'rank-2', 'title-1', 'regular', 3700000, { hire_date: '2021-01-04', birth_date: '1994-06-15', gender: 'F', address: '부산광역시 북구 화명2동 1810', zip_code: '46505' }),
  emp('e099', 'EMP-099', '박준혁', 'dept-12', 'rank-1', 'title-1', 'regular', 3100000, { hire_date: '2023-09-01', birth_date: '1998-11-09', gender: 'M', address: '부산광역시 사하구 낙동대로 550', zip_code: '49316' }),
  emp('e100', 'EMP-100', '김서윤', 'dept-12', 'rank-1', 'title-1', 'intern', 2800000, { hire_date: '2025-09-01', birth_date: '2002-02-14', gender: 'F', address: '부산광역시 금정구 중앙대로 1900', zip_code: '46275' }),
  // ── HSE실 (1) ──
  emp('e030', 'EMP-030', '서재민', 'dept-13', 'rank-5', 'title-4', 'regular', 7000000, { hire_date: '2013-09-02', birth_date: '1978-01-30', gender: 'M', address: '부산광역시 강서구 녹산산단335로 7', zip_code: '46757' }),
  // ── 안전팀 (3) ──
  emp('e031', 'EMP-031', '정하늘', 'dept-22', 'rank-3', 'title-3', 'regular', 5000000, { hire_date: '2016-01-04', birth_date: '1984-08-05', gender: 'M', address: '김해시 진영읍 진영로 145', zip_code: '50886' }),
  emp('e101', 'EMP-101', '오경환', 'dept-22', 'rank-2', 'title-1', 'regular', 3700000, { hire_date: '2020-01-02', birth_date: '1993-04-12', gender: 'M', address: '부산광역시 사상구 학감대로 305', zip_code: '46972' }),
  emp('e102', 'EMP-102', '김현진', 'dept-22', 'rank-1', 'title-1', 'regular', 3000000, { hire_date: '2024-03-04', birth_date: '1999-09-20', gender: 'M', address: '부산광역시 북구 덕천1동 521', zip_code: '46528' }),
  // ── 공무팀 (3) ──
  emp('e103', 'EMP-103', '박영호', 'dept-23', 'rank-3', 'title-3', 'regular', 5000000, { hire_date: '2016-03-02', birth_date: '1983-05-17', gender: 'M', address: '부산광역시 강서구 녹산산단335로 7', zip_code: '46757' }),
  emp('e104', 'EMP-104', '이동근', 'dept-23', 'rank-2', 'title-1', 'regular', 3600000, { hire_date: '2020-09-01', birth_date: '1994-07-30', gender: 'M', address: '김해시 장유1동 장유로 58', zip_code: '50898' }),
  emp('e105', 'EMP-105', '한승민', 'dept-23', 'rank-1', 'title-1', 'contract', 2900000, { hire_date: '2025-01-02', birth_date: '2000-05-11', gender: 'M', address: '부산광역시 사상구 가야대로 145', zip_code: '46962' }),

  // ══ 퇴직자 (10) ══
  emp('e201', 'EMP-201', '김정훈', 'dept-20', 'rank-2', 'title-1', 'regular', 3600000, { hire_date: '2018-03-05', birth_date: '1990-06-12', gender: 'M', status: 'resigned', resignation_date: '2025-02-28', address: '부산광역시 사상구 학감대로 99', zip_code: '46960' }),
  emp('e202', 'EMP-202', '이수빈', 'dept-14', 'rank-1', 'title-1', 'regular', 3100000, { hire_date: '2022-01-03', birth_date: '1997-09-30', gender: 'F', status: 'resigned', resignation_date: '2025-04-30', address: '김해시 장유로 90', zip_code: '50899' }),
  emp('e203', 'EMP-203', '박재현', 'dept-05', 'rank-2', 'title-1', 'regular', 3700000, { hire_date: '2019-07-01', birth_date: '1992-03-08', gender: 'M', status: 'resigned', resignation_date: '2025-05-31', address: '부산광역시 사하구 낙동대로 115', zip_code: '49319' }),
  emp('e204', 'EMP-204', '최윤아', 'dept-18', 'rank-1', 'title-1', 'regular', 3200000, { hire_date: '2023-03-02', birth_date: '1999-01-15', gender: 'F', status: 'resigned', resignation_date: '2025-06-30', address: '부산광역시 해운대구 좌동로 40', zip_code: '48075' }),
  emp('e205', 'EMP-205', '윤하준', 'dept-19', 'rank-1', 'title-1', 'regular', 3000000, { hire_date: '2021-09-01', birth_date: '1996-11-22', gender: 'M', status: 'resigned', resignation_date: '2025-08-31', address: '김해시 내외동 금관대로 1250', zip_code: '50830' }),
  emp('e206', 'EMP-206', '강민재', 'dept-21', 'rank-1', 'title-1', 'regular', 3100000, { hire_date: '2020-01-02', birth_date: '1995-04-09', gender: 'M', status: 'resigned', resignation_date: '2025-09-30', address: '부산광역시 북구 금곡대로 85', zip_code: '46515' }),
  emp('e207', 'EMP-207', '정서영', 'dept-17', 'rank-1', 'title-1', 'contract', 3000000, { hire_date: '2024-01-02', birth_date: '1999-08-17', gender: 'F', status: 'resigned', resignation_date: '2025-10-31', address: '부산광역시 연제구 거제대로 160', zip_code: '47530' }),
  emp('e208', 'EMP-208', '임성현', 'dept-06', 'rank-2', 'title-1', 'regular', 3600000, { hire_date: '2019-01-02', birth_date: '1991-12-05', gender: 'M', status: 'resigned', resignation_date: '2025-11-30', address: '김해시 삼계로 200', zip_code: '50953' }),
  emp('e209', 'EMP-209', '배유나', 'dept-10', 'rank-1', 'title-1', 'regular', 3000000, { hire_date: '2022-09-01', birth_date: '1998-02-28', gender: 'F', status: 'resigned', resignation_date: '2025-12-31', address: '부산광역시 사상구 백양대로 210', zip_code: '46953' }),
  emp('e210', 'EMP-210', '김태규', 'dept-07', 'rank-1', 'title-1', 'regular', 3100000, { hire_date: '2023-07-03', birth_date: '1997-06-21', gender: 'M', status: 'retired', resignation_date: '2026-01-31', address: '부산광역시 강서구 대저1동 202', zip_code: '46706' }),
];

const seedCareerHistories: CareerHistory[] = [
  { id: 'ch-01', employee_id: 'e001', company_name: '현대중공업', department: '기계설계부', position: '부장', start_date: '1985-03-01', end_date: '2004-12-31', description: '선박 기계 설계' },
  { id: 'ch-02', employee_id: 'e002', company_name: '삼성중공업', department: '해양플랜트', position: '차장', start_date: '1990-01-02', end_date: '2007-12-31', description: '해양플랜트 설계' },
  { id: 'ch-03', employee_id: 'e003', company_name: '대우조선해양', department: '기술연구소', position: '과장', start_date: '1992-03-01', end_date: '2009-12-31', description: '환경설비 연구' },
  { id: 'ch-04', employee_id: 'e004', company_name: '포스코', department: '경영기획실', position: '과장', start_date: '1995-02-01', end_date: '2011-12-31', description: '경영기획' },
  { id: 'ch-05', employee_id: 'e016', company_name: 'STX조선', department: '영업부', position: '대리', start_date: '1998-03-02', end_date: '2011-03-31', description: '국내 선박 영업' },
  { id: 'ch-06', employee_id: 'e021', company_name: '한국기계연구원', department: '환경기계연구실', position: '선임연구원', start_date: '2000-03-01', end_date: '2010-05-31', description: '배기가스 처리 연구' },
  { id: 'ch-07', employee_id: 'e024', company_name: '두산인프라코어', department: '기술부', position: '대리', start_date: '2003-01-02', end_date: '2013-01-31', description: '기계설비 기술' },
  { id: 'ch-08', employee_id: 'e025', company_name: 'STX엔진', department: '기술부', position: '대리', start_date: '2005-03-01', end_date: '2013-05-31', description: '엔진 기술 개발' },
  { id: 'ch-09', employee_id: 'e026', company_name: '한진중공업', department: '생산부', position: '과장', start_date: '1998-02-01', end_date: '2010-12-31', description: '생산 관리' },
  { id: 'ch-10', employee_id: 'e029', company_name: '한국선급', department: '검사부', position: '선임검사원', start_date: '2005-06-01', end_date: '2014-02-28', description: '선박 품질 검사' },
  { id: 'ch-11', employee_id: 'e030', company_name: 'GS건설', department: 'HSE팀', position: '과장', start_date: '2002-03-01', end_date: '2013-08-31', description: '산업안전 관리' },
  { id: 'ch-12', employee_id: 'e017', company_name: '현대미포조선', department: '영업팀', position: '사원', start_date: '2006-03-01', end_date: '2014-04-30', description: '선박 영업' },
  { id: 'ch-13', employee_id: 'e022', company_name: '대한조선', department: '연구소', position: '사원', start_date: '2008-01-02', end_date: '2014-08-31', description: '선박 설계' },
  { id: 'ch-14', employee_id: 'e010', company_name: '아시아나항공', department: '인사팀', position: '사원', start_date: '2010-03-02', end_date: '2017-02-28', description: '인사 업무' },
  { id: 'ch-15', employee_id: 'e092', company_name: '현대중공업', department: '구매부', position: '대리', start_date: '2002-01-02', end_date: '2013-03-31', description: '자재 구매' },
  { id: 'ch-16', employee_id: 'e096', company_name: '삼성SDS', department: 'IT사업부', position: '과장', start_date: '2000-03-01', end_date: '2013-12-31', description: 'IT 서비스 사업' },
  { id: 'ch-17', employee_id: 'e063', company_name: '한국가스공사', department: '기술부', position: '대리', start_date: '2004-03-01', end_date: '2014-12-31', description: '연료 설비 기술' },
  { id: 'ch-18', employee_id: 'e068', company_name: '한국전력', department: '계측제어팀', position: '대리', start_date: '2005-01-03', end_date: '2014-06-30', description: '계측 제어 시스템' },
  { id: 'ch-19', employee_id: 'e051', company_name: '삼성엔지니어링', department: '기계부', position: '사원', start_date: '2006-03-01', end_date: '2015-02-28', description: '플랜트 설비' },
  { id: 'ch-20', employee_id: 'e057', company_name: '대우조선해양', department: 'BWTS팀', position: '사원', start_date: '2009-03-02', end_date: '2016-08-31', description: '발라스트수 처리' },
];

const seedEducationHistories: EducationHistory[] = [
  { id: 'eh-01', employee_id: 'e001', school_name: '서울대학교', major: '기계공학', degree: 'bachelor', start_date: '1977-03-01', end_date: '1981-02-28', is_graduated: true },
  { id: 'eh-02', employee_id: 'e002', school_name: '부산대학교', major: '조선해양공학', degree: 'master', start_date: '1984-03-01', end_date: '1990-02-28', is_graduated: true },
  { id: 'eh-03', employee_id: 'e003', school_name: 'KAIST', major: '환경공학', degree: 'master', start_date: '1986-03-01', end_date: '1992-02-28', is_graduated: true },
  { id: 'eh-04', employee_id: 'e004', school_name: '연세대학교', major: '경영학', degree: 'bachelor', start_date: '1989-03-01', end_date: '1993-02-28', is_graduated: true },
  { id: 'eh-05', employee_id: 'e010', school_name: '부산대학교', major: '경영학', degree: 'bachelor', start_date: '2003-03-01', end_date: '2007-02-28', is_graduated: true },
  { id: 'eh-06', employee_id: 'e011', school_name: '동아대학교', major: '행정학', degree: 'bachelor', start_date: '2011-03-01', end_date: '2015-02-28', is_graduated: true },
  { id: 'eh-07', employee_id: 'e012', school_name: '부경대학교', major: '경영학', degree: 'bachelor', start_date: '2016-03-01', end_date: '2020-02-28', is_graduated: true },
  { id: 'eh-08', employee_id: 'e013', school_name: '부산대학교', major: '회계학', degree: 'bachelor', start_date: '2001-03-01', end_date: '2005-02-28', is_graduated: true },
  { id: 'eh-09', employee_id: 'e014', school_name: '동아대학교', major: '경제학', degree: 'bachelor', start_date: '2009-03-01', end_date: '2013-02-28', is_graduated: true },
  { id: 'eh-10', employee_id: 'e015', school_name: '부경대학교', major: '경영학', degree: 'bachelor', start_date: '2000-03-01', end_date: '2004-02-28', is_graduated: true },
  { id: 'eh-11', employee_id: 'e016', school_name: '한양대학교', major: '국제통상학', degree: 'bachelor', start_date: '1990-03-01', end_date: '1994-02-28', is_graduated: true },
  { id: 'eh-12', employee_id: 'e017', school_name: '부산대학교', major: '무역학', degree: 'bachelor', start_date: '1998-03-01', end_date: '2002-02-28', is_graduated: true },
  { id: 'eh-13', employee_id: 'e018', school_name: '동아대학교', major: '경영학', degree: 'bachelor', start_date: '2012-03-01', end_date: '2016-02-28', is_graduated: true },
  { id: 'eh-14', employee_id: 'e019', school_name: '부산대학교', major: '영어영문학', degree: 'bachelor', start_date: '2003-03-01', end_date: '2007-02-28', is_graduated: true },
  { id: 'eh-15', employee_id: 'e020', school_name: '부경대학교', major: '국제통상학', degree: 'bachelor', start_date: '2017-03-01', end_date: '2021-02-28', is_graduated: true },
  { id: 'eh-16', employee_id: 'e021', school_name: '서울대학교', major: '기계공학', degree: 'doctorate', start_date: '1991-03-01', end_date: '1999-02-28', is_graduated: true },
  { id: 'eh-17', employee_id: 'e022', school_name: '부산대학교', major: '조선해양공학', degree: 'master', start_date: '2000-03-01', end_date: '2006-02-28', is_graduated: true },
  { id: 'eh-18', employee_id: 'e023', school_name: '부경대학교', major: '기계공학', degree: 'bachelor', start_date: '2011-03-01', end_date: '2015-02-28', is_graduated: true },
  { id: 'eh-19', employee_id: 'e024', school_name: '한양대학교', major: '환경공학', degree: 'master', start_date: '1995-03-01', end_date: '2001-02-28', is_graduated: true },
  { id: 'eh-20', employee_id: 'e025', school_name: '부산대학교', major: '기계공학', degree: 'master', start_date: '1996-03-01', end_date: '2002-02-28', is_graduated: true },
  { id: 'eh-21', employee_id: 'e026', school_name: '인하대학교', major: '산업공학', degree: 'bachelor', start_date: '1992-03-01', end_date: '1996-02-28', is_graduated: true },
  { id: 'eh-22', employee_id: 'e027', school_name: '동의대학교', major: '기계공학', degree: 'bachelor', start_date: '2001-03-01', end_date: '2005-02-28', is_graduated: true },
  { id: 'eh-23', employee_id: 'e028', school_name: '부경대학교', major: '기계공학', degree: 'bachelor', start_date: '2002-03-01', end_date: '2006-02-28', is_graduated: true },
  { id: 'eh-24', employee_id: 'e029', school_name: '부산대학교', major: '재료공학', degree: 'master', start_date: '1999-03-01', end_date: '2005-02-28', is_graduated: true },
  { id: 'eh-25', employee_id: 'e030', school_name: '인하대학교', major: '안전공학', degree: 'bachelor', start_date: '1996-03-01', end_date: '2000-02-28', is_graduated: true },
  { id: 'eh-26', employee_id: 'e031', school_name: '동의대학교', major: '안전공학', degree: 'bachelor', start_date: '2003-03-01', end_date: '2007-02-28', is_graduated: true },
  { id: 'eh-27', employee_id: 'e032', school_name: '부산대학교', major: '경영학', degree: 'bachelor', start_date: '2012-03-01', end_date: '2016-02-28', is_graduated: true },
  { id: 'eh-28', employee_id: 'e033', school_name: '동아대학교', major: '행정학', degree: 'bachelor', start_date: '2018-03-01', end_date: '2022-02-28', is_graduated: true },
  { id: 'eh-29', employee_id: 'e034', school_name: '부경대학교', major: '회계학', degree: 'bachelor', start_date: '2013-03-01', end_date: '2017-02-28', is_graduated: true },
  { id: 'eh-30', employee_id: 'e035', school_name: '동의대학교', major: '경영학', degree: 'bachelor', start_date: '2017-03-01', end_date: '2021-02-28', is_graduated: true },
  { id: 'eh-31', employee_id: 'e036', school_name: '동아대학교', major: '경영학', degree: 'bachelor', start_date: '2014-03-01', end_date: '2018-02-28', is_graduated: true },
  { id: 'eh-32', employee_id: 'e037', school_name: '부산외국어대', major: '국제학', degree: 'bachelor', start_date: '2019-03-01', end_date: '2023-02-28', is_graduated: true },
  { id: 'eh-33', employee_id: 'e038', school_name: '부경대학교', major: '무역학', degree: 'bachelor', start_date: '2013-03-01', end_date: '2017-02-28', is_graduated: true },
  { id: 'eh-34', employee_id: 'e039', school_name: '동아대학교', major: '경영학', degree: 'bachelor', start_date: '2016-03-01', end_date: '2020-02-28', is_graduated: true },
  { id: 'eh-35', employee_id: 'e041', school_name: '부산대학교', major: '영어영문학', degree: 'bachelor', start_date: '2005-03-01', end_date: '2009-02-28', is_graduated: true },
  { id: 'eh-36', employee_id: 'e042', school_name: '동의대학교', major: '국제통상학', degree: 'bachelor', start_date: '2012-03-01', end_date: '2016-02-28', is_graduated: true },
  { id: 'eh-37', employee_id: 'e045', school_name: '부산대학교', major: '기계공학', degree: 'master', start_date: '2005-03-01', end_date: '2011-02-28', is_graduated: true },
  { id: 'eh-38', employee_id: 'e046', school_name: '부경대학교', major: '전자공학', degree: 'bachelor', start_date: '2013-03-01', end_date: '2017-02-28', is_graduated: true },
  { id: 'eh-39', employee_id: 'e047', school_name: '동아대학교', major: '기계공학', degree: 'bachelor', start_date: '2014-03-01', end_date: '2018-02-28', is_graduated: true },
  { id: 'eh-40', employee_id: 'e048', school_name: '부산대학교', major: '화학공학', degree: 'bachelor', start_date: '2017-03-01', end_date: '2021-02-28', is_graduated: true },
  { id: 'eh-41', employee_id: 'e051', school_name: '인하대학교', major: '환경공학', degree: 'bachelor', start_date: '1998-03-01', end_date: '2002-02-28', is_graduated: true },
  { id: 'eh-42', employee_id: 'e052', school_name: '부산대학교', major: '기계공학', degree: 'bachelor', start_date: '2004-03-01', end_date: '2008-02-28', is_graduated: true },
  { id: 'eh-43', employee_id: 'e057', school_name: '부경대학교', major: '조선해양공학', degree: 'bachelor', start_date: '2003-03-01', end_date: '2007-02-28', is_graduated: true },
  { id: 'eh-44', employee_id: 'e058', school_name: '동아대학교', major: '환경공학', degree: 'bachelor', start_date: '2006-03-01', end_date: '2010-02-28', is_graduated: true },
  { id: 'eh-45', employee_id: 'e063', school_name: '인하대학교', major: '기계공학', degree: 'master', start_date: '1998-03-01', end_date: '2004-02-28', is_graduated: true },
  { id: 'eh-46', employee_id: 'e068', school_name: '부산대학교', major: '전자공학', degree: 'master', start_date: '1999-03-01', end_date: '2005-02-28', is_graduated: true },
  { id: 'eh-47', employee_id: 'e073', school_name: '동의대학교', major: '기계공학', degree: 'bachelor', start_date: '2003-03-01', end_date: '2007-02-28', is_graduated: true },
  { id: 'eh-48', employee_id: 'e081', school_name: '부경대학교', major: '기계공학', degree: 'bachelor', start_date: '2004-03-01', end_date: '2008-02-28', is_graduated: true },
  { id: 'eh-49', employee_id: 'e088', school_name: '부산대학교', major: '재료공학', degree: 'bachelor', start_date: '2005-03-01', end_date: '2009-02-28', is_graduated: true },
  { id: 'eh-50', employee_id: 'e092', school_name: '한양대학교', major: '산업공학', degree: 'bachelor', start_date: '1994-03-01', end_date: '1998-02-28', is_graduated: true },
  { id: 'eh-51', employee_id: 'e093', school_name: '동의대학교', major: '경영학', degree: 'bachelor', start_date: '2006-03-01', end_date: '2010-02-28', is_graduated: true },
  { id: 'eh-52', employee_id: 'e096', school_name: '서울대학교', major: '컴퓨터공학', degree: 'master', start_date: '1995-03-01', end_date: '2001-02-28', is_graduated: true },
  { id: 'eh-53', employee_id: 'e097', school_name: '부산대학교', major: '전자공학', degree: 'bachelor', start_date: '2007-03-01', end_date: '2011-02-28', is_graduated: true },
  { id: 'eh-54', employee_id: 'e103', school_name: '동아대학교', major: '기계공학', degree: 'bachelor', start_date: '2002-03-01', end_date: '2006-02-28', is_graduated: true },
  // 퇴직자
  { id: 'eh-55', employee_id: 'e201', school_name: '부경대학교', major: '기계공학', degree: 'bachelor', start_date: '2009-03-01', end_date: '2013-02-28', is_graduated: true },
  { id: 'eh-56', employee_id: 'e202', school_name: '동아대학교', major: '경영학', degree: 'bachelor', start_date: '2016-03-01', end_date: '2020-02-28', is_graduated: true },
  // 고졸/전문대 (생산직 일부)
  { id: 'eh-57', employee_id: 'e074', school_name: '부산공업고등학교', major: '기계과', degree: 'high_school', start_date: '2005-03-01', end_date: '2008-02-28', is_graduated: true },
  { id: 'eh-58', employee_id: 'e075', school_name: '동의과학대학교', major: '기계공학', degree: 'associate', start_date: '2008-03-01', end_date: '2011-02-28', is_graduated: true },
  { id: 'eh-59', employee_id: 'e076', school_name: '부산공업고등학교', major: '전기과', degree: 'high_school', start_date: '2008-03-01', end_date: '2011-02-28', is_graduated: true },
  { id: 'eh-60', employee_id: 'e082', school_name: '동의과학대학교', major: '기계설계', degree: 'associate', start_date: '2009-03-01', end_date: '2012-02-28', is_graduated: true },
  { id: 'eh-61', employee_id: 'e083', school_name: '부경대학교', major: '기계공학', degree: 'bachelor', start_date: '2012-03-01', end_date: '2016-02-28', is_graduated: true },
  { id: 'eh-62', employee_id: 'e101', school_name: '동의대학교', major: '안전공학', degree: 'bachelor', start_date: '2012-03-01', end_date: '2016-02-28', is_graduated: true },
  { id: 'eh-63', employee_id: 'e104', school_name: '부경대학교', major: '기계공학', degree: 'bachelor', start_date: '2013-03-01', end_date: '2017-02-28', is_graduated: true },
];

const seedCertifications: Certification[] = [
  { id: 'cert-01', employee_id: 'e021', name: '기계기술사', issuer: '한국산업인력공단', issue_date: '2005-06-15', expiry_date: null, certificate_number: '05-12345' },
  { id: 'cert-02', employee_id: 'e024', name: '대기환경기사', issuer: '한국산업인력공단', issue_date: '2003-11-20', expiry_date: null, certificate_number: '03-23456' },
  { id: 'cert-03', employee_id: 'e025', name: '기계설계산업기사', issuer: '한국산업인력공단', issue_date: '2004-05-10', expiry_date: null, certificate_number: '04-34567' },
  { id: 'cert-04', employee_id: 'e027', name: '용접기능사', issuer: '한국산업인력공단', issue_date: '2008-08-15', expiry_date: null, certificate_number: '08-45678' },
  { id: 'cert-05', employee_id: 'e028', name: '용접기능사', issuer: '한국산업인력공단', issue_date: '2009-03-20', expiry_date: null, certificate_number: '09-56789' },
  { id: 'cert-06', employee_id: 'e029', name: '품질경영기사', issuer: '한국산업인력공단', issue_date: '2007-11-15', expiry_date: null, certificate_number: '07-67890' },
  { id: 'cert-07', employee_id: 'e030', name: '산업안전기사', issuer: '한국산업인력공단', issue_date: '2005-05-20', expiry_date: null, certificate_number: '05-78901' },
  { id: 'cert-08', employee_id: 'e031', name: '산업안전기사', issuer: '한국산업인력공단', issue_date: '2010-11-15', expiry_date: null, certificate_number: '10-89012' },
  { id: 'cert-09', employee_id: 'e013', name: '공인회계사', issuer: '금융감독원', issue_date: '2008-12-01', expiry_date: null, certificate_number: '08-90123' },
  { id: 'cert-10', employee_id: 'e014', name: '세무사', issuer: '한국산업인력공단', issue_date: '2016-09-15', expiry_date: null, certificate_number: '16-01234' },
  { id: 'cert-11', employee_id: 'e022', name: '기계기사', issuer: '한국산업인력공단', issue_date: '2006-11-20', expiry_date: null, certificate_number: '06-12345' },
  { id: 'cert-12', employee_id: 'e045', name: '기계기사', issuer: '한국산업인력공단', issue_date: '2010-05-15', expiry_date: null, certificate_number: '10-23456' },
  { id: 'cert-13', employee_id: 'e051', name: '대기환경기사', issuer: '한국산업인력공단', issue_date: '2007-11-20', expiry_date: null, certificate_number: '07-34567' },
  { id: 'cert-14', employee_id: 'e052', name: '용접산업기사', issuer: '한국산업인력공단', issue_date: '2012-08-15', expiry_date: null, certificate_number: '12-45678' },
  { id: 'cert-15', employee_id: 'e057', name: '환경기사', issuer: '한국산업인력공단', issue_date: '2011-05-20', expiry_date: null, certificate_number: '11-56789' },
  { id: 'cert-16', employee_id: 'e058', name: '환경기사', issuer: '한국산업인력공단', issue_date: '2013-11-15', expiry_date: null, certificate_number: '13-67890' },
  { id: 'cert-17', employee_id: 'e063', name: '가스기사', issuer: '한국산업인력공단', issue_date: '2008-05-20', expiry_date: null, certificate_number: '08-78901' },
  { id: 'cert-18', employee_id: 'e064', name: '가스산업기사', issuer: '한국산업인력공단', issue_date: '2012-11-15', expiry_date: null, certificate_number: '12-89012' },
  { id: 'cert-19', employee_id: 'e068', name: '전기기사', issuer: '한국산업인력공단', issue_date: '2007-05-20', expiry_date: null, certificate_number: '07-90123' },
  { id: 'cert-20', employee_id: 'e069', name: '전기산업기사', issuer: '한국산업인력공단', issue_date: '2011-11-15', expiry_date: null, certificate_number: '11-01234' },
  { id: 'cert-21', employee_id: 'e073', name: '용접기능사', issuer: '한국산업인력공단', issue_date: '2010-03-20', expiry_date: null, certificate_number: '10-12345' },
  { id: 'cert-22', employee_id: 'e074', name: '용접기능사', issuer: '한국산업인력공단', issue_date: '2011-08-15', expiry_date: null, certificate_number: '11-23456' },
  { id: 'cert-23', employee_id: 'e081', name: '용접기능사', issuer: '한국산업인력공단', issue_date: '2012-03-20', expiry_date: null, certificate_number: '12-34567' },
  { id: 'cert-24', employee_id: 'e082', name: '기계설계산업기사', issuer: '한국산업인력공단', issue_date: '2014-08-15', expiry_date: null, certificate_number: '14-45678' },
  { id: 'cert-25', employee_id: 'e088', name: '품질경영산업기사', issuer: '한국산업인력공단', issue_date: '2013-11-15', expiry_date: null, certificate_number: '13-56789' },
  { id: 'cert-26', employee_id: 'e089', name: '품질경영산업기사', issuer: '한국산업인력공단', issue_date: '2018-05-20', expiry_date: null, certificate_number: '18-67890' },
  { id: 'cert-27', employee_id: 'e092', name: '물류관리사', issuer: '한국산업인력공단', issue_date: '2005-11-15', expiry_date: null, certificate_number: '05-78901' },
  { id: 'cert-28', employee_id: 'e096', name: '정보관리기술사', issuer: '한국산업인력공단', issue_date: '2008-05-20', expiry_date: null, certificate_number: '08-89012' },
  { id: 'cert-29', employee_id: 'e097', name: '정보처리기사', issuer: '한국산업인력공단', issue_date: '2012-11-15', expiry_date: null, certificate_number: '12-90123' },
  { id: 'cert-30', employee_id: 'e101', name: '산업안전산업기사', issuer: '한국산업인력공단', issue_date: '2017-05-20', expiry_date: null, certificate_number: '17-01234' },
  { id: 'cert-31', employee_id: 'e103', name: '기계기사', issuer: '한국산업인력공단', issue_date: '2010-11-15', expiry_date: null, certificate_number: '10-12345' },
  { id: 'cert-32', employee_id: 'e026', name: '산업안전기사', issuer: '한국산업인력공단', issue_date: '2002-05-20', expiry_date: null, certificate_number: '02-23456' },
  { id: 'cert-33', employee_id: 'e010', name: 'PHR (인사관리사)', issuer: 'HRCI', issue_date: '2019-03-15', expiry_date: '2025-03-14', certificate_number: 'PHR-12345' },
  { id: 'cert-34', employee_id: 'e019', name: 'TOEIC 950', issuer: 'ETS', issue_date: '2018-05-20', expiry_date: '2020-05-19', certificate_number: null },
  { id: 'cert-35', employee_id: 'e043', name: 'TOEIC 920', issuer: 'ETS', issue_date: '2021-03-15', expiry_date: '2023-03-14', certificate_number: null },
];

const seedFamilyMembers: FamilyMember[] = [
  { id: 'fm-01', employee_id: 'e001', name: '이미자', relation: '배우자', birth_date: '1960-08-15', phone: '010-1234-0001', is_dependent: true },
  { id: 'fm-02', employee_id: 'e001', name: '이지영', relation: '자녀', birth_date: '1985-04-20', phone: null, is_dependent: false },
  { id: 'fm-03', employee_id: 'e002', name: '김선영', relation: '배우자', birth_date: '1967-02-10', phone: '010-1234-0002', is_dependent: true },
  { id: 'fm-04', employee_id: 'e004', name: '박현정', relation: '배우자', birth_date: '1972-09-22', phone: '010-1234-0004', is_dependent: true },
  { id: 'fm-05', employee_id: 'e004', name: '김민서', relation: '자녀', birth_date: '2002-03-15', phone: null, is_dependent: true },
  { id: 'fm-06', employee_id: 'e010', name: '이준혁', relation: '배우자', birth_date: '1984-06-30', phone: '010-1234-0010', is_dependent: false },
  { id: 'fm-07', employee_id: 'e013', name: '박성진', relation: '배우자', birth_date: '1982-04-11', phone: '010-1234-0013', is_dependent: false },
  { id: 'fm-08', employee_id: 'e013', name: '장서윤', relation: '자녀', birth_date: '2012-07-05', phone: null, is_dependent: true },
  { id: 'fm-09', employee_id: 'e015', name: '김미영', relation: '배우자', birth_date: '1984-03-20', phone: '010-1234-0015', is_dependent: true },
  { id: 'fm-10', employee_id: 'e016', name: '최은주', relation: '배우자', birth_date: '1973-11-28', phone: '010-1234-0016', is_dependent: true },
  { id: 'fm-11', employee_id: 'e016', name: '강현서', relation: '자녀', birth_date: '2005-01-10', phone: null, is_dependent: true },
  { id: 'fm-12', employee_id: 'e017', name: '이수연', relation: '배우자', birth_date: '1981-07-15', phone: '010-1234-0017', is_dependent: true },
  { id: 'fm-13', employee_id: 'e017', name: '윤지원', relation: '자녀', birth_date: '2010-09-03', phone: null, is_dependent: true },
  { id: 'fm-14', employee_id: 'e019', name: '김유진', relation: '배우자', birth_date: '1986-05-18', phone: '010-1234-0019', is_dependent: true },
  { id: 'fm-15', employee_id: 'e021', name: '박은경', relation: '배우자', birth_date: '1974-08-25', phone: '010-1234-0021', is_dependent: true },
  { id: 'fm-16', employee_id: 'e021', name: '송현우', relation: '자녀', birth_date: '2003-06-12', phone: null, is_dependent: true },
  { id: 'fm-17', employee_id: 'e021', name: '송다인', relation: '자녀', birth_date: '2006-11-20', phone: null, is_dependent: true },
  { id: 'fm-18', employee_id: 'e022', name: '최수빈', relation: '배우자', birth_date: '1983-12-05', phone: '010-1234-0022', is_dependent: true },
  { id: 'fm-19', employee_id: 'e024', name: '이정은', relation: '배우자', birth_date: '1978-04-30', phone: '010-1234-0024', is_dependent: true },
  { id: 'fm-20', employee_id: 'e024', name: '권서준', relation: '자녀', birth_date: '2008-02-14', phone: null, is_dependent: true },
  { id: 'fm-21', employee_id: 'e025', name: '김보영', relation: '배우자', birth_date: '1979-10-08', phone: '010-1234-0025', is_dependent: true },
  { id: 'fm-22', employee_id: 'e026', name: '정혜진', relation: '배우자', birth_date: '1975-06-17', phone: '010-1234-0026', is_dependent: true },
  { id: 'fm-23', employee_id: 'e027', name: '박미선', relation: '배우자', birth_date: '1984-09-12', phone: '010-1234-0027', is_dependent: true },
  { id: 'fm-24', employee_id: 'e028', name: '이수정', relation: '배우자', birth_date: '1985-11-30', phone: '010-1234-0028', is_dependent: true },
  { id: 'fm-25', employee_id: 'e029', name: '김현주', relation: '배우자', birth_date: '1982-07-22', phone: '010-1234-0029', is_dependent: true },
  { id: 'fm-26', employee_id: 'e030', name: '이미래', relation: '배우자', birth_date: '1980-03-05', phone: '010-1234-0030', is_dependent: true },
  { id: 'fm-27', employee_id: 'e030', name: '서하준', relation: '자녀', birth_date: '2010-05-18', phone: null, is_dependent: true },
  { id: 'fm-28', employee_id: 'e031', name: '박소라', relation: '배우자', birth_date: '1986-12-25', phone: '010-1234-0031', is_dependent: true },
  { id: 'fm-29', employee_id: 'e041', name: '김태연', relation: '배우자', birth_date: '1988-02-22', phone: '010-1234-0041', is_dependent: true },
  { id: 'fm-30', employee_id: 'e051', name: '이현아', relation: '배우자', birth_date: '1981-10-15', phone: '010-1234-0051', is_dependent: true },
  { id: 'fm-31', employee_id: 'e057', name: '박정아', relation: '배우자', birth_date: '1986-03-08', phone: '010-1234-0057', is_dependent: true },
  { id: 'fm-32', employee_id: 'e063', name: '최미정', relation: '배우자', birth_date: '1981-07-20', phone: '010-1234-0063', is_dependent: true },
  { id: 'fm-33', employee_id: 'e063', name: '김태준', relation: '자녀', birth_date: '2010-12-01', phone: null, is_dependent: true },
  { id: 'fm-34', employee_id: 'e068', name: '한지혜', relation: '배우자', birth_date: '1982-05-09', phone: '010-1234-0068', is_dependent: true },
  { id: 'fm-35', employee_id: 'e073', name: '신미영', relation: '배우자', birth_date: '1986-08-14', phone: '010-1234-0073', is_dependent: true },
  { id: 'fm-36', employee_id: 'e081', name: '오세미', relation: '배우자', birth_date: '1987-04-20', phone: '010-1234-0081', is_dependent: true },
  { id: 'fm-37', employee_id: 'e088', name: '이민수', relation: '배우자', birth_date: '1985-09-10', phone: '010-1234-0088', is_dependent: false },
  { id: 'fm-38', employee_id: 'e092', name: '조은정', relation: '배우자', birth_date: '1977-12-08', phone: '010-1234-0092', is_dependent: true },
  { id: 'fm-39', employee_id: 'e092', name: '이서현', relation: '자녀', birth_date: '2007-06-25', phone: null, is_dependent: true },
  { id: 'fm-40', employee_id: 'e096', name: '김정민', relation: '배우자', birth_date: '1978-11-03', phone: '010-1234-0096', is_dependent: true },
  { id: 'fm-41', employee_id: 'e103', name: '윤미라', relation: '배우자', birth_date: '1985-01-22', phone: '010-1234-0103', is_dependent: true },
];

// ---------------------------------------------------------------------------
// Store types
// ---------------------------------------------------------------------------

interface EmployeeState {
  departments: Department[];
  positionRanks: PositionRank[];
  positionTitles: PositionTitle[];
  employees: Employee[];
  careerHistories: CareerHistory[];
  educationHistories: EducationHistory[];
  certifications: Certification[];
  familyMembers: FamilyMember[];
  jobCategories: JobCategory[];
  salaryGrades: SalaryGrade[];
}

interface EmployeeActions {
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addDepartment: (department: Department) => void;
  updateDepartment: (id: string, data: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  // Position Ranks
  addPositionRank: (rank: PositionRank) => void;
  updatePositionRank: (id: string, data: Partial<PositionRank>) => void;
  deletePositionRank: (id: string) => void;

  // Position Titles
  addPositionTitle: (title: PositionTitle) => void;
  updatePositionTitle: (id: string, data: Partial<PositionTitle>) => void;
  deletePositionTitle: (id: string) => void;

  // Job Categories
  addJobCategory: (category: JobCategory) => void;
  updateJobCategory: (id: string, data: Partial<JobCategory>) => void;
  deleteJobCategory: (id: string) => void;

  // Salary Grades
  addSalaryGrade: (grade: SalaryGrade) => void;
  updateSalaryGrade: (id: string, data: Partial<SalaryGrade>) => void;
  deleteSalaryGrade: (id: string) => void;

  // Sub-data
  addCareerHistory: (item: CareerHistory) => void;
  updateCareerHistory: (id: string, data: Partial<CareerHistory>) => void;
  deleteCareerHistory: (id: string) => void;

  addEducationHistory: (item: EducationHistory) => void;
  updateEducationHistory: (id: string, data: Partial<EducationHistory>) => void;
  deleteEducationHistory: (id: string) => void;

  addCertification: (item: Certification) => void;
  updateCertification: (id: string, data: Partial<Certification>) => void;
  deleteCertification: (id: string) => void;

  addFamilyMember: (item: FamilyMember) => void;
  updateFamilyMember: (id: string, data: Partial<FamilyMember>) => void;
  deleteFamilyMember: (id: string) => void;
}

interface EmployeeGetters {
  getEmployeeById: (id: string) => Employee | undefined;
  getActiveEmployees: () => Employee[];
  getEmployeesByDepartment: (deptId: string) => Employee[];
  getDepartmentById: (id: string) => Department | undefined;
  getPositionRankById: (id: string) => PositionRank | undefined;
  getPositionTitleById: (id: string) => PositionTitle | undefined;
  getCareerByEmployee: (empId: string) => CareerHistory[];
  getEducationByEmployee: (empId: string) => EducationHistory[];
  getCertsByEmployee: (empId: string) => Certification[];
  getFamilyByEmployee: (empId: string) => FamilyMember[];
}

export type EmployeeStore = EmployeeState & EmployeeActions & EmployeeGetters;

// ---------------------------------------------------------------------------
// Hydration helper — resolves FK IDs to nested objects
// ---------------------------------------------------------------------------

function hydrateEmployee(
  e: Employee,
  departments: Department[],
  ranks: PositionRank[],
  titles: PositionTitle[],
): Employee {
  return {
    ...e,
    department: departments.find((d) => d.id === e.department_id),
    position_rank: ranks.find((r) => r.id === e.position_rank_id),
    position_title: titles.find((t) => t.id === e.position_title_id),
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useEmployeeStore = create<EmployeeStore>()(
  persist(
    (set, get) => ({
      // --- Initial state ---
      departments: seedDepartments,
      positionRanks: seedPositionRanks,
      positionTitles: seedPositionTitles,
      employees: seedEmployees,
      careerHistories: seedCareerHistories,
      educationHistories: seedEducationHistories,
      certifications: seedCertifications,
      familyMembers: seedFamilyMembers,
      jobCategories: seedJobCategories,
      salaryGrades: seedSalaryGrades,

      // --- Actions ---
      addEmployee: (employee) =>
        set((s) => ({ employees: [...s.employees, employee] })),

      updateEmployee: (id, data) =>
        set((s) => ({
          employees: s.employees.map((e) =>
            e.id === id ? { ...e, ...data, updated_at: new Date().toISOString() } : e,
          ),
        })),

      deleteEmployee: (id) =>
        set((s) => ({
          employees: s.employees.map((e) =>
            e.id === id
              ? { ...e, status: 'resigned' as EmployeeStatus, resignation_date: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString() }
              : e,
          ),
        })),

      addDepartment: (department) =>
        set((s) => ({ departments: [...s.departments, department] })),

      updateDepartment: (id, data) =>
        set((s) => ({
          departments: s.departments.map((d) =>
            d.id === id ? { ...d, ...data, updated_at: new Date().toISOString() } : d,
          ),
        })),

      deleteDepartment: (id) =>
        set((s) => ({
          departments: s.departments.map((d) =>
            d.id === id
              ? { ...d, is_active: false, effective_to: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString() }
              : d,
          ),
        })),

      // Position Ranks
      addPositionRank: (rank) =>
        set((s) => ({ positionRanks: [...s.positionRanks, rank] })),

      updatePositionRank: (id, data) =>
        set((s) => ({
          positionRanks: s.positionRanks.map((r) =>
            r.id === id ? { ...r, ...data, updated_at: new Date().toISOString() } : r,
          ),
        })),

      deletePositionRank: (id) =>
        set((s) => ({
          positionRanks: s.positionRanks.map((r) =>
            r.id === id
              ? { ...r, is_active: false, effective_to: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString() }
              : r,
          ),
        })),

      // Position Titles
      addPositionTitle: (title) =>
        set((s) => ({ positionTitles: [...s.positionTitles, title] })),

      updatePositionTitle: (id, data) =>
        set((s) => ({
          positionTitles: s.positionTitles.map((t) =>
            t.id === id ? { ...t, ...data, updated_at: new Date().toISOString() } : t,
          ),
        })),

      deletePositionTitle: (id) =>
        set((s) => ({
          positionTitles: s.positionTitles.map((t) =>
            t.id === id
              ? { ...t, is_active: false, effective_to: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString() }
              : t,
          ),
        })),

      // Job Categories
      addJobCategory: (category) =>
        set((s) => ({ jobCategories: [...s.jobCategories, category] })),

      updateJobCategory: (id, data) =>
        set((s) => ({
          jobCategories: s.jobCategories.map((c) =>
            c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c,
          ),
        })),

      deleteJobCategory: (id) =>
        set((s) => ({
          jobCategories: s.jobCategories.map((c) =>
            c.id === id
              ? { ...c, is_active: false, effective_to: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString() }
              : c,
          ),
        })),

      // Salary Grades
      addSalaryGrade: (grade) =>
        set((s) => ({ salaryGrades: [...s.salaryGrades, grade] })),

      updateSalaryGrade: (id, data) =>
        set((s) => ({
          salaryGrades: s.salaryGrades.map((g) =>
            g.id === id ? { ...g, ...data, updated_at: new Date().toISOString() } : g,
          ),
        })),

      deleteSalaryGrade: (id) =>
        set((s) => ({
          salaryGrades: s.salaryGrades.map((g) =>
            g.id === id
              ? { ...g, is_active: false, effective_to: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString() }
              : g,
          ),
        })),

      addCareerHistory: (item) =>
        set((s) => ({ careerHistories: [...s.careerHistories, item] })),
      updateCareerHistory: (id, data) =>
        set((s) => ({
          careerHistories: s.careerHistories.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      deleteCareerHistory: (id) =>
        set((s) => ({ careerHistories: s.careerHistories.filter((c) => c.id !== id) })),

      addEducationHistory: (item) =>
        set((s) => ({ educationHistories: [...s.educationHistories, item] })),
      updateEducationHistory: (id, data) =>
        set((s) => ({
          educationHistories: s.educationHistories.map((e) => (e.id === id ? { ...e, ...data } : e)),
        })),
      deleteEducationHistory: (id) =>
        set((s) => ({ educationHistories: s.educationHistories.filter((e) => e.id !== id) })),

      addCertification: (item) =>
        set((s) => ({ certifications: [...s.certifications, item] })),
      updateCertification: (id, data) =>
        set((s) => ({
          certifications: s.certifications.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      deleteCertification: (id) =>
        set((s) => ({ certifications: s.certifications.filter((c) => c.id !== id) })),

      addFamilyMember: (item) =>
        set((s) => ({ familyMembers: [...s.familyMembers, item] })),
      updateFamilyMember: (id, data) =>
        set((s) => ({
          familyMembers: s.familyMembers.map((f) => (f.id === id ? { ...f, ...data } : f)),
        })),
      deleteFamilyMember: (id) =>
        set((s) => ({ familyMembers: s.familyMembers.filter((f) => f.id !== id) })),

      // --- Getters ---
      getEmployeeById: (id) => {
        const s = get();
        const e = s.employees.find((emp) => emp.id === id);
        if (!e) return undefined;
        return hydrateEmployee(e, s.departments, s.positionRanks, s.positionTitles);
      },

      getActiveEmployees: () => {
        const s = get();
        return s.employees
          .filter((e) => e.status === 'active')
          .map((e) => hydrateEmployee(e, s.departments, s.positionRanks, s.positionTitles));
      },

      getEmployeesByDepartment: (deptId) => {
        const s = get();
        return s.employees
          .filter((e) => e.department_id === deptId && e.status === 'active')
          .map((e) => hydrateEmployee(e, s.departments, s.positionRanks, s.positionTitles));
      },

      getDepartmentById: (id) => get().departments.find((d) => d.id === id),
      getPositionRankById: (id) => get().positionRanks.find((r) => r.id === id),
      getPositionTitleById: (id) => get().positionTitles.find((t) => t.id === id),

      getCareerByEmployee: (empId) => get().careerHistories.filter((c) => c.employee_id === empId),
      getEducationByEmployee: (empId) => get().educationHistories.filter((e) => e.employee_id === empId),
      getCertsByEmployee: (empId) => get().certifications.filter((c) => c.employee_id === empId),
      getFamilyByEmployee: (empId) => get().familyMembers.filter((f) => f.employee_id === empId),
    }),
    {
      name: 'hrms-employees',
      version: 4,
      migrate: (persisted: unknown, version: number) => {
        // v3→v4: Expanded demo data (100 active + 10 resigned), force re-seed
        if (version < 4) {
          return {};
        }
        return persisted as Record<string, unknown>;
      },
    },
  ),
);
