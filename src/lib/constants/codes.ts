export const ATTENDANCE_STATUS = {
  normal: '정상',
  late: '지각',
  early_leave: '조퇴',
  absent: '결근',
  holiday: '휴일',
  leave: '휴가',
} as const;

export const LEAVE_REQUEST_STATUS = {
  pending: '대기',
  approved: '승인',
  rejected: '반려',
  cancelled: '취소',
} as const;

export const PAYROLL_STATUS = {
  draft: '작성중',
  confirmed: '확정',
  paid: '지급완료',
} as const;

export const APPOINTMENT_TYPES = {
  promotion: '승진',
  transfer: '전보',
  title_change: '직책변경',
  hire: '입사',
  resignation: '퇴사',
  other: '기타',
} as const;

export const APPROVAL_STATUS = {
  pending: '대기',
  in_progress: '진행중',
  approved: '승인',
  rejected: '반려',
  cancelled: '취소',
} as const;

export const JOB_POSTING_STATUS = {
  draft: '작성중',
  open: '진행중',
  closed: '마감',
  cancelled: '취소',
} as const;

export const APPLICANT_STAGES = {
  applied: '지원',
  screening: '서류심사',
  interview: '면접',
  offer: '제안',
  hired: '채용',
  rejected: '불합격',
} as const;

export const TRAINING_STATUS = {
  planned: '예정',
  in_progress: '진행중',
  completed: '완료',
  cancelled: '취소',
} as const;

export const EVALUATION_STATUS = {
  draft: '작성중',
  in_progress: '진행중',
  completed: '완료',
} as const;

export const EVAL_GRADES = ['S', 'A', 'B', 'C', 'D'] as const;

export const WORK_SCHEDULE_TYPES = {
  fixed: '고정근무',
  staggered: '시차출퇴근제',
  selective: '선택적 근로시간제',
  remote: '재택근무제',
  flexible: '탄력적 근로시간제',
  compressed: '집중근무제',
} as const;

export const HOLIDAY_TYPES = {
  legal: '법정공휴일',
  substitute: '대체공휴일',
  company: '회사지정휴일',
} as const;

export const LEAVE_TYPE_CODES = {
  annual: '연차',
  sick: '병가',
  condolence: '경조사휴가',
  maternity: '출산휴가',
  paternity: '배우자출산휴가',
  other: '기타',
} as const;

export const UNUSED_LEAVE_POLICIES = {
  carryover: '이월',
  payout: '수당지급',
} as const;

export const APPROVAL_DOCUMENT_TYPES = {
  leave: '휴가',
  expense: '경비',
  appointment: '인사발령',
  overtime: '시간외근무',
  business_trip: '출장',
} as const;
