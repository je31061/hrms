'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateAnnualLeave } from '@/lib/utils/leave-calculator';
import type {
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  LeaveBalanceAdjustment,
} from '@/types';

// ---- Demo employees (matches organization/page.tsx) ----

export interface DemoEmployee {
  id: string;
  name: string;
  department: string;
  hire_date: string;
  position_rank: string;
}

export const demoEmployees: DemoEmployee[] = [
  // 대표이사실
  { id: 'e001', name: '이수태', department: '대표이사실', hire_date: '2005-03-02', position_rank: '회장' },
  { id: 'e002', name: '이민걸', department: '대표이사실', hire_date: '2008-01-02', position_rank: '대표이사' },
  { id: 'e003', name: '정진택', department: '대표이사실', hire_date: '2010-03-01', position_rank: '대표이사' },
  // 경영지원본부
  { id: 'e004', name: '김영수', department: '경영지원본부', hire_date: '2012-02-01', position_rank: '이사' },
  // 인사팀
  { id: 'e010', name: '박지현', department: '인사팀', hire_date: '2017-03-02', position_rank: '과장' },
  { id: 'e011', name: '임서연', department: '인사팀', hire_date: '2019-07-01', position_rank: '대리' },
  { id: 'e012', name: '조현우', department: '인사팀', hire_date: '2022-03-02', position_rank: '사원' },
  { id: 'e032', name: '최은비', department: '인사팀', hire_date: '2020-09-01', position_rank: '대리' },
  { id: 'e033', name: '한동훈', department: '인사팀', hire_date: '2024-01-02', position_rank: '사원' },
  // 재무회계팀
  { id: 'e013', name: '장미경', department: '재무회계팀', hire_date: '2016-01-04', position_rank: '과장' },
  { id: 'e014', name: '유승호', department: '재무회계팀', hire_date: '2019-03-04', position_rank: '대리' },
  { id: 'e034', name: '이소라', department: '재무회계팀', hire_date: '2021-02-01', position_rank: '대리' },
  { id: 'e035', name: '김태현', department: '재무회계팀', hire_date: '2023-09-01', position_rank: '사원' },
  // 총무팀
  { id: 'e015', name: '오세진', department: '총무팀', hire_date: '2015-06-01', position_rank: '과장' },
  { id: 'e036', name: '나현정', department: '총무팀', hire_date: '2021-06-01', position_rank: '대리' },
  { id: 'e037', name: '류진우', department: '총무팀', hire_date: '2024-03-04', position_rank: '사원' },
  // 영업본부
  { id: 'e016', name: '강태호', department: '영업본부', hire_date: '2011-04-01', position_rank: '이사' },
  // 국내영업팀
  { id: 'e017', name: '윤재석', department: '국내영업팀', hire_date: '2014-05-01', position_rank: '차장' },
  { id: 'e018', name: '배수민', department: '국내영업팀', hire_date: '2019-09-02', position_rank: '대리' },
  { id: 'e038', name: '정유리', department: '국내영업팀', hire_date: '2020-03-02', position_rank: '대리' },
  { id: 'e039', name: '김동현', department: '국내영업팀', hire_date: '2023-01-02', position_rank: '사원' },
  { id: 'e040', name: '송지아', department: '국내영업팀', hire_date: '2025-03-03', position_rank: '사원' },
  // 해외영업팀
  { id: 'e019', name: '노형진', department: '해외영업팀', hire_date: '2016-07-01', position_rank: '과장' },
  { id: 'e020', name: '하정민', department: '해외영업팀', hire_date: '2022-07-01', position_rank: '사원' },
  { id: 'e041', name: '이준영', department: '해외영업팀', hire_date: '2017-01-02', position_rank: '과장' },
  { id: 'e042', name: '박소영', department: '해외영업팀', hire_date: '2020-01-02', position_rank: '대리' },
  { id: 'e043', name: '알렉스 킴', department: '해외영업팀', hire_date: '2021-04-01', position_rank: '대리' },
  { id: 'e044', name: '김하은', department: '해외영업팀', hire_date: '2024-07-01', position_rank: '사원' },
  // 기술연구소
  { id: 'e021', name: '송기원', department: '기술연구소', hire_date: '2010-06-01', position_rank: '이사' },
  // 연구개발팀
  { id: 'e022', name: '문성호', department: '연구개발팀', hire_date: '2014-09-01', position_rank: '차장' },
  { id: 'e023', name: '신동혁', department: '연구개발팀', hire_date: '2019-01-02', position_rank: '대리' },
  { id: 'e045', name: '이재훈', department: '연구개발팀', hire_date: '2016-03-02', position_rank: '과장' },
  { id: 'e046', name: '김민지', department: '연구개발팀', hire_date: '2020-07-01', position_rank: '대리' },
  { id: 'e047', name: '최영진', department: '연구개발팀', hire_date: '2021-01-04', position_rank: '대리' },
  { id: 'e048', name: '윤서현', department: '연구개발팀', hire_date: '2023-03-02', position_rank: '사원' },
  { id: 'e049', name: '박준서', department: '연구개발팀', hire_date: '2024-09-02', position_rank: '사원' },
  { id: 'e050', name: '정다은', department: '연구개발팀', hire_date: '2025-09-01', position_rank: '사원' },
  // 스크러버사업부
  { id: 'e024', name: '권혁준', department: '스크러버사업부', hire_date: '2013-02-01', position_rank: '부장' },
  { id: 'e051', name: '이상훈', department: '스크러버사업부', hire_date: '2015-03-02', position_rank: '차장' },
  { id: 'e052', name: '장세진', department: '스크러버사업부', hire_date: '2017-09-01', position_rank: '과장' },
  { id: 'e053', name: '김광호', department: '스크러버사업부', hire_date: '2020-03-02', position_rank: '대리' },
  { id: 'e054', name: '오진수', department: '스크러버사업부', hire_date: '2021-07-01', position_rank: '대리' },
  { id: 'e055', name: '한미래', department: '스크러버사업부', hire_date: '2023-07-03', position_rank: '사원' },
  { id: 'e056', name: '백승우', department: '스크러버사업부', hire_date: '2024-03-04', position_rank: '사원' },
  // BWTS사업부
  { id: 'e025', name: '황인성', department: 'BWTS사업부', hire_date: '2013-06-03', position_rank: '부장' },
  { id: 'e057', name: '조민우', department: 'BWTS사업부', hire_date: '2016-09-01', position_rank: '과장' },
  { id: 'e058', name: '강수빈', department: 'BWTS사업부', hire_date: '2018-01-02', position_rank: '과장' },
  { id: 'e059', name: '임지호', department: 'BWTS사업부', hire_date: '2020-09-01', position_rank: '대리' },
  { id: 'e060', name: '서예린', department: 'BWTS사업부', hire_date: '2022-01-03', position_rank: '대리' },
  { id: 'e061', name: '양현우', department: 'BWTS사업부', hire_date: '2023-09-01', position_rank: '사원' },
  { id: 'e062', name: '문지영', department: 'BWTS사업부', hire_date: '2025-01-02', position_rank: '사원' },
  // 연료공급사업부
  { id: 'e063', name: '김용태', department: '연료공급사업부', hire_date: '2015-01-05', position_rank: '차장' },
  { id: 'e064', name: '박성민', department: '연료공급사업부', hire_date: '2018-03-05', position_rank: '과장' },
  { id: 'e065', name: '이다영', department: '연료공급사업부', hire_date: '2021-01-04', position_rank: '대리' },
  { id: 'e066', name: '최재혁', department: '연료공급사업부', hire_date: '2023-03-02', position_rank: '사원' },
  { id: 'e067', name: '정수연', department: '연료공급사업부', hire_date: '2025-01-02', position_rank: '사원' },
  // 계측제어사업부
  { id: 'e068', name: '윤상철', department: '계측제어사업부', hire_date: '2014-07-01', position_rank: '차장' },
  { id: 'e069', name: '이민수', department: '계측제어사업부', hire_date: '2017-06-01', position_rank: '과장' },
  { id: 'e070', name: '김지원', department: '계측제어사업부', hire_date: '2020-07-01', position_rank: '대리' },
  { id: 'e071', name: '박현수', department: '계측제어사업부', hire_date: '2023-01-02', position_rank: '사원' },
  { id: 'e072', name: '한소율', department: '계측제어사업부', hire_date: '2025-07-01', position_rank: '사원' },
  // 생산본부
  { id: 'e026', name: '안지훈', department: '생산본부', hire_date: '2011-01-03', position_rank: '이사' },
  // 생산1팀
  { id: 'e027', name: '전상우', department: '생산1팀', hire_date: '2015-02-02', position_rank: '과장' },
  { id: 'e073', name: '김철민', department: '생산1팀', hire_date: '2016-04-01', position_rank: '과장' },
  { id: 'e074', name: '이종석', department: '생산1팀', hire_date: '2018-09-03', position_rank: '대리' },
  { id: 'e075', name: '박성준', department: '생산1팀', hire_date: '2019-04-01', position_rank: '대리' },
  { id: 'e076', name: '오태영', department: '생산1팀', hire_date: '2020-01-02', position_rank: '대리' },
  { id: 'e077', name: '강민호', department: '생산1팀', hire_date: '2022-01-03', position_rank: '사원' },
  { id: 'e078', name: '정호진', department: '생산1팀', hire_date: '2023-03-02', position_rank: '사원' },
  { id: 'e079', name: '서형석', department: '생산1팀', hire_date: '2024-01-02', position_rank: '사원' },
  { id: 'e080', name: '임도현', department: '생산1팀', hire_date: '2025-03-03', position_rank: '사원' },
  // 생산2팀
  { id: 'e028', name: '홍민기', department: '생산2팀', hire_date: '2015-06-01', position_rank: '과장' },
  { id: 'e081', name: '유재원', department: '생산2팀', hire_date: '2017-01-02', position_rank: '과장' },
  { id: 'e082', name: '이경태', department: '생산2팀', hire_date: '2019-01-02', position_rank: '대리' },
  { id: 'e083', name: '김한솔', department: '생산2팀', hire_date: '2020-03-02', position_rank: '대리' },
  { id: 'e084', name: '박진성', department: '생산2팀', hire_date: '2022-03-02', position_rank: '사원' },
  { id: 'e085', name: '윤태호', department: '생산2팀', hire_date: '2023-01-02', position_rank: '사원' },
  { id: 'e086', name: '최진혁', department: '생산2팀', hire_date: '2024-07-01', position_rank: '사원' },
  { id: 'e087', name: '조영준', department: '생산2팀', hire_date: '2025-07-01', position_rank: '사원' },
  // 품질관리팀
  { id: 'e029', name: '고승현', department: '품질관리팀', hire_date: '2014-03-03', position_rank: '차장' },
  { id: 'e088', name: '정현아', department: '품질관리팀', hire_date: '2017-03-02', position_rank: '과장' },
  { id: 'e089', name: '이우진', department: '품질관리팀', hire_date: '2020-01-02', position_rank: '대리' },
  { id: 'e090', name: '김나연', department: '품질관리팀', hire_date: '2023-07-03', position_rank: '사원' },
  { id: 'e091', name: '박시현', department: '품질관리팀', hire_date: '2025-03-03', position_rank: '사원' },
  // 조달구매본부
  { id: 'e092', name: '이한규', department: '조달구매본부', hire_date: '2013-04-01', position_rank: '부장' },
  { id: 'e093', name: '김민수', department: '조달구매본부', hire_date: '2018-01-02', position_rank: '과장' },
  { id: 'e094', name: '서지연', department: '조달구매본부', hire_date: '2021-03-02', position_rank: '대리' },
  { id: 'e095', name: '윤태영', department: '조달구매본부', hire_date: '2024-01-02', position_rank: '사원' },
  // 스마트서비스본부
  { id: 'e096', name: '장동건', department: '스마트서비스본부', hire_date: '2014-01-02', position_rank: '부장' },
  { id: 'e097', name: '이승재', department: '스마트서비스본부', hire_date: '2018-07-02', position_rank: '과장' },
  { id: 'e098', name: '최유진', department: '스마트서비스본부', hire_date: '2021-01-04', position_rank: '대리' },
  { id: 'e099', name: '박준혁', department: '스마트서비스본부', hire_date: '2023-09-01', position_rank: '사원' },
  { id: 'e100', name: '김서윤', department: '스마트서비스본부', hire_date: '2025-09-01', position_rank: '사원' },
  // HSE실
  { id: 'e030', name: '서재민', department: 'HSE실', hire_date: '2013-09-02', position_rank: '부장' },
  // 안전팀
  { id: 'e031', name: '정하늘', department: '안전팀', hire_date: '2016-01-04', position_rank: '과장' },
  { id: 'e101', name: '오경환', department: '안전팀', hire_date: '2020-01-02', position_rank: '대리' },
  { id: 'e102', name: '김현진', department: '안전팀', hire_date: '2024-03-04', position_rank: '사원' },
  // 공무팀
  { id: 'e103', name: '박영호', department: '공무팀', hire_date: '2016-03-02', position_rank: '과장' },
  { id: 'e104', name: '이동근', department: '공무팀', hire_date: '2020-09-01', position_rank: '대리' },
  { id: 'e105', name: '한승민', department: '공무팀', hire_date: '2025-01-02', position_rank: '사원' },
];

