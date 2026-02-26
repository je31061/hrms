# HRMS - 인사관리시스템

Next.js 기반의 종합 인사관리시스템(Human Resource Management System)입니다.

## 기술 스택

- **프레임워크**: Next.js 16 (App Router), React 19, TypeScript
- **상태관리**: Zustand (persist middleware)
- **UI**: shadcn/ui (Radix UI), Tailwind CSS 4, Lucide Icons
- **차트**: Recharts
- **DB**: Supabase
- **기타**: date-fns, Sonner (toast), React Hook Form, Zod

## 주요 모듈

| 모듈 | 경로 | 설명 |
|------|------|------|
| 대시보드 | `/` | 인원 현황, 부서별 차트, 최근 이벤트 |
| 조직도 | `/organization` | 조직 트리, 부서 카드, 시뮬레이션(드래그&드롭) |
| 인사정보 | `/employees` | 직원 목록/상세/등록/수정 |
| 근태관리 | `/attendance` | 일별 출퇴근, 월별 리포트 |
| **휴가관리** | **`/leave`** | **연차 잔액 조회, 휴가 신청/승인, 개인별 현황** |
| 급여관리 | `/payroll` | 급여 목록, 급여 계산, 급여명세서 |
| 인사발령 | `/appointments` | 승진/전보/직책변경 발령 |
| 전자결재 | `/approval` | 결재 워크플로우 |
| 채용관리 | `/recruitment` | 채용공고, 지원자 관리 |
| 교육관리 | `/training` | 교육 프로그램, 수강 관리 |
| 평가관리 | `/evaluation` | 인사평가 (자기/동료/상사) |
| 설정 | `/settings` | 시스템 설정 (근무/휴가/급여/결재/공휴일 등) |

---

## 연차 관리 기능

### 개요

근로기준법 제60조에 따른 연차 자동계산을 기반으로, 개인별 연차 잔액 관리, 휴가 신청/승인 워크플로우, HR 관리 기능을 제공합니다. Zustand 스토어(`leave-store.ts`)로 상태를 관리하며, localStorage에 자동 저장됩니다.

### 연차 자동계산 규칙

| 근속 기간 | 연차 일수 |
|-----------|-----------|
| 1년 미만 | 월 1일 (최대 11일) |
| 1년 이상 | 15일 |
| 3년 이상 | 매 2년마다 +1일 |
| 상한 | 최대 25일 |

> `src/lib/utils/leave-calculator.ts`의 `calculateAnnualLeave()` 함수에서 계산합니다.

### 직원 화면 (`/leave`)

- **잔액 카드**: 활성화된 모든 휴가 유형별 총일수/사용/잔여 + 소진율 Progress 바
- **휴가 신청**: Dialog 폼에서 유형 선택 → 시작/종료일 입력 → 영업일 자동계산 (주말·공휴일 제외)
  - 반차(0.5일), 반반차(0.25일) 지원 (시스템 설정에서 활성화 시)
  - 잔여일수 초과 시 경고 표시 및 신청 차단
- **신청 내역**: 전체 이력 테이블 (유형, 기간, 일수, 상태, 신청일)
- **취소 기능**: 대기 중 또는 승인된 요청을 취소 가능 (승인 건 취소 시 잔액 자동 복원)

### HR 관리 화면 (`/leave/admin`)

3개 탭으로 구성됩니다.

#### 탭 1: 승인 대기

대기 중인 휴가 요청을 목록으로 표시합니다.

- 신청자, 부서, 유형, 기간, 일수, 사유, 신청일 확인
- **승인** 버튼: 요청 승인 + 해당 직원 잔액에서 사용일수 자동 차감
- **반려** 버튼: 요청 반려 (잔액 변동 없음)

#### 탭 2: 개인별 연차 현황

전 직원의 연차 사용 현황을 한눈에 파악합니다.

- **요약 카드 3개**: 전체 직원수 / 평균 소진율 / 잔여 3일 미만 직원수
- **검색**: 이름 또는 부서로 필터링
- **직원 테이블**: 이름, 부서, 입사일, 총연차, 사용, 잔여, 소진율(Progress 바)
- **직원 상세 다이얼로그** (행 클릭 시):
  - 직원 기본정보 (부서, 직급, 입사일, 근속연수)
  - 유형별 잔액 카드 (Progress 바로 소진율 표시)
  - 잔액 수동 조정 폼 (유형 선택, +/- 일수, 사유 입력, 조정 후 예상 잔액 미리보기)
  - 조정 이력 테이블
  - 휴가 사용 이력 테이블
- **연차 일괄 부여**: 전 직원에게 입사일 기준 연차를 자동 계산하여 일괄 부여
  - 미리보기 테이블에서 직원별 계산 연차, 현재 잔액, 차이 확인 후 부여

#### 탭 3: 연차 설정

