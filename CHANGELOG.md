# HRMS 작업 내역 정리

> 작성일: 2026-03-02
> 프로젝트: 주식회사 파나시아 인사관리시스템 (PANASIA HRMS)
> 스택: Next.js 16 (App Router) + Zustand 5 + shadcn/ui + Tailwind CSS

---

## 1. 로그인 강제 (Auth Guard)

### 문제
데모 모드에서 로그인 없이 대시보드에 바로 접근 가능했음.

### 해결

| 파일 | 작업 |
|------|------|
| `src/components/layout/auth-guard.tsx` | **신규** — Zustand hydration 대기 후, 세션 없으면 `/login` 리다이렉트. 메뉴 권한 검사 포함 |
| `src/components/layout/conditional-layout.tsx` | **신규** — `/login`이면 bare 렌더, 그 외 Sidebar+Header+main 레이아웃 |
| `src/app/layout.tsx` | **수정** — `<AuthGuard>` + `<ConditionalLayout>`로 감싸기, Sidebar/Header 직접 import 제거 |

### 핵심 로직
- `useAuthStore.persist.onFinishHydration()` → hydration 완료 전 null 렌더 (flash 방지)
- 세션 없음 + 비공개 경로 → `router.replace('/login')`
- 세션 있음 + `/login` → `router.replace('/')`
- 메뉴 권한 체크: `menuPermissions[role]`에 없는 경로 접근 시 `'/'`로 리다이렉트

---

## 2. 파나시아 회사정보 반영

### 회사 기본정보
- **회사명:** 주식회사 파나시아
- **사업자번호:** 603-81-29289
- **대표자:** 이수태 (회장), 이민걸·정진택 (공동대표이사)
- **주소:** 부산광역시 강서구 미음산단3로 55 (미음동)
- **전화:** 051-831-1010 / 팩스: 070-831-1399
- **업종:** 선박 구성 부분품 제조업
- **웹사이트:** www.worldpanasia.com

### 변경 파일

| 파일 | 작업 |
|------|------|
| `src/lib/stores/settings-store.ts` | company 기본값 파나시아로 교체, `phone`/`fax`/`website` 필드 추가. persist v3 |
| `src/components/settings/company-info-settings.tsx` | 전화/팩스/웹사이트 입력 필드 추가 |
| `src/lib/stores/employee-store.ts` | 부서(23개)/직급(8단계)/직책(8단계)/사원(26명) 전체 시드 교체. persist v2 |
| `src/lib/stores/auth-store.ts` | 데모 계정 4개 재매핑. persist v2 |
| `src/lib/constants/positions.ts` | 회장/파트장/소장/대표이사 직급·직책 추가 |

### 부서 구조 (23개)
```
대표이사실
경영지원본부 → 인사팀, 재무회계팀, 총무팀
영업본부 → 국내영업팀, 해외영업팀
기술연구소 → 연구개발팀
스크러버사업부 / BWTS사업부 / 연료공급사업부 / 계측제어사업부
생산본부 → 생산1팀, 생산2팀
품질관리팀 / 조달구매본부 / 스마트서비스본부
HSE실 → 안전팀, 공무팀
```

### 직급 (8단계)
사원 → 대리 → 과장 → 차장 → 부장 → 이사 → 대표이사 → 회장

### 직책 (8단계)
팀원 → 파트장 → 팀장 → 실장 → 본부장 → 소장 → 대표이사 → 회장

### 데모 계정 매핑

| 이메일 | 역할 | 사원 | 부서 |
|--------|------|------|------|
| admin@demo.com | 시스템관리자 | e004 김영수 | 경영지원본부 |
| hr@demo.com | 인사담당자 | e010 박지현 | 인사팀 |
| manager@demo.com | 부서관리자 | e022 문성호 | 연구개발팀 |
| employee@demo.com | 일반사원 | e020 하정민 | 해외영업팀 |

### localStorage 마이그레이션
- `settings-store`: v2 → v3 (menuPermissions 추가)
- `employee-store`: v1 → v2 (시드 데이터 전체 교체)
- `auth-store`: v1 → v2 (세션 리셋)

---

## 3. 인사분류 옵션 관리 (설정 탭 5개 추가)

### 신규 타입 (`src/types/index.ts`)
- `JobCategory`: id, name, code, description, sort_order, is_active
- `SalaryGrade`: id, rank_id, step, base_amount, is_active

### employee-store 확장
- **새 state:** `jobCategories[]` (5개 시드), `salaryGrades[]` (17개 시드)
- **새 CRUD actions:** `deleteDepartment`, `add/update/deletePositionRank`, `add/update/deletePositionTitle`, `add/update/deleteJobCategory`, `add/update/deleteSalaryGrade`