// ---- Default leave types ----

const defaultLeaveTypes: LeaveType[] = [
  { id: 'lt-annual', name: '연차', code: 'annual', is_paid: true, max_days: 25, is_active: true },
  { id: 'lt-sick', name: '병가', code: 'sick', is_paid: true, max_days: 60, is_active: true },
  { id: 'lt-condolence', name: '경조사휴가', code: 'condolence', is_paid: true, max_days: null, is_active: true },
  { id: 'lt-maternity', name: '출산휴가', code: 'maternity', is_paid: true, max_days: 90, is_active: true },
  { id: 'lt-paternity', name: '배우자출산휴가', code: 'paternity', is_paid: true, max_days: 10, is_active: true },
  { id: 'lt-other', name: '기타', code: 'other', is_paid: false, max_days: null, is_active: true },
];

// ---- Default balances (25 employees × 2026, all hired 2020-01-01 → 17 days annual) ----

function generateDefaultBalances(): LeaveBalance[] {
  const balances: LeaveBalance[] = [];
  const usedDaysMap: Record<string, number> = {
    e001: 3, e002: 5, e003: 7, e004: 2, e010: 5, e011: 3, e012: 1, e013: 9,
    e014: 2, e015: 4, e016: 6, e017: 8, e018: 3, e019: 5, e020: 1, e021: 3,
    e022: 5, e023: 2, e024: 7, e025: 4, e026: 2, e027: 6, e028: 5, e029: 3,
    e030: 2, e031: 1, e032: 4, e033: 0, e034: 3, e035: 1, e036: 2, e037: 0,
    e038: 5, e039: 1, e040: 0, e041: 4, e042: 3, e043: 6, e044: 0, e045: 7,
    e046: 2, e047: 3, e048: 1, e049: 0, e050: 0, e051: 8, e052: 5, e053: 3,
    e054: 2, e055: 1, e056: 0, e057: 6, e058: 4, e059: 3, e060: 1, e061: 0,
    e062: 0, e063: 7, e064: 4, e065: 2, e066: 1, e067: 0, e068: 5, e069: 3,
    e070: 2, e071: 1, e072: 0, e073: 6, e074: 4, e075: 3, e076: 5, e077: 2,
    e078: 1, e079: 0, e080: 0, e081: 5, e082: 3, e083: 4, e084: 2, e085: 1,
    e086: 0, e087: 0, e088: 3, e089: 2, e090: 1, e091: 0, e092: 6, e093: 4,
    e094: 2, e095: 0, e096: 5, e097: 3, e098: 2, e099: 1, e100: 0, e101: 3,
    e102: 0, e103: 4, e104: 2, e105: 0,
  };

  for (const emp of demoEmployees) {
    const totalAnnual = calculateAnnualLeave(new Date(emp.hire_date), new Date('2026-02-26'));
    const used = usedDaysMap[emp.id] ?? 0;
    // Annual leave balance
    balances.push({
      id: `lb-${emp.id}-annual`,
      employee_id: emp.id,
      leave_type_id: 'lt-annual',
      year: 2026,
      total_days: totalAnnual,
      used_days: used,
      remaining_days: totalAnnual - used,
    });
    // Sick leave balance
    balances.push({
      id: `lb-${emp.id}-sick`,
      employee_id: emp.id,
      leave_type_id: 'lt-sick',
      year: 2026,
      total_days: 60,
      used_days: 0,
      remaining_days: 60,
    });
  }
  return balances;
}

