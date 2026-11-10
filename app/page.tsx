"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Gem, Heart, Sparkles, Target, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Goal = { id: string; card_name: string; target_amount: number; deadline: string | null; priority: number };
type Entry = { id: string; entry_date: string; balance: number; memo: string };
type Transaction = { id: string; transaction_date: string; kind: "gain" | "spend"; amount: number; reason: string };
const number = (value: number) => new Intl.NumberFormat("ko-KR").format(value);
const demoGoal: Goal = { id: "demo", card_name: "다음 미래시 목표", target_amount: 60000, deadline: null, priority: 1 };
const demoEntries: Entry[] = [
  { id: "1", entry_date: "2026-11-08", balance: 39000, memo: "기록" },
  { id: "2", entry_date: "2026-11-09", balance: 42000, memo: "미션 보상" },
  { id: "3", entry_date: "2026-11-10", balance: 45000, memo: "일일 기록" }
];

export default function HomePage() {
  const [balance, setBalance] = useState(45000);
  const [goal, setGoal] = useState<Goal>(demoGoal);
  const [entries, setEntries] = useState<Entry[]>(demoEntries);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "a", transaction_date: "2026-11-10", kind: "gain", amount: 500, reason: "로그인 보너스" },
    { id: "b", transaction_date: "2026-11-09", kind: "gain", amount: 1500, reason: "미션 보상" },
    { id: "c", transaction_date: "2026-11-08", kind: "spend", amount: 3000, reason: "가챠" }
  ]);
  const [connected, setConnected] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }
    let active = true;
    async function load() {
      const { data: auth } = await supabase!.auth.getUser();
      if (!active) return;
      setSignedIn(Boolean(auth.user));
      if (!auth.user) { setLoading(false); return; }
      const [entryRes, goalRes, txRes] = await Promise.all([
        supabase!.from("crystal_entries").select("id,entry_date,balance,memo").order("entry_date", { ascending: false }).limit(30),
        supabase!.from("goals").select("id,card_name,target_amount,deadline,priority").eq("achieved", false).order("priority").limit(1),
        supabase!.from("transactions").select("id,transaction_date,kind,amount,reason").order("transaction_date", { ascending: false }).limit(5)
      ]);
      if (!active) return;
      if (!entryRes.error) {
        const savedEntries = (entryRes.data ?? []) as Entry[];
        setEntries(savedEntries);
        setBalance(savedEntries[0]?.balance ?? 0);
      }
      if (!goalRes.error) {
        setGoal(goalRes.data?.[0] as Goal ?? { id: "new", card_name: "목표를 등록해 주세요", target_amount: 60000, deadline: null, priority: 1 });
      }
      if (!txRes.error) setTransactions((txRes.data ?? []) as Transaction[]);
      setConnected(!entryRes.error && !goalRes.error && !txRes.error);
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  const progress = Math.min(100, Math.round((balance / Math.max(goal.target_amount, 1)) * 100));
  const ordered = entries.slice().sort((a, b) => a.entry_date.localeCompare(b.entry_date));
  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  const days = first && last ? Math.max(1, Math.round((new Date(last.entry_date).getTime() - new Date(first.entry_date).getTime()) / 86400000)) : 0;
  const daily = days > 0 ? (last.balance - first.balance) / days : 0;
  const remaining = Math.max(0, goal.target_amount - balance);
  const eta = daily > 0 ? Math.ceil(remaining / daily) : null;

  return (
    <main className="page-wrap">
      <div className="shell">
        <header className="topbar">
          <Link href="/" className="brand"><span className="brand-mark"><Gem size={20}/></span><span>RIMIIN<small>CRYSTAL PLANNER</small></span></Link>
          <div className="top-actions"><span className="pill">{signedIn && connected ? "CLOUD SYNC" : "MY SEKAI"}</span><Link className="avatar" href="/login" aria-label="계정"><UserRound size={17}/></Link></div>
        </header>
        <section className="hero">
          <div className="hero-kicker">YOUR FUTURE, YOUR CRYSTALS</div>
          <h1>미래의 나를 위해,<br/>오늘의 크리스탈을 기록해.</h1>
          <p>차곡차곡 모으고, 목표를 세우고,<br/>원하는 미래시를 준비해 보세요.</p>
          <div className="hero-crystal">✧</div>
        </section>
        {!connected && <div className="notice" style={{marginTop:14}}><Sparkles size={17}/><span>{loading ? "클라우드 데이터를 확인하고 있어요." : "미리보기 모드예요. Supabase 환경변수를 연결하고 로그인하면 실제 데이터가 클라우드에 저장돼요."} {!loading && <Link href="/login"><b>로그인 설정하기 →</b></Link>}</span></div>}
        <div className="grid stats">
          <section className="card stat"><div className="stat-icon" style={{background:"#eee8ff",color:"#8a70d1"}}><Gem size={16}/></div><div className="stat-label">현재 보유 크리스탈</div><div className="stat-value">{number(balance)} <span style={{fontSize:15,color:"#9b87d7"}}>💎</span></div><div className="stat-foot">가장 최근 보유량 기록 기준</div></section>
          <section className="card stat"><div className="stat-icon" style={{background:"#ffeaf2",color:"#d98bab"}}><Target size={16}/></div><div className="stat-label">목표 달성률</div><div className="stat-value">{progress}<span style={{fontSize:15}}>%</span></div><div className="stat-foot">{number(remaining)}개 더 모으면 목표 달성</div></section>
          <section className="card stat"><div className="stat-icon" style={{background:"#e5f4ff",color:"#6d9ed2"}}><CalendarDays size={16}/></div><div className="stat-label">현재 추세 기준 예상</div><div className="stat-value">{eta === null ? "기록 필요" : eta + "일 후"}</div><div className="stat-foot">{daily > 0 ? "일평균 순증가 " + number(Math.round(daily)) + "개" : "기록이 쌓이면 예상일을 계산해요"}</div></section>
        </div>
        <div className="section-head"><div><h2>My Future Gacha ✦</h2><p>가장 먼저 준비하고 있는 목표예요.</p></div><Link className="pill" href="/goals">목표 관리</Link></div>
        <div className="grid content-grid">
          <section className="card panel"><div className="panel-title"><h3>{goal.card_name}</h3><span>TOP PRIORITY</span></div><div className="goal-row"><div className="goal-art">✦</div><div className="goal-info"><strong>목표까지 {number(remaining)}개 남았어요</strong><small>목표 {number(goal.target_amount)} crystals</small><div className="progress"><span style={{width: progress + "%"}}/></div><div className="goal-numbers"><span>{number(balance)} 보유</span><b>{progress}%</b></div></div></div><div style={{display:"flex",gap:8,marginTop:18,flexWrap:"wrap"}}><Link href="/goals" className="primary-btn">목표 수정하기</Link><Link href="/history" className="secondary-btn">기록 추가하기</Link></div></section>
          <section className="card panel"><div className="panel-title"><h3>Recent Activity</h3><Link href="/history"><span>전체 보기 →</span></Link></div><div className="quick-list">{transactions.slice(0,4).map(tx=><div className="quick-item" key={tx.id}><div className="quick-left"><span className="quick-icon">{tx.kind === "gain" ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}</span><span><strong>{tx.reason || (tx.kind === "gain" ? "크리스탈 획득" : "크리스탈 사용")}</strong><small>{tx.transaction_date}</small></span></div><span className={"amount " + (tx.kind === "gain" ? "positive" : "negative")}>{tx.kind === "gain" ? "+" : "-"}{number(tx.amount)}</span></div>)}</div></section>
        </div>
        <div className="section-head"><div><h2>Small steps, big dreams ♡</h2><p>오늘의 기록이 미래의 가챠를 만들어 줘요.</p></div></div>
        <div className="notice"><Heart size={16}/><span>꾸준히 기록할수록 예상 달성일이 정확해져요. 크리스탈을 사용한 날도 빠짐없이 기록해 주세요!</span></div>
      </div>
      <nav className="bottom-nav" aria-label="주요 메뉴">
        <Link className="nav-link active" href="/"><span>⌂</span>홈</Link><Link className="nav-link" href="/history"><span>▤</span>기록</Link><Link className="nav-link" href="/goals"><span>◎</span>목표</Link><Link className="nav-link" href="/analytics"><span>⌁</span>분석</Link><Link className="nav-link" href="/settings"><span>⚙</span>설정</Link>
      </nav>
    </main>
  );
}