### 신규 설정 컴포넌트

| 파일 | 탭 이름 | 내용 |
|------|---------|------|
| `src/components/settings/department-settings.tsx` | 부서관리 | 계층 트리 테이블, 추가/수정/삭제 Dialog |
| `src/components/settings/position-rank-settings.tsx` | 직급관리 | name, level 테이블 + Dialog |
| `src/components/settings/position-title-settings.tsx` | 직책관리 | name, level 테이블 + Dialog |
| `src/components/settings/job-category-settings.tsx` | 직무관리 | name, code, description 테이블 + Dialog |
| `src/components/settings/salary-grade-settings.tsx` | 호봉관리 | 직급별 필터 + step, base_amount 테이블 + Dialog |

### 설정 페이지 등록 (`src/app/settings/page.tsx`)
- 기존 16개 탭 → 21개 탭 (부서관리, 직급관리, 직책관리, 직무관리, 호봉관리 추가)

---

## 4. 역할별 메뉴 접근 권한

### 구현

| 파일 | 작업 |
|------|------|
| `src/lib/constants/menu-items.ts` | **신규** — 전체 메뉴 15개 정의 (`ALL_MENU_ITEMS`), href/label/icon/description |
| `src/lib/stores/settings-store.ts` | `menuPermissions: Record<UserRole, string[]>` 추가, `updateMenuPermissions` action |
| `src/components/layout/sidebar.tsx` | 하드코딩 메뉴 → `ALL_MENU_ITEMS` import, `menuPermissions[role]`로 필터링 |
| `src/components/settings/menu-permission-settings.tsx` | **신규** — 역할별 메뉴 권한 관리 UI (체크박스 그리드, 전체선택/해제, 역할별 저장) |
| `src/components/layout/auth-guard.tsx` | 권한 없는 경로 접근 시 `'/'`로 리다이렉트 |

### 기본 권한

| 역할 | 접근 메뉴 수 |
|------|------------|
| 시스템관리자 (admin) | 15개 (전체) |
| 인사담당자 (hr_manager) | 13개 |
| 부서관리자 (dept_manager) | 8개 |
| 일반사원 (employee) | 5개 |

---

## 5. 로그인 페이지 인터랙티브 리디자인

### paperplanes.world 스타일 적용 (`src/app/login/page.tsx`)

**배경 효과:**
- `ParticleCanvas` — 100개 파티클 + 연결선 네트워크 (Canvas)
- `FloatingPlanes` — 8개 SVG 종이비행기 부유 애니메이션
- 3개 gradient orb + pulse 애니메이션

**로그인 Hero:**
- `Globe` — 3D 회전 지구본 (Canvas), 8개 도시 + 항로 아크
- Glass morphism 로그인 패널 (backdrop-blur, 반투명 border)
- 빠른 로그인 / 이메일 로그인 탭 전환
- 역할별 카드 hover 효과 (scale, glow, arrow 슬라이드)

---

## 6. 랜딩 페이지 확장 (스크롤 가능)

### 로그인 페이지를 스크롤형 랜딩 페이지로 확장

**공통 유틸:**
- `useReveal` — IntersectionObserver 기반 스크롤 fade-in
- `Glass` — 재사용 glass morphism 카드 래퍼
- `ScrollIndicator` — Hero와 콘텐츠 사이 bounce 화살표

### 섹션 구성

| 순서 | 섹션 | 컴포넌트 | 내용 |
|------|------|----------|------|
| 1 | Hero | (기존 로그인) | 3D 글로브 + 로그인 패널 |
| 2 | Live Data | `LiveDataSection` | 실시간 시계, 4개 도시 날씨, 6개 환율, 6개 시장지표 |
| 3 | News | `NewsSection` | 3개 주요 기사 + 8개 사이드 헤드라인 |
| 4 | Industry | `IndustrySection` | 해운/조선/환경 트렌드 4개 카드 |
| 5 | Company | `CompanySection` | 파나시아 통계 4개 + HRMS 6대 기능 소개 |
| 6 | World Clock | `WorldClockSection` | 6개 도시 실시간 시계 (부산/도쿄/싱가포르/런던/로테르담/뉴욕) |
| 7 | Footer | `Footer` | 회사정보, 사업자번호, 대표자, 연락처 |

---

## 7. 실제 데이터 반영 (2026-03-02 기준)

네이버/다음/Reuters/CNBC/Investing.com 등에서 확인한 최신 데이터로 교체.

### 환율 (2026.02.28 마감)

