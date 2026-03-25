'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore, DEMO_ACCOUNTS } from '@/lib/stores/auth-store';
import { useAuditLogStore } from '@/lib/stores/audit-log-store';
import type { UserRole } from '@/types';

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && url.startsWith('http') && key.length > 20);
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: '시스템관리자',
  hr_manager: '인사담당자',
  dept_manager: '부서관리자',
  employee: '일반사원',
};

const ROLE_ICONS: Record<UserRole, string> = {
  admin: '🛡️',
  hr_manager: '👥',
  dept_manager: '📊',
  employee: '💼',
};

/* ═══════════════════════════════════════════════════════════════════════
   Background Effects (shared across all sections)
   ═══════════════════════════════════════════════════════════════════════ */

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let w = 0, h = 0;
    interface P { x:number; y:number; vx:number; vy:number; r:number; a:number; c:string; }
    const ps: P[] = [];
    const cols = ['#60a5fa','#818cf8','#a78bfa','#34d399','#f472b6'];
    function resize() { w = canvas!.width = window.innerWidth; h = canvas!.height = window.innerHeight; }
    function make(): P {
      return { x:Math.random()*w, y:Math.random()*h, vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3, r:Math.random()*2+0.5, a:Math.random()*0.5+0.1, c:cols[Math.floor(Math.random()*cols.length)] };
    }
    resize();
    for (let i = 0; i < Math.min(100, Math.floor(w*h/10000)); i++) ps.push(make());
    function draw() {
      ctx!.clearRect(0,0,w,h);
      for (let i=0;i<ps.length;i++) for (let j=i+1;j<ps.length;j++) {
        const dx=ps[i].x-ps[j].x,dy=ps[i].y-ps[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<120){ctx!.beginPath();ctx!.strokeStyle=`rgba(148,163,184,${0.06*(1-d/120)})`;ctx!.lineWidth=0.5;ctx!.moveTo(ps[i].x,ps[i].y);ctx!.lineTo(ps[j].x,ps[j].y);ctx!.stroke();}
      }
      for(const p of ps){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;ctx!.beginPath();ctx!.arc(p.x,p.y,p.r,0,Math.PI*2);ctx!.fillStyle=p.c;ctx!.globalAlpha=p.a;ctx!.fill();ctx!.globalAlpha=1;}
      animId=requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener('resize',resize);
    return()=>{cancelAnimationFrame(animId);window.removeEventListener('resize',resize);};
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{zIndex:1}} />;
}

function FloatingPlanes() {
  const planes = useRef(Array.from({length:8},(_,i)=>({
    left:`${10+((i*13+7)%80)}%`, top:`${10+((i*17+3)%80)}%`,
    delay:`${i*1.5}s`, dur:`${12+(i*3)%10}s`,
    opacity: 0.12 + (i%4)*0.05,
    rot: -30+(i*15)%60, scale: 0.6+(i%5)*0.2,
  }))).current;
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{zIndex:2}}>
      {planes.map((p,i)=>(
        <div key={i} className="absolute animate-float-plane"
          style={{left:p.left,top:p.top,animationDelay:p.delay,animationDuration:p.dur,opacity:p.opacity,transform:`rotate(${p.rot}deg) scale(${p.scale})`}}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-300">
            <path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/>
          </svg>
        </div>
      ))}
    </div>
  );
}

