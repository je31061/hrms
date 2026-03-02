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
  Gender,
} from '@/types';

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const seedDepartments: Department[] = [
  { id: 'dept-01', name: '대표이사실', code: 'CEO', parent_id: null, level: 1, sort_order: 1, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-02', name: '경영지원본부', code: 'MGT', parent_id: null, level: 1, sort_order: 2, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-03', name: '개발본부', code: 'DEV', parent_id: null, level: 1, sort_order: 3, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-04', name: '영업본부', code: 'SALES', parent_id: null, level: 1, sort_order: 4, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-05', name: '인사팀', code: 'HR', parent_id: 'dept-02', level: 2, sort_order: 1, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-06', name: '재무팀', code: 'FIN', parent_id: 'dept-02', level: 2, sort_order: 2, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-07', name: '총무팀', code: 'GA', parent_id: 'dept-02', level: 2, sort_order: 3, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-08', name: '개발1팀', code: 'DEV1', parent_id: 'dept-03', level: 2, sort_order: 1, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-09', name: '개발2팀', code: 'DEV2', parent_id: 'dept-03', level: 2, sort_order: 2, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-10', name: 'QA팀', code: 'QA', parent_id: 'dept-03', level: 2, sort_order: 3, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-11', name: '국내영업팀', code: 'DOM', parent_id: 'dept-04', level: 2, sort_order: 1, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
  { id: 'dept-12', name: '해외영업팀', code: 'INTL', parent_id: 'dept-04', level: 2, sort_order: 2, is_active: true, created_at: '2020-01-01', updated_at: '2020-01-01' },
];

const seedPositionRanks: PositionRank[] = [
  { id: 'rank-1', name: '사원', level: 1, is_active: true },
  { id: 'rank-2', name: '대리', level: 2, is_active: true },
  { id: 'rank-3', name: '과장', level: 3, is_active: true },
  { id: 'rank-4', name: '차장', level: 4, is_active: true },
  { id: 'rank-5', name: '부장', level: 5, is_active: true },
  { id: 'rank-6', name: '이사', level: 6, is_active: true },
  { id: 'rank-7', name: '대표이사', level: 7, is_active: true },
];

const seedPositionTitles: PositionTitle[] = [
  { id: 'title-1', name: '팀원', level: 1, is_active: true },
  { id: 'title-2', name: '팀장', level: 2, is_active: true },
  { id: 'title-3', name: '실장', level: 3, is_active: true },
  { id: 'title-4', name: '본부장', level: 4, is_active: true },
];

// Helper to build employee
function emp(
  id: string, num: string, name: string, deptId: string, rankId: string, titleId: string,
  empType: EmploymentType, salary: number, extra?: Partial<Employee>,
): Employee {
  return {
    id, employee_number: num, name, name_en: null,
    email: `${id}@company.com`, phone: `010-0000-${id.replace('e0', '').padStart(4, '0')}`,
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
  emp('e001', 'EMP-001', '김대표', 'dept-01', 'rank-7', 'title-4', 'regular', 15000000),
  // 경영지원본부
  emp('e002', 'EMP-002', '이본부장', 'dept-02', 'rank-6', 'title-4', 'regular', 9000000),
  emp('e003', 'EMP-003', '박부장', 'dept-02', 'rank-5', 'title-2', 'regular', 7000000),
  // 개발본부
  emp('e004', 'EMP-004', '최본부장', 'dept-03', 'rank-6', 'title-4', 'regular', 9000000),
  emp('e005', 'EMP-005', '정부장', 'dept-03', 'rank-5', 'title-2', 'regular', 7000000),
  emp('e006', 'EMP-006', '한차장', 'dept-03', 'rank-4', 'title-1', 'regular', 6000000),
  // 영업본부
  emp('e007', 'EMP-007', '강본부장', 'dept-04', 'rank-6', 'title-4', 'regular', 9000000),
  emp('e008', 'EMP-008', '윤부장', 'dept-04', 'rank-5', 'title-2', 'regular', 7000000),
  // 인사팀
  emp('e010', 'EMP-010', '서팀장', 'dept-05', 'rank-3', 'title-2', 'regular', 5000000),
  emp('e011', 'EMP-011', '임대리', 'dept-05', 'rank-2', 'title-1', 'regular', 3800000),
  emp('e012', 'EMP-012', '조사원', 'dept-05', 'rank-1', 'title-1', 'regular', 3200000),
  // 재무팀
  emp('e013', 'EMP-013', '장팀장', 'dept-06', 'rank-3', 'title-2', 'regular', 5000000),
  emp('e014', 'EMP-014', '유대리', 'dept-06', 'rank-2', 'title-1', 'regular', 3800000),
  // 총무팀
  emp('e015', 'EMP-015', '오팀장', 'dept-07', 'rank-3', 'title-2', 'regular', 5000000),
  emp('e016', 'EMP-016', '배사원', 'dept-07', 'rank-1', 'title-1', 'regular', 3200000),
  // 개발1팀
  emp('e020', 'EMP-020', '문팀장', 'dept-08', 'rank-4', 'title-2', 'regular', 6000000),
  emp('e021', 'EMP-021', '신과장', 'dept-08', 'rank-3', 'title-1', 'regular', 5000000),
  emp('e022', 'EMP-022', '권대리', 'dept-08', 'rank-2', 'title-1', 'regular', 3800000, {
    email: 'kwon@company.com', phone: '010-2222-0022',
    birth_date: '1995-06-15', gender: 'M' as Gender,
    address: '서울시 강남구 테헤란로 123', address_detail: '456호',
    bank_account: '***-****-2022',
  }),
  // 개발2팀
  emp('e025', 'EMP-025', '황팀장', 'dept-09', 'rank-4', 'title-2', 'regular', 6000000),
  emp('e026', 'EMP-026', '안과장', 'dept-09', 'rank-3', 'title-1', 'regular', 5000000),
  // QA팀
  emp('e030', 'EMP-030', '송팀장', 'dept-10', 'rank-3', 'title-2', 'regular', 5000000),
  emp('e031', 'EMP-031', '전대리', 'dept-10', 'rank-2', 'title-1', 'regular', 3800000),
  // 국내영업팀
  emp('e035', 'EMP-035', '홍팀장', 'dept-11', 'rank-4', 'title-2', 'regular', 6000000),
  emp('e036', 'EMP-036', '고대리', 'dept-11', 'rank-2', 'title-1', 'regular', 3800000),
  // 해외영업팀
  emp('e040', 'EMP-040', '노팀장', 'dept-12', 'rank-3', 'title-2', 'regular', 5000000),
  emp('e041', 'EMP-041', '하사원', 'dept-12', 'rank-1', 'title-1', 'regular', 3200000),
];

const seedCareerHistories: CareerHistory[] = [
  { id: 'ch-1', employee_id: 'e022', company_name: '(주)이전회사', department: '개발팀', position: '사원', start_date: '2018-03-01', end_date: '2019-12-31', description: '웹 서비스 개발' },
];

const seedEducationHistories: EducationHistory[] = [
  { id: 'eh-1', employee_id: 'e022', school_name: '서울대학교', major: '컴퓨터공학', degree: 'bachelor', start_date: '2014-03-01', end_date: '2018-02-28', is_graduated: true },
];

const seedCertifications: Certification[] = [
  { id: 'cert-1', employee_id: 'e022', name: '정보처리기사', issuer: '한국산업인력공단', issue_date: '2019-06-15', expiry_date: null, certificate_number: '19-123456' },
];

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
}

interface EmployeeActions {
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addDepartment: (department: Department) => void;
  updateDepartment: (id: string, data: Partial<Department>) => void;

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
    { name: 'hrms-employees' },
  ),
);