| 통화 | 환율 | 변동 |
|------|------|------|
| USD/KRW | 1,447.00 | +13.58 (+0.95%) |
| EUR/KRW | 1,689.57 | +8.32 (+0.49%) |
| JPY/KRW | 9.43 | -0.05 (-0.53%) |
| CNY/KRW | 199.10 | +1.20 (+0.61%) |
| GBP/KRW | 1,826.40 | +10.50 (+0.58%) |
| SGD/KRW | 1,082.30 | +3.70 (+0.34%) |

### 시장 지표 (2026.02.28 마감)

| 지표 | 수치 | 변동 |
|------|------|------|
| KOSPI | 6,244.13 | -63.07 (-1.00%) |
| KOSDAQ | 1,192.78 | +4.63 (+0.39%) |
| S&P 500 | 6,946.13 | +55.98 (+0.81%) |
| Nikkei 225 | 58,850.00 | +95.82 (+0.16%) |
| BDI (벌크선) | 2,117 | +48 (+2.32%) |
| WTI 원유 | $72.57 | +5.55 (+8.28%) |

### 뉴스 헤드라인 (2026.03.02)

**주요 기사 3건:**
1. **미·이스라엘 이란 합동 공습…하메네이 최고지도자 사망 확인** (Reuters)
2. **유가 급등…WTI 8%↑, 호르무즈 해협 유조선 공격으로 $100 돌파 우려** (CNBC)
3. **2월 수출 29%↑ 674억불…반도체 사상 최대, 수출 경기 호조** (연합뉴스)

**사이드 헤드라인 8건:**
- 이란 혁명수비대, "가장 강력한 보복 작전" 임박 선언
- 이재명 대통령, 기획예산처 장관 후보에 박홍근 의원 지명
- 프랑스 핵항모 샤를 드 골, 이란 보복 대응 지중해 긴급 파견
- 인천공항~중동 항공편 12편 전편 결항…영공 폐쇄 여파
- 호르무즈 해협 유조선 공격…글로벌 해상운송 차질 우려
- 국민의힘, 사법개편 3법 관련 3일부터 장외투쟁 선언
- UAE, 이란 미사일 공격에 테헤란 대사관 폐쇄·외교관 철수
- 비트코인 공포탐욕지수 14…중동 리스크에 극단적 공포 구간

---

## 파일 변경 총괄

### 신규 파일 (9개)

| 파일 | 설명 |
|------|------|
| `src/components/layout/auth-guard.tsx` | 인증 가드 (hydration + 세션 + 메뉴 권한) |
| `src/components/layout/conditional-layout.tsx` | 경로별 조건부 레이아웃 |
| `src/components/settings/department-settings.tsx` | 부서관리 설정 탭 |
| `src/components/settings/position-rank-settings.tsx` | 직급관리 설정 탭 |
| `src/components/settings/position-title-settings.tsx` | 직책관리 설정 탭 |
| `src/components/settings/job-category-settings.tsx` | 직무관리 설정 탭 |
| `src/components/settings/salary-grade-settings.tsx` | 호봉관리 설정 탭 |
| `src/components/settings/menu-permission-settings.tsx` | 메뉴 권한관리 설정 탭 |
| `src/lib/constants/menu-items.ts` | 전체 메뉴 아이템 상수 정의 |

### 수정 파일 (10개)

| 파일 | 주요 변경 |
|------|----------|
| `src/app/layout.tsx` | AuthGuard + ConditionalLayout 적용 |
| `src/app/login/page.tsx` | 인터랙티브 랜딩 페이지 (파티클/글로브/7개 섹션/실제 데이터) |
| `src/app/settings/page.tsx` | 설정 탭 16개 → 21개 |
| `src/components/layout/sidebar.tsx` | 메뉴 권한 기반 필터링 |
| `src/components/settings/company-info-settings.tsx` | 전화/팩스/웹사이트 필드 |
| `src/lib/constants/positions.ts` | 회장/파트장/소장/대표이사 추가 |
| `src/lib/stores/auth-store.ts` | 데모 계정 파나시아 매핑, persist v2 |
| `src/lib/stores/employee-store.ts` | 23부서/8직급/8직책/26사원/5직무/17호봉 시드, CRUD actions, persist v2 |
| `src/lib/stores/settings-store.ts` | 파나시아 회사정보, menuPermissions, persist v3 |
| `src/types/index.ts` | JobCategory, SalaryGrade 타입 추가 |

### 변경 통계
- **신규 파일:** 9개
- **수정 파일:** 10개
- **추가 라인:** ~1,093줄
- **삭제 라인:** ~268줄
- **빌드:** 정상 통과