// ---- Default requests (8 samples) ----

const defaultLeaveRequests: LeaveRequest[] = [
  // Pending
  { id: 'lr-001', employee_id: 'e022', leave_type_id: 'lt-annual', start_date: '2026-03-05', end_date: '2026-03-05', days: 1, reason: '개인 사유', status: 'pending', approval_id: null, created_at: '2026-02-25' },
  { id: 'lr-002', employee_id: 'e021', leave_type_id: 'lt-annual', start_date: '2026-03-09', end_date: '2026-03-10', days: 2, reason: '가족여행', status: 'pending', approval_id: null, created_at: '2026-02-24' },
  { id: 'lr-003', employee_id: 'e036', leave_type_id: 'lt-sick', start_date: '2026-03-02', end_date: '2026-03-02', days: 1, reason: '병원 진료', status: 'pending', approval_id: null, created_at: '2026-02-26' },
  { id: 'lr-009', employee_id: 'e053', leave_type_id: 'lt-annual', start_date: '2026-03-12', end_date: '2026-03-13', days: 2, reason: '이사', status: 'pending', approval_id: null, created_at: '2026-03-01' },
  { id: 'lr-010', employee_id: 'e074', leave_type_id: 'lt-annual', start_date: '2026-03-16', end_date: '2026-03-16', days: 1, reason: '개인 사유', status: 'pending', approval_id: null, created_at: '2026-03-03' },
  { id: 'lr-011', employee_id: 'e098', leave_type_id: 'lt-sick', start_date: '2026-03-10', end_date: '2026-03-10', days: 1, reason: '치과 진료', status: 'pending', approval_id: null, created_at: '2026-03-05' },
  // Approved
  { id: 'lr-004', employee_id: 'e022', leave_type_id: 'lt-annual', start_date: '2026-01-27', end_date: '2026-01-28', days: 2, reason: '가정 사정', status: 'approved', approval_id: null, created_at: '2026-01-20' },
  { id: 'lr-005', employee_id: 'e022', leave_type_id: 'lt-sick', start_date: '2026-01-10', end_date: '2026-01-10', days: 1, reason: '병원 진료', status: 'approved', approval_id: null, created_at: '2026-01-09' },
  { id: 'lr-006', employee_id: 'e011', leave_type_id: 'lt-annual', start_date: '2026-02-02', end_date: '2026-02-03', days: 2, reason: '개인 사유', status: 'approved', approval_id: null, created_at: '2026-01-28' },
  { id: 'lr-012', employee_id: 'e045', leave_type_id: 'lt-annual', start_date: '2026-02-16', end_date: '2026-02-18', days: 3, reason: '가족여행', status: 'approved', approval_id: null, created_at: '2026-02-05' },
  { id: 'lr-013', employee_id: 'e057', leave_type_id: 'lt-annual', start_date: '2026-02-09', end_date: '2026-02-10', days: 2, reason: '경조사', status: 'approved', approval_id: null, created_at: '2026-02-01' },
  { id: 'lr-014', employee_id: 'e082', leave_type_id: 'lt-annual', start_date: '2026-01-20', end_date: '2026-01-21', days: 2, reason: '개인 사유', status: 'approved', approval_id: null, created_at: '2026-01-13' },
  { id: 'lr-015', employee_id: 'e092', leave_type_id: 'lt-annual', start_date: '2026-02-23', end_date: '2026-02-25', days: 3, reason: '해외출장 후 휴가', status: 'approved', approval_id: null, created_at: '2026-02-10' },
  { id: 'lr-016', employee_id: 'e038', leave_type_id: 'lt-annual', start_date: '2026-01-13', end_date: '2026-01-14', days: 2, reason: '개인 사유', status: 'approved', approval_id: null, created_at: '2026-01-06' },
  { id: 'lr-017', employee_id: 'e063', leave_type_id: 'lt-annual', start_date: '2026-02-02', end_date: '2026-02-04', days: 3, reason: '설 연휴 연장', status: 'approved', approval_id: null, created_at: '2026-01-22' },
  { id: 'lr-018', employee_id: 'e073', leave_type_id: 'lt-annual', start_date: '2026-02-23', end_date: '2026-02-24', days: 2, reason: '자녀 입학식', status: 'approved', approval_id: null, created_at: '2026-02-14' },
  // Rejected / Cancelled
  { id: 'lr-007', employee_id: 'e051', leave_type_id: 'lt-annual', start_date: '2026-02-16', end_date: '2026-02-17', days: 1, reason: '경조사', status: 'rejected', approval_id: null, created_at: '2026-02-10' },
  { id: 'lr-008', employee_id: 'e013', leave_type_id: 'lt-annual', start_date: '2026-02-09', end_date: '2026-02-10', days: 2, reason: '여행', status: 'cancelled', approval_id: null, created_at: '2026-02-01' },
  { id: 'lr-019', employee_id: 'e068', leave_type_id: 'lt-annual', start_date: '2026-01-15', end_date: '2026-01-16', days: 2, reason: '가족행사', status: 'rejected', approval_id: null, created_at: '2026-01-08' },
  { id: 'lr-020', employee_id: 'e089', leave_type_id: 'lt-annual', start_date: '2026-02-20', end_date: '2026-02-20', days: 1, reason: '개인 사유', status: 'cancelled', approval_id: null, created_at: '2026-02-13' },
];

