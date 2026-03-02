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
  { id: 'dept-01', name: '대표이사실', code: 'CEO', parent_id: null, level: 1, sort_order: 1, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-02', name: '경영지원본부', code: 'MGT', parent_id: null, level: 1, sort_order: 2, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-03', name: '영업본부', code: 'SALES', parent_id: null, level: 1, sort_order: 3, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-04', name: '기술연구소', code: 'RND', parent_id: null, level: 1, sort_order: 4, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-05', name: '스크러버사업부', code: 'SCR', parent_id: null, level: 1, sort_order: 5, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-06', name: 'BWTS사업부', code: 'BWTS', parent_id: null, level: 1, sort_order: 6, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-07', name: '연료공급사업부', code: 'FUEL', parent_id: null, level: 1, sort_order: 7, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-08', name: '계측제어사업부', code: 'IC', parent_id: null, level: 1, sort_order: 8, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-09', name: '생산본부', code: 'PROD', parent_id: null, level: 1, sort_order: 9, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-10', name: '품질관리팀', code: 'QC', parent_id: null, level: 1, sort_order: 10, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-11', name: '조달구매본부', code: 'PURCH', parent_id: null, level: 1, sort_order: 11, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-12', name: '스마트서비스본부', code: 'SMART', parent_id: null, level: 1, sort_order: 12, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-13', name: 'HSE실', code: 'HSE', parent_id: null, level: 1, sort_order: 13, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  // Sub-departments under 경영지원본부
  { id: 'dept-14', name: '인사팀', code: 'HR', parent_id: 'dept-02', level: 2, sort_order: 1, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-15', name: '재무회계팀', code: 'FIN', parent_id: 'dept-02', level: 2, sort_order: 2, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-16', name: '총무팀', code: 'GA', parent_id: 'dept-02', level: 2, sort_order: 3, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  // Sub-departments under 영업본부
  { id: 'dept-17', name: '국내영업팀', code: 'DOM', parent_id: 'dept-03', level: 2, sort_order: 1, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-18', name: '해외영업팀', code: 'INTL', parent_id: 'dept-03', level: 2, sort_order: 2, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  // Sub-department under 기술연구소
  { id: 'dept-19', name: '연구개발팀', code: 'RD', parent_id: 'dept-04', level: 2, sort_order: 1, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  // Sub-departments under 생산본부
  { id: 'dept-20', name: '생산1팀', code: 'PROD1', parent_id: 'dept-09', level: 2, sort_order: 1, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-21', name: '생산2팀', code: 'PROD2', parent_id: 'dept-09', level: 2, sort_order: 2, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  // Sub-departments under HSE실
  { id: 'dept-22', name: '안전팀', code: 'SAFE', parent_id: 'dept-13', level: 2, sort_order: 1, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-23', name: '공무팀', code: 'MAINT', parent_id: 'dept-13', level: 2, sort_order: 2, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
];

const seedPositionRanks: PositionRank[] = [
  { id: 'rank-1', name: '사원', level: 1, is_active: true },
  { id: 'rank-2', name: '대리', level: 2, is_active: true },
  { id: 'rank-3', name: '과장', level: 3, is_active: true },
  { id: 'rank-4', name: '차장', level: 4, is_active: true },
  { id: 'rank-5', name: '부장', level: 5, is_active: true },
  { id: 'rank-6', name: '이사', level: 6, is_active: true },
  { id: 'rank-7', name: '대표이사', level: 7, is_active: true },
  { id: 'rank-8', name: '회장', level: 8, is_active: true },
];

const seedPositionTitles: PositionTitle[] = [
  { id: 'title-1', name: '팀원', level: 1, is_active: true },
  { id: 'title-2', name: '파트장', level: 2, is_active: true },
  { id: 'title-3', name: '팀장', level: 3, is_active: true },
  { id: 'title-4', name: '실장', level: 4, is_active: true },
  { id: 'title-5', name: '본부장', level: 5, is_active: true },
  { id: 'title-6', name: '소장', level: 6, is_active: true },
  { id: 'title-7', name: '대표이사', level: 7, is_active: true },
  { id: 'title-8', name: '회장', level: 8, is_active: true },
];

const seedJobCategories: JobCategory[] = [
  { id: 'jc-1', name: '기술직', code: 'TECH', description: '기술 관련 직무', sort_order: 1, is_active: true },
  { id: 'jc-2', name: '사무직', code: 'OFFICE', description: '사무 관련 직무', sort_order: 2, is_active: true },
  { id: 'jc-3', name: '생산직', code: 'MANUF', description: '생산 관련 직무', sort_order: 3, is_active: true },
  { id: 'jc-4', name: '영업직', code: 'SALES', description: '영업 관련 직무', sort_order: 4, is_active: true },
  { id: 'jc-5', name: '연구직', code: 'RESEARCH', description: '연구 관련 직무', sort_order: 5, is_active: true },
];

const seedSalaryGrades: SalaryGrade[] = [
  // 사원 (rank-1)
  { id: 'sg-01', rank_id: 'rank-1', step: 1, base_amount: 2800000, is_active: true },
  { id: 'sg-02', rank_id: 'rank-1', step: 2, base_amount: 2900000, is_active: true },
  { id: 'sg-03', rank_id: 'rank-1', step: 3, base_amount: 3000000, is_active: true },
  // 대리 (rank-2)
  { id: 'sg-04', rank_id: 'rank-2', step: 1, base_amount: 3500000, is_active: true },
  { id: 'sg-05', rank_id: 'rank-2', step: 2, base_amount: 3600000, is_active: true },
  { id: 'sg-06', rank_id: 'rank-2', step: 3, base_amount: 3700000, is_active: true },
  // 과장 (rank-3)
  { id: 'sg-07', rank_id: 'rank-3', step: 1, base_amount: 4200000, is_active: true },
  { id: 'sg-08', rank_id: 'rank-3', step: 2, base_amount: 4400000, is_active: true },
  { id: 'sg-09', rank_id: 'rank-3', step: 3, base_amount: 4600000, is_active: true },
  // 차장 (rank-4)
  { id: 'sg-10', rank_id: 'rank-4', step: 1, base_amount: 5000000, is_active: true },
  { id: 'sg-11', rank_id: 'rank-4', step: 2, base_amount: 5300000, is_active: true },
  // 부장 (rank-5)
  { id: 'sg-12', rank_id: 'rank-5', step: 1, base_amount: 6000000, is_active: true },
  { id: 'sg-13', rank_id: 'rank-5', step: 2, base_amount: 6500000, is_active: true },
  // 이사 (rank-6)
  { id: 'sg-14', rank_id: 'rank-6', step: 1, base_amount: 8000000, is_active: true },
  { id: 'sg-15', rank_id: 'rank-6', step: 2, base_amount: 9000000, is_active: true },
  // 대표이사 (rank-7)
  { id: 'sg-16', rank_id: 'rank-7', step: 1, base_amount: 12000000, is_active: true },
  // 회장 (rank-8)
  { id: 'sg-17', rank_id: 'rank-8', step: 1, base_amount: 15000000, is_active: true },
];

// Helper to build employee
function emp(
  id: string, num: string, name: string, deptId: string, rankId: string, titleId: string,
  empType: EmploymentType, salary: number, extra?: Partial<Employee>,
): Employee {
  return {
    id, employee_number: num, name, name_en: null,
    email: `${id}@panasia.co.kr`, phone: `010-0000-${id.replace('e0', '').padStart(4, '0')}`,
    birth_date: null, gender: null, address: null, address_detail: null, zip_code: null,
    department_id: deptId, position_rank_id: rankId, position_title_id: titleId,
    employment_type: empType, hire_date: '2020-01-01', resignation_date: null,
    status: 'active', base_salary: salary,
    bank_name: '국민은행', bank_account: `***-****-${id.replace('e0', '').padStart(4, '0')}`,
    profile_image_url: null,
    emergency_contact_name: null, emergency_contact_phone: null, emergency_contact_relation: null,
    created_at: '2020-01-01', updated_at: '2020-01-01',
    ...extra,
  };
}

const seedEmployees: Employee[] = [
  // 대표이사실
  emp('e001', 'EMP-001', '이수태', 'dept-01', 'rank-8', 'title-8', 'regular', 15000000),
  emp('e002', 'EMP-002', '이민걸', 'dept-01', 'rank-7', 'title-7', 'regular', 12000000),
  emp('e003', 'EMP-003', '정진택', 'dept-01', 'rank-7', 'title-7', 'regular', 12000000),
  // 경영지원본부
  emp('e004', 'EMP-004', '김영수', 'dept-02', 'rank-6', 'title-5', 'regular', 9000000),
  // 인사팀
  emp('e010', 'EMP-010', '박지현', 'dept-14', 'rank-3', 'title-3', 'regular', 5000000),
  emp('e011', 'EMP-011', '임서연', 'dept-14', 'rank-2', 'title-1', 'regular', 3800000),
  emp('e012', 'EMP-012', '조현우', 'dept-14', 'rank-1', 'title-1', 'regular', 3200000),
  // 재무회계팀
  emp('e013', 'EMP-013', '장미경', 'dept-15', 'rank-3', 'title-3', 'regular', 5000000),
  emp('e014', 'EMP-014', '유승호', 'dept-15', 'rank-2', 'title-1', 'regular', 3800000),
  // 총무팀
  emp('e015', 'EMP-015', '오세진', 'dept-16', 'rank-3', 'title-3', 'regular', 5000000),
  // 영업본부
  emp('e016', 'EMP-016', '강태호', 'dept-03', 'rank-6', 'title-5', 'regular', 9000000),
  // 국내영업팀
  emp('e017', 'EMP-017', '윤재석', 'dept-17', 'rank-4', 'title-3', 'regular', 6000000),
  emp('e018', 'EMP-018', '배수민', 'dept-17', 'rank-2', 'title-1', 'regular', 3800000),
  // 해외영업팀
  emp('e019', 'EMP-019', '노형진', 'dept-18', 'rank-3', 'title-3', 'regular', 5000000),
  emp('e020', 'EMP-020', '하정민', 'dept-18', 'rank-1', 'title-1', 'regular', 3200000),
  // 기술연구소
  emp('e021', 'EMP-021', '송기원', 'dept-04', 'rank-6', 'title-6', 'regular', 9000000),
  // 연구개발팀
  emp('e022', 'EMP-022', '문성호', 'dept-19', 'rank-4', 'title-3', 'regular', 6000000),
  emp('e023', 'EMP-023', '신동혁', 'dept-19', 'rank-2', 'title-1', 'regular', 3800000),
  // 스크러버사업부
  emp('e024', 'EMP-024', '권혁준', 'dept-05', 'rank-5', 'title-5', 'regular', 7000000),
  // BWTS사업부
  emp('e025', 'EMP-025', '황인성', 'dept-06', 'rank-5', 'title-5', 'regular', 7000000),
  // 생산본부
  emp('e026', 'EMP-026', '안지훈', 'dept-09', 'rank-6', 'title-5', 'regular', 9000000),
  // 생산1팀
  emp('e027', 'EMP-027', '전상우', 'dept-20', 'rank-3', 'title-3', 'regular', 5000000),
  // 생산2팀
  emp('e028', 'EMP-028', '홍민기', 'dept-21', 'rank-3', 'title-3', 'regular', 5000000),
  // 품질관리팀
  emp('e029', 'EMP-029', '고승현', 'dept-10', 'rank-4', 'title-3', 'regular', 6000000),
  // HSE실
  emp('e030', 'EMP-030', '서재민', 'dept-13', 'rank-5', 'title-4', 'regular', 7000000),
  // 안전팀
  emp('e031', 'EMP-031', '정하늘', 'dept-22', 'rank-3', 'title-3', 'regular', 5000000),
];

const seedCareerHistories: CareerHistory[] = [];
const seedEducationHistories: EducationHistory[] = [];
const seedCertifications: Certification[] = [];
const seedFamilyMembers: FamilyMember[] = [];

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
  addEducationHistory: (item: EducationHistory) => void;
  addCertification: (item: Certification) => void;
  addFamilyMember: (item: FamilyMember) => void;
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
          departments: s.departments.filter((d) => d.id !== id),
        })),

      // Position Ranks
      addPositionRank: (rank) =>
        set((s) => ({ positionRanks: [...s.positionRanks, rank] })),

      updatePositionRank: (id, data) =>
        set((s) => ({
          positionRanks: s.positionRanks.map((r) =>
            r.id === id ? { ...r, ...data } : r,
          ),
        })),

      deletePositionRank: (id) =>
        set((s) => ({
          positionRanks: s.positionRanks.filter((r) => r.id !== id),
        })),

      // Position Titles
      addPositionTitle: (title) =>
        set((s) => ({ positionTitles: [...s.positionTitles, title] })),

      updatePositionTitle: (id, data) =>
        set((s) => ({
          positionTitles: s.positionTitles.map((t) =>
            t.id === id ? { ...t, ...data } : t,
          ),
        })),

      deletePositionTitle: (id) =>
        set((s) => ({
          positionTitles: s.positionTitles.filter((t) => t.id !== id),
        })),

      // Job Categories
      addJobCategory: (category) =>
        set((s) => ({ jobCategories: [...s.jobCategories, category] })),

      updateJobCategory: (id, data) =>
        set((s) => ({
          jobCategories: s.jobCategories.map((c) =>
            c.id === id ? { ...c, ...data } : c,
          ),
        })),

      deleteJobCategory: (id) =>
        set((s) => ({
          jobCategories: s.jobCategories.filter((c) => c.id !== id),
        })),

      // Salary Grades
      addSalaryGrade: (grade) =>
        set((s) => ({ salaryGrades: [...s.salaryGrades, grade] })),

      updateSalaryGrade: (id, data) =>
        set((s) => ({
          salaryGrades: s.salaryGrades.map((g) =>
            g.id === id ? { ...g, ...data } : g,
          ),
        })),

      deleteSalaryGrade: (id) =>
        set((s) => ({
          salaryGrades: s.salaryGrades.filter((g) => g.id !== id),
        })),

      addCareerHistory: (item) =>
        set((s) => ({ careerHistories: [...s.careerHistories, item] })),
      addEducationHistory: (item) =>
        set((s) => ({ educationHistories: [...s.educationHistories, item] })),
      addCertification: (item) =>
        set((s) => ({ certifications: [...s.certifications, item] })),
      addFamilyMember: (item) =>
        set((s) => ({ familyMembers: [...s.familyMembers, item] })),

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
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        if (version < 2) {
          return {};
        }
        return persisted as Record<string, unknown>;
      },
    },
  ),
);
