"use client";
import Link from "next/link";
import { useState } from "react";
import { Gem, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode,setMode]=useState<"login"|"signup">("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMessage("");
    const supabase=createClient();
    if(!supabase){setMessage("Supabase 환경변수가 아직 설정되지 않았어요. Vercel 또는 .env.local에 프로젝트 URL과 공개 키를 입력해 주세요.");return;}
    setBusy(true);
    const result=mode==="login"
      ? await supabase.auth.signInWithPassword({email,password})
      : await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin}});
    setBusy(false);
    if(result.error){setMessage(result.error.message);return;}
    if(mode==="signup"&&!result.data.session){setMessage("가입 확인 메일을 보냈어요. 이메일 인증을 완료해 주세요.");return;}
    window.location.href="/";
  }
  return <main className="page-wrap"><div className="shell"><header className="topbar"><Link href="/" className="brand"><span className="brand-mark"><Gem size={20}/></span><span>RIMIIN<small>CRYSTAL PLANNER</small></span></Link><Link href="/" className="pill"><ArrowLeft size={13} style={{display:"inline",verticalAlign:"middle"}}/> 홈으로</Link></header><section className="subpage"><div className="card panel" style={{maxWidth:480,margin:"30px auto",padding:26}}><div style={{textAlign:"center",marginBottom:24}}><div className="brand-mark" style={{margin:"0 auto 14px"}}><Gem size={22}/></div><h1 style={{fontSize:25}}>Welcome to RIMIIN</h1><p className="muted">계정에 로그인하고 크리스탈 기록을 안전하게 보관하세요.</p></div><div style={{display:"flex",gap:8,marginBottom:18}}><button className={mode==="login"?"primary-btn":"secondary-btn"} style={{flex:1}} onClick={()=>setMode("login")}>로그인</button><button className={mode==="signup"?"primary-btn":"secondary-btn"} style={{flex:1}} onClick={()=>setMode("signup")}>회원가입</button></div><form className="form" onSubmit={submit}><label className="field">이메일<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label className="field">비밀번호<input type="password" required minLength={6} autoComplete={mode==="login"?"current-password":"new-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="6자 이상"/></label><button className="primary-btn" disabled={busy}>{busy?"처리 중...":mode==="login"?"로그인":"계정 만들기"}</button></form>{message&&<p className="notice" style={{marginTop:16}}>{message}</p>}<p className="muted" style={{marginTop:18,textAlign:"center"}}>로그인하면 기록과 목표가 Supabase 클라우드에 저장됩니다.</p></div></section></div></main>;
}