// ---- Default adjustments ----

const defaultAdjustments: LeaveBalanceAdjustment[] = [
  { id: 'adj-001', employee_id: 'e005', leave_type_id: 'lt-annual', year: 2026, adjustment_days: 2, reason: '이월 연차', adjusted_by: 'HR', created_at: '2026-01-02' },
  { id: 'adj-002', employee_id: 'e035', leave_type_id: 'lt-annual', year: 2026, adjustment_days: -1, reason: '전년 미정산분 차감', adjusted_by: 'HR', created_at: '2026-01-05' },
];

// ---- Store types ----

interface LeaveState {
  leaveTypes: LeaveType[];
  leaveBalances: LeaveBalance[];
  leaveRequests: LeaveRequest[];
  balanceAdjustments: LeaveBalanceAdjustment[];
}

interface LeaveActions {
  // Leave type CRUD
  addLeaveType: (leaveType: LeaveType) => void;
  updateLeaveType: (id: string, data: Partial<LeaveType>) => void;
  deleteLeaveType: (id: string) => void;

  // Balance
  upsertLeaveBalance: (balance: LeaveBalance) => void;
  bulkGrantAnnualLeave: (employees: DemoEmployee[], year: number, refDate: Date) => void;

  // Adjustment
  addBalanceAdjustment: (adjustment: LeaveBalanceAdjustment) => void;