function Globe() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if(!c) return;
    const ctx = c.getContext('2d'); if(!ctx) return;
    const S=280; c.width=S; c.height=S;
    const cx=S/2, cy=S/2, R=110;
    let rot=0, id:number;
    const cities=[{la:35.1,lo:129},{la:37.5,lo:127},{la:35.6,lo:139.7},{la:31.2,lo:121.5},{la:1.3,lo:103.8},{la:51.5,lo:-0.1},{la:40.7,lo:-74},{la:-33.9,lo:151.2}];
    function draw(){
      ctx!.clearRect(0,0,S,S);
      const gl=ctx!.createRadialGradient(cx,cy,R*0.8,cx,cy,R*1.3);gl.addColorStop(0,'rgba(59,130,246,0.08)');gl.addColorStop(1,'rgba(59,130,246,0)');ctx!.fillStyle=gl;ctx!.fillRect(0,0,S,S);
      ctx!.beginPath();ctx!.arc(cx,cy,R,0,Math.PI*2);const g2=ctx!.createRadialGradient(cx-30,cy-30,10,cx,cy,R);g2.addColorStop(0,'rgba(59,130,246,0.15)');g2.addColorStop(0.7,'rgba(30,58,138,0.1)');g2.addColorStop(1,'rgba(15,23,42,0.2)');ctx!.fillStyle=g2;ctx!.fill();
      ctx!.beginPath();ctx!.arc(cx,cy,R,0,Math.PI*2);ctx!.strokeStyle='rgba(59,130,246,0.3)';ctx!.lineWidth=1;ctx!.stroke();
      for(let la=-60;la<=60;la+=30){const y=cy+R*Math.sin(la*Math.PI/180),r=R*Math.cos(la*Math.PI/180);ctx!.beginPath();ctx!.ellipse(cx,y,r,r*0.15,0,0,Math.PI*2);ctx!.strokeStyle='rgba(148,163,184,0.1)';ctx!.lineWidth=0.5;ctx!.stroke();}
      for(let lo=0;lo<180;lo+=30){const a=(lo+rot)*Math.PI/180;ctx!.beginPath();ctx!.ellipse(cx,cy,R*Math.abs(Math.cos(a)),R,0,0,Math.PI*2);ctx!.strokeStyle='rgba(148,163,184,0.08)';ctx!.lineWidth=0.5;ctx!.stroke();}
      for(const ci of cities){const lr=((ci.lo+rot)*Math.PI)/180,lt=(ci.la*Math.PI)/180,x3=Math.cos(lt)*Math.sin(lr),z3=Math.cos(lt)*Math.cos(lr);if(z3>-0.2){const px=cx+R*x3,py=cy-R*Math.sin(lt),b=0.3+z3*0.7;ctx!.beginPath();ctx!.arc(px,py,6,0,Math.PI*2);ctx!.fillStyle=`rgba(59,130,246,${b*0.2})`;ctx!.fill();ctx!.beginPath();ctx!.arc(px,py,2,0,Math.PI*2);ctx!.fillStyle=`rgba(96,165,250,${b})`;ctx!.fill();}}
      const t=Date.now()/3000;
      [[0,1],[0,2],[1,3],[4,5],[6,7]].forEach(([a,b])=>{const ca=cities[a],cb=cities[b],lA=((ca.lo+rot)*Math.PI)/180,lB=((cb.lo+rot)*Math.PI)/180,zA=Math.cos(ca.la*Math.PI/180)*Math.cos(lA),zB=Math.cos(cb.la*Math.PI/180)*Math.cos(lB);if(zA>-0.2&&zB>-0.2){const xA=cx+R*Math.cos(ca.la*Math.PI/180)*Math.sin(lA),yA=cy-R*Math.sin(ca.la*Math.PI/180),xB=cx+R*Math.cos(cb.la*Math.PI/180)*Math.sin(lB),yB=cy-R*Math.sin(cb.la*Math.PI/180);ctx!.beginPath();ctx!.moveTo(xA,yA);ctx!.quadraticCurveTo((xA+xB)/2,Math.min(yA,yB)-30-Math.abs(xA-xB)*0.15,xB,yB);ctx!.strokeStyle=`rgba(96,165,250,${0.15+Math.sin(t+a)*0.1})`;ctx!.lineWidth=1;ctx!.stroke();}});
      rot+=0.15; id=requestAnimationFrame(draw);
    }
    draw(); return()=>cancelAnimationFrame(id);
  },[]);
  return <canvas ref={ref} className="pointer-events-none" style={{width:280,height:280}}/>;
}