- **휴가 유형 관리**: 유형 추가/수정/삭제, 유급/무급 구분, 최대일수 설정, 활성/비활성 토글
- 기본 6개 유형: 연차, 병가, 경조사휴가, 출산휴가, 배우자출산휴가, 기타
- 연차 정책(반차 허용, 미사용 연차 처리 등)은 시스템 설정(`/settings`) 페이지에서 관리

### 데이터 흐름

```
직원: 휴가 신청
  └→ addLeaveRequest() → store에 status='pending' 추가
      │
HR: 승인 대기 탭에서 확인
  ├→ 승인: approveLeaveRequest()
  │   └→ status='approved' + 잔액 used_days 증가, remaining_days 감소
  ├→ 반려: rejectLeaveRequest()
  │   └→ status='rejected' (잔액 변동 없음)
  └→ 직원이 취소: cancelLeaveRequest()
      └→ status='cancelled' (승인 건이면 잔액 복원)

HR: 잔액 수동 조정
  └→ addBalanceAdjustment()
      └→ 잔액 total_days/remaining_days 변경 + 조정 이력 기록

HR: 연차 일괄 부여
  └→ bulkGrantAnnualLeave(employees, year, refDate)
      └→ calculateAnnualLeave()로 전 직원 연차 재계산 → 잔액 업데이트
```

### 관련 파일 구조

```
src/
├── types/index.ts                              # LeaveType, LeaveBalance, LeaveRequest, LeaveBalanceAdjustment
├── lib/
│   ├── constants/codes.ts                      # LEAVE_REQUEST_STATUS, LEAVE_TYPE_CODES
│   ├── utils/leave-calculator.ts               # calculateAnnualLeave(), calculateBusinessDays()
│   ├── stores/leave-store.ts                   # Zustand 연차 스토어 (상태 + 액션 + 데모 데이터)
│   └── hooks/use-leave.ts                      # useLeaveStore, useEmployeeLeave, usePendingRequests
├── components/leave/
│   ├── leave-request-form.tsx                  # 휴가 신청 폼
│   ├── balance-adjustment-form.tsx             # HR 잔액 수동 조정 폼
│   ├── employee-leave-detail.tsx               # 개인별 연차 상세 다이얼로그
│   ├── leave-type-management.tsx               # 휴가 유형 CRUD 관리
│   └── bulk-grant-dialog.tsx                   # 연차 일괄 부여 다이얼로그
├── components/settings/
│   └── leave-policy-settings.tsx               # 연차 정책 설정 (반차, 이월 등)
└── app/leave/
    ├── page.tsx                                # 직원용 휴가관리 페이지
    └── admin/page.tsx                          # HR 관리 페이지 (3탭)
```

### 시스템 설정 연동

| 설정 항목 | 위치 | 연동 |
|-----------|------|------|
| `allow_half_day` | 설정 > 연차 정책 | 휴가 신청 폼에서 반차(0.5일) 옵션 표시 |
| `allow_quarter_day` | 설정 > 연차 정책 | 휴가 신청 폼에서 반반차(0.25일) 옵션 표시 |
| `holidays` | 설정 > 공휴일 관리 | 영업일 계산 시 공휴일 제외 |
| `auto_grant_annual` | 설정 > 연차 정책 | 연차 자동부여 여부 |
| `unused_leave_policy` | 설정 > 연차 정책 | 미사용 연차 처리 (이월/수당지급) |
| `condolenceLeaveRules` | 설정 > 경조사 규정 | 경조사휴가 일수 기준 |

---

## 급여 관리 기능

### 개요

관리자가 지급/공제 항목을 자유롭게 구성하고, 급여 계산 시 각 항목의 계산식을 실시간으로 확인할 수 있는 급여 시스템입니다. Zustand 스토어(`payroll-store.ts`)로 항목 설정과 급여 이력을 관리합니다.

### 급여 항목 설정 (관리자 옵션)

관리자가 급여 계산에 포함할 항목을 직접 선택/관리할 수 있습니다.

**지급 항목 (기본 10개)**

| 항목 | 계산방식 | 과세 | 기본값 | 기본 활성 |
|------|----------|------|--------|-----------|
| 기본급 | 고정 | 과세 | 직원별 | O |
| 식대 | 고정 | 비과세 | 200,000원 | O |
| 교통비 | 고정 | 비과세 | 200,000원 | O |
| 직책수당 | 고정 | 과세 | 0원 | O |
| 연장근로수당 | 시간×배율 | 과세 | ×1.5 | O |
| 야간근로수당 | 시간×배율 | 과세 | ×0.5 | O |
| 휴일근로수당 | 시간×배율 | 과세 | ×1.5 | O |
| 자격수당 | 고정 | 과세 | 0원 | X |
| 가족수당 | 고정 | 과세 | 0원 | X |
| 상여금 | 고정 | 과세 | 0원 | X |

**공제 항목 (6개, 자동계산)**