  // Requests
  addLeaveRequest: (request: LeaveRequest) => void;
  approveLeaveRequest: (id: string) => void;
  rejectLeaveRequest: (id: string) => void;
  cancelLeaveRequest: (id: string) => void;
}

export type LeaveStore = LeaveState & LeaveActions;

// ---- Store ----

export const useLeaveStore = create<LeaveStore>()(
  persist(
    (set) => ({
      // --- Initial State ---
      leaveTypes: defaultLeaveTypes,
      leaveBalances: generateDefaultBalances(),
      leaveRequests: defaultLeaveRequests,
      balanceAdjustments: defaultAdjustments,

      // --- Actions ---

      addLeaveType: (leaveType) =>
        set((s) => ({ leaveTypes: [...s.leaveTypes, leaveType] })),

      updateLeaveType: (id, data) =>
        set((s) => ({
          leaveTypes: s.leaveTypes.map((lt) =>
            lt.id === id ? { ...lt, ...data } : lt
          ),
        })),

      deleteLeaveType: (id) =>
        set((s) => ({
          leaveTypes: s.leaveTypes.filter((lt) => lt.id !== id),
        })),

      upsertLeaveBalance: (balance) =>
        set((s) => {
          const idx = s.leaveBalances.findIndex(
            (b) =>
              b.employee_id === balance.employee_id &&
              b.leave_type_id === balance.leave_type_id &&
              b.year === balance.year
          );
          if (idx >= 0) {
            const updated = [...s.leaveBalances];
            updated[idx] = balance;
            return { leaveBalances: updated };
          }
          return { leaveBalances: [...s.leaveBalances, balance] };
        }),

      bulkGrantAnnualLeave: (employees, year, refDate) =>
        set((s) => {
          const newBalances = [...s.leaveBalances];
          for (const emp of employees) {
            const totalDays = calculateAnnualLeave(new Date(emp.hire_date), refDate);
            const idx = newBalances.findIndex(
              (b) => b.employee_id === emp.id && b.leave_type_id === 'lt-annual' && b.year === year
            );
            if (idx >= 0) {
              const existing = newBalances[idx];
              newBalances[idx] = {
                ...existing,
                total_days: totalDays,
                remaining_days: totalDays - existing.used_days,
              };
            } else {
              newBalances.push({
                id: `lb-${emp.id}-annual-${year}`,
                employee_id: emp.id,
                leave_type_id: 'lt-annual',
                year,
                total_days: totalDays,
                used_days: 0,
                remaining_days: totalDays,
              });
            }
          }
          return { leaveBalances: newBalances };
        }),

      addBalanceAdjustment: (adjustment) =>
        set((s) => {
          const newBalances = s.leaveBalances.map((b) => {
            if (
              b.employee_id === adjustment.employee_id &&
              b.leave_type_id === adjustment.leave_type_id &&
              b.year === adjustment.year
            ) {
              return {
                ...b,
                total_days: b.total_days + adjustment.adjustment_days,
                remaining_days: b.remaining_days + adjustment.adjustment_days,
              };
            }
            return b;
          });
          return {
            balanceAdjustments: [...s.balanceAdjustments, adjustment],
            leaveBalances: newBalances,
          };
        }),

      addLeaveRequest: (request) =>
        set((s) => ({ leaveRequests: [...s.leaveRequests, request] })),

      approveLeaveRequest: (id) =>
        set((s) => {
          const req = s.leaveRequests.find((r) => r.id === id);
          if (!req || req.status !== 'pending') return s;

          const newRequests = s.leaveRequests.map((r) =>
            r.id === id ? { ...r, status: 'approved' as const } : r
          );

          const newBalances = s.leaveBalances.map((b) => {
            if (
              b.employee_id === req.employee_id &&
              b.leave_type_id === req.leave_type_id &&
              b.year === new Date(req.start_date).getFullYear()
            ) {
              return {
                ...b,
                used_days: b.used_days + req.days,
                remaining_days: b.remaining_days - req.days,
              };
            }
            return b;
          });

          return { leaveRequests: newRequests, leaveBalances: newBalances };
        }),

      rejectLeaveRequest: (id) =>
        set((s) => ({
          leaveRequests: s.leaveRequests.map((r) =>
            r.id === id && r.status === 'pending'
              ? { ...r, status: 'rejected' as const }
              : r
          ),
        })),

      cancelLeaveRequest: (id) =>
        set((s) => {
          const req = s.leaveRequests.find((r) => r.id === id);
          if (!req) return s;

          const newRequests = s.leaveRequests.map((r) =>
            r.id === id ? { ...r, status: 'cancelled' as const } : r
          );

          // If was approved, restore used_days
          if (req.status === 'approved') {
            const newBalances = s.leaveBalances.map((b) => {
              if (
                b.employee_id === req.employee_id &&
                b.leave_type_id === req.leave_type_id &&
                b.year === new Date(req.start_date).getFullYear()
              ) {
                return {
                  ...b,
                  used_days: b.used_days - req.days,
                  remaining_days: b.remaining_days + req.days,
                };
              }
              return b;
            });
            return { leaveRequests: newRequests, leaveBalances: newBalances };
          }

          return { leaveRequests: newRequests };
        }),
    }),
    {
      name: 'hrms-leave',
      version: 2,
      migrate: () => ({}),
    }
  )
);