/* ═══════════════════════════════════════════════════════════════════════
   Scroll‐reveal hook
   ═══════════════════════════════════════════════════════════════════════ */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ═══════════════════════════════════════════════════════════════════════
   Glass Card wrapper
   ═══════════════════════════════════════════════════════════════════════ */
function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-xl shadow-black/10 overflow-hidden ${className}`}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Section: Live Data Widgets (날씨 / 환율 / 시장)
   ═══════════════════════════════════════════════════════════════════════ */
function LiveDataSection() {
  const rv = useReveal();
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const weather = [
    { city: '부산', temp: 14, icon: '🌤️', desc: '대체로 맑음', humidity: 58, wind: '남서 12km/h' },
    { city: '서울', temp: 11, icon: '☁️', desc: '흐림', humidity: 65, wind: '북서 8km/h' },
    { city: '도쿄', temp: 16, icon: '🌤️', desc: '맑음', humidity: 52, wind: '남동 6km/h' },
    { city: '싱가포르', temp: 31, icon: '⛈️', desc: '뇌우', humidity: 88, wind: '남 15km/h' },
  ];

  // 2026-02-28 서울외국환중개 / Investing.com 기준
  const currencies = [
    { pair: 'USD/KRW', rate: '1,447.00', change: +13.58, pct: '+0.95%' },
    { pair: 'EUR/KRW', rate: '1,689.57', change: +8.32, pct: '+0.49%' },
    { pair: 'JPY/KRW', rate: '9.43', change: -0.05, pct: '-0.53%' },
    { pair: 'CNY/KRW', rate: '199.10', change: +1.20, pct: '+0.61%' },
    { pair: 'GBP/KRW', rate: '1,826.40', change: +10.50, pct: '+0.58%' },
    { pair: 'SGD/KRW', rate: '1,082.30', change: +3.70, pct: '+0.34%' },
  ];

  // 2026-02-28 마감 기준 (3/2 월요일은 이란 공습 영향 반영 전)
  const indices = [
    { name: 'KOSPI', val: '6,244.13', change: '-63.07', pct: '-1.00%', up: false },
    { name: 'KOSDAQ', val: '1,192.78', change: '+4.63', pct: '+0.39%', up: true },
    { name: 'S&P 500', val: '6,946.13', change: '+55.98', pct: '+0.81%', up: true },
    { name: 'Nikkei 225', val: '58,850.00', change: '+95.82', pct: '+0.16%', up: true },
    { name: 'BDI (벌크선)', val: '2,117', change: '+48', pct: '+2.32%', up: true },
    { name: 'WTI 원유', val: '$72.57', change: '+5.55', pct: '+8.28%', up: true },
  ];

  return (
    <section ref={rv.ref} className={`transition-all duration-1000 ${rv.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
            LIVE DATA
          </span>
          <h2 className="text-3xl font-bold text-white mb-2">실시간 시세 · 날씨 · 경제지표</h2>
          <p className="text-slate-400 text-sm">
            {time.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            {' '}
            <span className="text-blue-400 font-mono">{time.toLocaleTimeString('ko-KR')}</span>
          </p>
        </div>

        {/* Weather */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {weather.map((w) => (
            <Glass key={w.city} className="p-5 group hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-300">{w.city}</span>
                <span className="text-2xl">{w.icon}</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{w.temp}°</div>
              <div className="text-xs text-slate-400">{w.desc}</div>
              <div className="mt-3 flex gap-3 text-[11px] text-slate-500">
                <span>💧 {w.humidity}%</span>
                <span>💨 {w.wind}</span>
              </div>
            </Glass>
          ))}
        </div>

        {/* Currency + Indices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Exchange Rates */}
          <Glass className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">💱</span>
              <h3 className="text-base font-semibold text-white">환율</h3>
              <span className="text-[10px] text-slate-500 ml-auto">2026.02.28 마감</span>
            </div>
            <div className="space-y-2">
              {currencies.map((c) => (
                <div key={c.pair} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] px-2 rounded transition-colors">
                  <span className="text-sm text-slate-300 font-medium w-24">{c.pair}</span>
                  <span className="text-sm text-white font-mono">{c.rate}</span>
                  <span className={`text-xs font-mono ${c.change > 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {c.change > 0 ? '▲' : '▼'} {Math.abs(c.change).toFixed(2)} ({c.pct})
                  </span>
                </div>
              ))}
            </div>
          </Glass>

          {/* Market Indices */}
          <Glass className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📈</span>
              <h3 className="text-base font-semibold text-white">시장 지표</h3>
              <span className="text-[10px] text-slate-500 ml-auto">2026.02.28 마감</span>
            </div>
            <div className="space-y-2">
              {indices.map((idx) => (
                <div key={idx.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] px-2 rounded transition-colors">
                  <span className="text-sm text-slate-300 font-medium w-28">{idx.name}</span>
                  <span className="text-sm text-white font-mono">{idx.val}</span>
                  <span className={`text-xs font-mono ${idx.up ? 'text-red-400' : 'text-blue-400'}`}>
                    {idx.up ? '▲' : '▼'} {idx.change} ({idx.pct})
                  </span>
                </div>
              ))}
            </div>
          </Glass>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Section: International News
   ═══════════════════════════════════════════════════════════════════════ */
function NewsSection() {
  const rv = useReveal();

  // 2026-03-02 실제 뉴스 (네이버/다음/Reuters 기반)
  const topNews = [
    {
      cat: '국제', badge: 'bg-red-500/20 text-red-300',
      title: '미·이스라엘 이란 합동 공습…하메네이 최고지도자 사망 확인',
      summary: '이란 국영미디어가 최고지도자 아야톨라 알리 하메네이(86세)가 미국·이스라엘의 합동 공습으로 사망했다고 확인했다. 트럼프 대통령은 이란인들이 "나라를 되찾을 기회"라 표현했다.',
      time: '3시간 전', source: 'Reuters',
    },
    {
      cat: '에너지', badge: 'bg-orange-500/20 text-orange-300',
      title: '유가 급등…WTI 8%↑, 호르무즈 해협 유조선 공격으로 $100 돌파 우려',
      summary: '이란의 보복으로 호르무즈 해협에서 최소 3척 선박이 공격받았다. 전 세계 석유의 20%가 통과하는 해역이 위협받으면서 브렌트유 $79.41, WTI $72.57로 급등했다.',
      time: '5시간 전', source: 'CNBC',
    },
    {
      cat: '경제', badge: 'bg-blue-500/20 text-blue-300',
      title: '2월 수출 29%↑ 674억불…반도체 사상 최대, 수출 경기 호조',
      summary: '산업통상자원부에 따르면 2월 수출이 전년동기 대비 29% 증가한 674억달러를 기록했다. 반도체 수출이 사상 최대를 경신하며 수출 경기 호조세가 이어지고 있다.',
      time: '6시간 전', source: '연합뉴스',
    },
  ];

  // 2026-03-02 실제 뉴스 헤드라인
  const sideNews = [
    { cat: '국제', title: '이란 혁명수비대, "가장 강력한 보복 작전" 임박 선언', time: '2시간 전' },
    { cat: '정치', title: '이재명 대통령, 기획예산처 장관 후보에 박홍근 의원 지명', time: '4시간 전' },
    { cat: '국제', title: '프랑스 핵항모 샤를 드 골, 이란 보복 대응 지중해 긴급 파견', time: '5시간 전' },
    { cat: '경제', title: '인천공항~중동 항공편 12편 전편 결항…영공 폐쇄 여파', time: '6시간 전' },
    { cat: '해운', title: '호르무즈 해협 유조선 공격…글로벌 해상운송 차질 우려', time: '7시간 전' },
    { cat: '정치', title: '국민의힘, 사법개편 3법 관련 3일부터 장외투쟁 선언', time: '8시간 전' },
    { cat: '국제', title: 'UAE, 이란 미사일 공격에 테헤란 대사관 폐쇄·외교관 철수', time: '9시간 전' },
    { cat: '금융', title: '비트코인 공포탐욕지수 14…중동 리스크에 극단적 공포 구간', time: '10시간 전' },
  ];

  return (
    <section ref={rv.ref} className={`transition-all duration-1000 delay-100 ${rv.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
            NEWS
          </span>
          <h2 className="text-3xl font-bold text-white mb-2">오늘의 뉴스</h2>
          <p className="text-slate-400 text-sm">국제 · 경제 · 해운 · 산업 주요 소식</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main news */}
          <div className="lg:col-span-2 space-y-4">
            {topNews.map((n, i) => (
              <Glass key={i} className="p-6 group hover:border-purple-500/20 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${n.badge}`}>{n.cat}</span>
                  <span className="text-[11px] text-slate-500">{n.source}</span>
                  <span className="text-[11px] text-slate-600 ml-auto">{n.time}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors leading-snug">
                  {n.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{n.summary}</p>
              </Glass>
            ))}
          </div>

          {/* Side news list */}
          <div>
            <Glass className="p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                최신 헤드라인
              </h3>
              <div className="space-y-0">
                {sideNews.map((n, i) => (
                  <div key={i} className="py-3 border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/[0.02] -mx-2 px-2 rounded transition-colors group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{n.cat}</span>
                      <span className="text-[10px] text-slate-600">{n.time}</span>
                    </div>
                    <p className="text-[13px] text-slate-300 leading-snug group-hover:text-white transition-colors">{n.title}</p>
                  </div>
                ))}
              </div>
            </Glass>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Section: Company Highlights / HRMS Features
   ═══════════════════════════════════════════════════════════════════════ */
function CompanySection() {
  const rv = useReveal();

  const stats = [
    { label: '설립', value: '1997', sub: '28년 전통' },
    { label: '임직원', value: '850+', sub: '글로벌 인력' },
    { label: '매출액', value: '3,200억', sub: '2025년 기준' },
    { label: '수출 비중', value: '92%', sub: '70여개국' },
  ];

  const features = [
    { icon: '👤', title: '인사정보 관리', desc: '사원 마스터, 부서/직급/직책 체계, 인사발령 이력 통합 관리' },
    { icon: '⏱️', title: '근태 · 휴가', desc: '출퇴근 기록, 초과근무, 연차/반차/경조사 자동 계산' },
    { icon: '💰', title: '급여 · 정산', desc: '4대보험, 소득세, 수당/공제 자동 계산 및 명세서 발급' },
    { icon: '📋', title: '전자결재', desc: '휴가·경비·인사발령 결재 워크플로우 자동화' },
    { icon: '🏆', title: '평가 관리', desc: '다면평가(자기/상사/동료), 등급 배분, 성과 분석' },
    { icon: '📊', title: '조직 · 분석', desc: '조직도 시뮬레이션, 인력 현황 대시보드, 감사 로그' },
  ];

  return (
    <section ref={rv.ref} className={`transition-all duration-1000 delay-200 ${rv.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            COMPANY & FEATURES
          </span>
          <h2 className="text-3xl font-bold text-white mb-2">파나시아 & HRMS 소개</h2>
          <p className="text-slate-400 text-sm">글로벌 친환경 선박 솔루션 기업의 스마트 인사관리</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <Glass key={s.label} className="p-6 text-center group hover:border-emerald-500/20 transition-all duration-300">
              <div className="text-3xl font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">{s.value}</div>
              <div className="text-sm text-slate-300 font-medium">{s.label}</div>
              <div className="text-xs text-slate-500 mt-1">{s.sub}</div>
            </Glass>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <Glass key={f.title} className="p-6 group hover:border-blue-500/20 transition-all duration-300 cursor-default">
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform inline-block">{f.icon}</div>
              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </Glass>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Section: Maritime Industry Trends (해운·조선·환경 동향)
   ═══════════════════════════════════════════════════════════════════════ */
function IndustrySection() {
  const rv = useReveal();

  const trends = [
    {
      icon: '🚢', title: 'IMO 2030 탈탄소 규제',
      items: ['EEXI/CII 등급 강화', '탄소집약도지표 A~E 등급', '저탄소 연료 전환 의무화', 'EU ETS 해운 편입 완료'],
    },
    {
      icon: '🌊', title: '친환경 선박 솔루션',
      items: ['스크러버 (SOx 저감)', 'BWTS (선박평형수처리)', 'SCR (NOx 저감)', 'EEDI 규제 대응 설계'],
    },
    {
      icon: '⚡', title: '차세대 연료 전환',
      items: ['LNG 이중연료 추진', '메탄올/암모니아 연료', '수소 연료전지 시범선', '전기추진 연안선 확대'],
    },
    {
      icon: '🤖', title: '스마트 해운 기술',
      items: ['자율운항선박 Level 3+', 'IoT 기반 원격 모니터링', 'AI 항로 최적화', '디지털 트윈 조선소'],
    },
  ];

  return (
    <section ref={rv.ref} className={`transition-all duration-1000 delay-100 ${rv.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
            INDUSTRY
          </span>
          <h2 className="text-3xl font-bold text-white mb-2">해운 · 조선 · 환경 동향</h2>
          <p className="text-slate-400 text-sm">파나시아가 주목하는 산업 트렌드</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trends.map((t) => (
            <Glass key={t.title} className="p-6 group hover:border-cyan-500/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{t.icon}</span>
                <h3 className="text-base font-semibold text-white">{t.title}</h3>
              </div>
              <ul className="space-y-2">
                {t.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="w-1 h-1 rounded-full bg-cyan-400/60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Glass>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Section: World Clock & Quick Links
   ═══════════════════════════════════════════════════════════════════════ */
function WorldClockSection() {
  const rv = useReveal();
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const zones = [
    { city: '부산', tz: 'Asia/Seoul', flag: '🇰🇷' },
    { city: '도쿄', tz: 'Asia/Tokyo', flag: '🇯🇵' },
    { city: '싱가포르', tz: 'Asia/Singapore', flag: '🇸🇬' },
    { city: '런던', tz: 'Europe/London', flag: '🇬🇧' },
    { city: '로테르담', tz: 'Europe/Amsterdam', flag: '🇳🇱' },
    { city: '뉴욕', tz: 'America/New_York', flag: '🇺🇸' },
  ];

  const getTime = (tz: string) => {
    return now.toLocaleTimeString('ko-KR', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  const getDate = (tz: string) => {
    return now.toLocaleDateString('ko-KR', { timeZone: tz, month: 'short', day: 'numeric', weekday: 'short' });
  };

  return (
    <section ref={rv.ref} className={`transition-all duration-1000 delay-100 ${rv.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
            WORLD CLOCK
          </span>
          <h2 className="text-3xl font-bold text-white mb-2">세계 시각</h2>
          <p className="text-slate-400 text-sm">파나시아 글로벌 거점 현지 시각</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {zones.map((z) => (
            <Glass key={z.city} className="p-4 text-center group hover:border-amber-500/20 transition-all duration-300">
              <div className="text-2xl mb-2">{z.flag}</div>
              <div className="text-sm font-medium text-slate-300 mb-1">{z.city}</div>
              <div className="text-lg font-mono font-bold text-white">{getTime(z.tz)}</div>
              <div className="text-[11px] text-slate-500 mt-1">{getDate(z.tz)}</div>
            </Glass>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Footer
   ═══════════════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <span className="text-sm font-bold text-white">PANASIA HRMS</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              주식회사 파나시아 인사관리시스템<br />
              글로벌 친환경 선박 솔루션 기업
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">회사 정보</h4>
            <div className="space-y-1.5 text-xs text-slate-500">
              <p>사업자번호: 603-81-29289</p>
              <p>대표: 이수태 (회장), 이민걸·정진택 (공동대표이사)</p>
              <p>부산광역시 강서구 미음산단3로 55 (미음동)</p>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">연락처</h4>
            <div className="space-y-1.5 text-xs text-slate-500">
              <p>TEL: 051-831-1010</p>
              <p>FAX: 070-831-1399</p>
              <p>WEB: www.worldpanasia.com</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 text-center">
          <p className="text-[11px] text-slate-600">© 2026 PANASIA Co., Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Scroll‐to‐top + down indicator
   ═══════════════════════════════════════════════════════════════════════ */
function ScrollIndicator() {
  return (
    <div className="flex flex-col items-center gap-2 py-6 animate-bounce">
      <span className="text-[11px] text-slate-500 tracking-wider">SCROLL</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
        <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Main Login / Landing Page
   ═══════════════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredRole, setHoveredRole] = useState<UserRole | null>(null);
  const router = useRouter();
  // 데모 모드: Supabase Auth에 사용자가 등록되기 전까지 항상 데모 모드 사용
  const demoMode = true;

  const loginDemo = useAuthStore((s) => s.loginDemo);
  const loginDemoByRole = useAuthStore((s) => s.loginDemoByRole);
  const addLog = useAuditLogStore((s) => s.addLog);

  useEffect(() => { setMounted(true); }, []);

  const recordLoginLog = useCallback(
    (userId: string, userName: string, userRole: UserRole, sessionId: string) => {
      addLog({ user_id: userId, user_name: userName, user_role: userRole, action_type: 'login', target_type: '/login', target_id: null, target_label: '로그인', details: { method: 'demo' }, session_id: sessionId });
    }, [addLog]
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    if (demoMode) {
      if (email && password) {
        const ok = loginDemo(email, password);
        if (!ok) { setError('이메일 또는 비밀번호가 올바르지 않습니다.'); setLoading(false); return; }
        const s = useAuthStore.getState().session!;
        recordLoginLog(s.user_id, s.user_name, s.role, s.session_id);
      } else {
        loginDemoByRole('admin');
        const s = useAuthStore.getState().session!;
        recordLoginLog(s.user_id, s.user_name, s.role, s.session_id);
      }
      router.push('/'); return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError('이메일 또는 비밀번호가 올바르지 않습니다.'); setLoading(false); }
    else { router.push('/'); router.refresh(); }
  };

  const handleQuickLogin = (role: UserRole) => {
    loginDemoByRole(role);
    const s = useAuthStore.getState().session!;
    recordLoginLog(s.user_id, s.user_name, s.role, s.session_id);
    router.push('/');
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 min-h-screen">
      {/* Fixed BG effects */}
      <div className="fixed inset-0 pointer-events-none" style={{zIndex:0}}>
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse-slow" style={{animationDelay:'2s'}} />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-purple-500/8 blur-[100px] animate-pulse-slow" style={{animationDelay:'4s'}} />
      </div>
      <ParticleCanvas />
      <FloatingPlanes />

      {/* Scrollable content */}
      <div className="relative" style={{zIndex:10}}>

        {/* ═══ HERO SECTION (Login) ═══ */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className={`w-full max-w-5xl flex flex-col lg:flex-row items-center gap-8 lg:gap-16 transition-all duration-1000 ${mounted?'opacity-100 translate-y-0':'opacity-0 translate-y-8'}`}>
            {/* Left: Branding + Globe */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="mb-6 flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-slate-900 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">PANASIA HRMS</h1>
                  <p className="text-xs text-slate-400 tracking-widest uppercase">Human Resource Management</p>
                </div>
              </div>
              <p className="text-slate-300 text-lg mb-2 max-w-md leading-relaxed">
                주식회사 <span className="text-blue-400 font-semibold">파나시아</span> 인사관리시스템
              </p>
              <p className="text-slate-500 text-sm mb-8 max-w-md">글로벌 친환경 선박 솔루션 기업의 스마트 HR 플랫폼</p>
              <div className="relative hidden lg:block">
                <Globe />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-600 tracking-wider">BUSAN · KOREA</div>
              </div>
            </div>

            {/* Right: Login Panel */}
            <div className="w-full max-w-md">
              <Glass className="p-8">
                <h2 className="text-xl font-semibold text-white mb-1">로그인</h2>
                <p className="text-sm text-slate-400 mb-6">계정 정보를 입력하세요</p>

                {demoMode && (
                  <div className="flex rounded-lg bg-white/5 p-1 mb-6">
                    <button onClick={()=>setShowForm(false)} className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${!showForm?'bg-white/10 text-white shadow-sm':'text-slate-400 hover:text-slate-300'}`}>빠른 로그인</button>
                    <button onClick={()=>setShowForm(true)} className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${showForm?'bg-white/10 text-white shadow-sm':'text-slate-400 hover:text-slate-300'}`}>이메일 로그인</button>
                  </div>
                )}

                {demoMode && !showForm && (
                  <div className="space-y-3">
                    {DEMO_ACCOUNTS.map((acc)=>(
                      <button key={acc.id} onClick={()=>handleQuickLogin(acc.role)} onMouseEnter={()=>setHoveredRole(acc.role)} onMouseLeave={()=>setHoveredRole(null)}
                        className={`w-full group relative rounded-xl border transition-all duration-300 p-4 text-left ${hoveredRole===acc.role?'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10 scale-[1.02]':'border-white/10 bg-white/5 hover:border-white/20'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-300 ${hoveredRole===acc.role?'bg-blue-500/20 scale-110':'bg-white/5'}`}>{ROLE_ICONS[acc.role]}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">{acc.name}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${acc.role==='admin'?'bg-red-500/20 text-red-300':acc.role==='hr_manager'?'bg-blue-500/20 text-blue-300':acc.role==='dept_manager'?'bg-green-500/20 text-green-300':'bg-slate-500/20 text-slate-300'}`}>{ROLE_LABELS[acc.role]}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">{acc.department} · {acc.position}</div>
                          </div>
                          <svg className={`w-5 h-5 transition-all duration-300 ${hoveredRole===acc.role?'text-blue-400 translate-x-0 opacity-100':'text-slate-600 -translate-x-2 opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                        </div>
                      </button>
                    ))}
                    <p className="text-center text-[11px] text-slate-600 mt-3">비밀번호: demo1234</p>
                  </div>
                )}

                {(!demoMode || showForm) && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-1.5">이메일</label>
                      <input type="email" placeholder="email@panasia.co.kr" value={email} onChange={e=>setEmail(e.target.value)} required={!demoMode}
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all text-sm"/>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1.5">비밀번호</label>
                      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required={!demoMode}
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all text-sm"/>
                    </div>
                    {error && <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2"><svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>{error}</div>}
                    <button type="submit" disabled={loading}
                      className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98]">
                      {loading?<span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>로그인 중...</span>:'로그인'}
                    </button>
                  </form>
                )}
              </Glass>
            </div>
          </div>

          <ScrollIndicator />
        </section>

        {/* ═══ SECTIONS BELOW FOLD ═══ */}
        <div className="space-y-24 pb-0">
          <LiveDataSection />
          <IndustrySection />
          <CompanySection />
          <WorldClockSection />
        </div>

        <Footer />
      </div>

      {/* Global CSS */}
      <style jsx global>{`
        @keyframes float-plane {
          0%,100%{transform:translateX(0) translateY(0) rotate(-15deg)}
          25%{transform:translateX(80px) translateY(-40px) rotate(-5deg)}
          50%{transform:translateX(160px) translateY(10px) rotate(-20deg)}
          75%{transform:translateX(80px) translateY(-60px) rotate(-10deg)}
        }
        .animate-float-plane{animation:float-plane 15s ease-in-out infinite}
        @keyframes pulse-slow{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:0.7;transform:scale(1.1)}}
        .animate-pulse-slow{animation:pulse-slow 8s ease-in-out infinite}
      `}</style>
    </div>
  );
}