| 항목 | 계산식 |
|------|--------|
| 국민연금 | min(과세소득, 5,900,000) × 4.5% |
| 건강보험 | 과세소득 × 3.545% |
| 장기요양보험 | 건강보험료 × 12.95% |
| 고용보험 | 과세소득 × 0.9% |
| 소득세 | 간이세액표 기반 (연환산 → 세율적용 → 월할) |
| 지방소득세 | 소득세 × 10% |

- 모든 항목을 **활성/비활성 토글** 가능
- 관리자가 **커스텀 항목 추가/수정/삭제** 가능
- 계산방식: 고정금액 / 시간×배율 / 자동계산 중 선택
- 시스템 항목(기본급, 4대보험, 세금)은 삭제 불가, 토글만 가능

### 급여 계산 페이지 (`/payroll/calculate`)

- **직원 선택** → 기본급, 통상시급(기본급 ÷ 209시간) 자동 표시
- **지급 항목 체크박스**: 각 항목 개별 선택/해제, 금액 입력
  - 고정 항목: 금액 직접 입력
  - 시간×배율 항목: 시간 입력 → 자동 계산 (통상시급 × 배율 × 시간)
- **부양가족 수** 입력 (소득세 계산 반영)
- **계산 결과**에서 모든 항목의 **계산식을 실시간 표시**:

```
지급 내역:
  기본급         3,800,000원
  │ 3,800,000원 (기본급)
  식대             200,000원 [비과세]
  │ 200,000원 (비과세)
  연장근로수당     272,727원
  │ 18,182원(시급) × 1.5 × 10시간 = 272,727원

공제 내역:
  국민연금         183,273원
  │ min(4,072,727, 5,900,000) × 4.5%
  │ = 4,072,727 × 4.5% = 183,273원
  건강보험         144,378원
  │ 4,072,727 × 3.545% = 144,378원
  장기요양보험      18,697원
  │ 144,378(건강보험료) × 12.95% = 18,697원
  소득세           158,330원
  │ 연 과세소득 48,872,724원 → 근로소득공제 → 인적공제(1인)
  │ → 세율 적용 → 월할 = 158,330원
  지방소득세        15,833원
  │ 158,330(소득세) × 10% = 15,833원
```

- **계산식 접기/펼치기** 토글로 간결하게 전환 가능
- 계산 후 **급여 저장** → 급여 대장에 반영

### 급여 목록 (`/payroll`)

- 연도/월 필터로 조회
- 요약 카드: 총 지급액, 총 공제액, 총 실수령액
- 급여 대장 테이블: 직원별 기본급/지급/공제/실수령 + 상태
- 상태 관리: `작성중` → `확정` → `지급완료` 단계별 진행
- 급여명세서 보기, 삭제 (작성중 상태만)

### 급여명세서 (`/payroll/payslip/[id]`)

- 직원 정보 + 지급/공제 항목 양쪽 표시
- 각 항목에 **계산식 표시** (어떻게 산출되었는지 투명하게 확인)
- 인쇄 기능

### 관련 파일 구조

```
src/
├── types/index.ts                              # PayrollItemConfig, SavedPayroll, PayrollLineItem
├── lib/
│   ├── stores/payroll-store.ts                 # Zustand 급여 스토어 (항목 설정 + 급여 이력)
│   ├── utils/korean-tax.ts                     # 소득세 계산 (간이세액표)
│   └── utils/insurance.ts                      # 4대보험 계산
├── components/
│   ├── payroll/payroll-item-settings.tsx        # 급여 항목 CRUD 관리 다이얼로그
│   └── settings/payroll-settings.tsx            # 4대보험 요율, 비과세 한도 설정
└── app/payroll/
    ├── page.tsx                                # 급여 대장 (목록 + 상태관리)
    ├── calculate/page.tsx                      # 급여 계산 (항목 선택 + 계산식)
    └── payslip/[id]/page.tsx                   # 급여명세서 (계산식 포함)
```

### 설정 연동

| 설정 항목 | 위치 | 연동 |
|-----------|------|------|
| `national_pension_rate` | 설정 > 급여 > 4대보험 | 국민연금 계산 요율 |
| `health_insurance_rate` | 설정 > 급여 > 4대보험 | 건강보험 계산 요율 |
| `long_term_care_rate` | 설정 > 급여 > 4대보험 | 장기요양보험 요율 |
| `employment_insurance_rate` | 설정 > 급여 > 4대보험 | 고용보험 요율 |
| `meal_allowance_limit` | 설정 > 급여 > 비과세 | 식대 비과세 한도 |
| `transport_allowance_limit` | 설정 > 급여 > 비과세 | 교통비 비과세 한도 |
| `pay_day` | 설정 > 급여 > 급여일 | 급여 지급일 |

---

## 시작하기

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## 빌드

```bash
npm run build
npm start
```
