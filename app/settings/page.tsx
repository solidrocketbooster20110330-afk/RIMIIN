"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { Download, Gem, Link2, LogOut, RefreshCw, Upload } from "lucide-react";
import { auth, firebaseConfigured } from "@/lib/firebase";
import { downloadData, uploadData } from "@/lib/cloud-sync";
import { readData, writeData, type RimiinData } from "@/lib/local-data";

export default function SettingsPage() {
 const [message,setMessage]=useState("");
 const [user,setUser]=useState<User|null>(null);
 const [authLoading,setAuthLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [cloudExists,setCloudExists]=useState<boolean|null>(null);

 useEffect(()=>{
  if(!auth){setAuthLoading(false);return;}
  return onAuthStateChanged(auth,(current)=>{setUser(current);setAuthLoading(false);setCloudExists(null);});
 },[]);

 async function connectGoogle(){
  if(!auth)return;
  setBusy(true);setMessage("");
  try{
   const provider=new GoogleAuthProvider();
   provider.setCustomParameters({prompt:"select_account"});
   await signInWithPopup(auth,provider);
   setMessage("Google 계정이 연결됐어요. 기존 데이터를 확인한 뒤 동기화를 진행해 주세요.");
  }catch(error){setMessage(error instanceof Error?error.message:"Google 로그인에 실패했어요.");}
  finally{setBusy(false);}
 }
 async function disconnectGoogle(){
  if(!auth||!window.confirm("Google 계정 연결을 해제할까요? 이 기기의 기존 데이터는 유지됩니다."))return;
  setBusy(true);
  try{await signOut(auth);setCloudExists(null);setMessage("계정 연결을 해제했어요. 이 기기의 데이터는 그대로 남아 있어요.");}
  catch(error){setMessage(error instanceof Error?error.message:"로그아웃에 실패했어요.");}
  finally{setBusy(false);}
 }
 async function inspectCloud(){
  if(!user)return;
  setBusy(true);setMessage("");
  try{
   const cloud=await downloadData(user);
   setCloudExists(cloud!==null);
   setMessage(cloud?"클라우드 데이터가 있어요. 가져오기를 선택하면 현재 기기 데이터가 교체됩니다.":"클라우드에 저장된 데이터가 없어요. 현재 기기 데이터를 업로드해 주세요.");
  }catch(error){setMessage(error instanceof Error?error.message:"클라우드 확인에 실패했어요.");}
  finally{setBusy(false);}
 }
 async function importCloud(){
  if(!user)return;
  if(!window.confirm("클라우드 데이터를 현재 기기에 가져올까요? 현재 기기의 데이터는 클라우드 데이터로 교체됩니다."))return;
  setBusy(true);
  try{
   const cloud=await downloadData(user);
   if(!cloud){setMessage("가져올 클라우드 데이터가 없어요.");return;}
   writeData(cloud);
   setMessage("클라우드 데이터를 가져왔어요. 화면을 새로고침하면 반영됩니다.");
  }catch(error){setMessage(error instanceof Error?error.message:"데이터 가져오기에 실패했어요.");}
  finally{setBusy(false);}
 }
 async function uploadLocal(){
  if(!user)return;
  if(!window.confirm("현재 기기의 데이터를 클라우드에 업로드할까요? 기존 클라우드 데이터는 덮어써집니다."))return;
  setBusy(true);
  try{await uploadData(user,readData());setCloudExists(true);setMessage("현재 기기 데이터를 클라우드에 저장했어요.");}
  catch(error){setMessage(error instanceof Error?error.message:"데이터 업로드에 실패했어요.");}
  finally{setBusy(false);}
 }
 function backup(){const data=readData();const blob=new Blob([JSON.stringify({app:"RIMIIN",version:2,exportedAt:new Date().toISOString(),...data},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="rimiin-backup-"+new Date().toISOString().slice(0,10)+".json";a.click();URL.revokeObjectURL(url);setMessage("백업 파일을 다운로드했어요.");}
 function restore(e:React.ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const raw=JSON.parse(String(reader.result));if(!Array.isArray(raw.entries)||!Array.isArray(raw.transactions)||!Array.isArray(raw.goals))throw new Error("형식이 올바르지 않아요.");const data:RimiinData={entries:raw.entries,transactions:raw.transactions,goals:raw.goals,achievements:Array.isArray(raw.achievements)?raw.achievements:[],home_goal_id:typeof raw.home_goal_id==="string"?raw.home_goal_id:null};writeData(data);setMessage("백업 데이터를 복원했어요. 페이지를 새로고침하면 반영됩니다.");}catch(err){setMessage(err instanceof Error?err.message:"백업 파일을 읽지 못했어요.");}};reader.readAsText(file);e.target.value="";}
 function clear(){if(!window.confirm("저장된 모든 기록과 목표를 삭제할까요? 이 작업은 되돌릴 수 없어요."))return;writeData({entries:[],transactions:[],goals:[],achievements:[],home_goal_id:null});setMessage("이 브라우저에 저장된 데이터를 삭제했어요.");}
 const actionStyle={display:"inline-flex",alignItems:"center",gap:7};
 return <main className="page-wrap"><div className="shell"><header className="topbar"><Link href="/" className="brand"><span className="brand-mark"><Gem size={20}/></span><span>RIMIIN<small>CRYSTAL PLANNER</small></span></Link></header><section className="subpage"><h1>Settings</h1><p className="muted">계정과 데이터를 관리해요.</p><div className="grid" style={{maxWidth:620,marginTop:20}}>
 <section className="card panel"><h3 style={{marginTop:0,display:"flex",alignItems:"center",gap:8}}><Link2 size={18}/> 계정 연동</h3><p className="muted">Google 계정을 연결하면 여러 기기에서 RIMIIN 데이터를 공유할 수 있어요.</p>
 {!firebaseConfigured?<><p className="muted" style={{fontSize:13}}>Firebase 프로젝트 설정이 아직 필요해요. 설정값을 연결하면 Google 로그인을 사용할 수 있어요.</p><button className="primary-btn" disabled>Google 계정 연결 준비 중</button></>:authLoading?<p className="muted">계정 상태 확인 중...</p>:user?<><p style={{fontWeight:700,marginBottom:12}}>{user.displayName||"Google 계정"}<br/><span className="muted" style={{fontWeight:400,fontSize:13}}>{user.email}</span></p><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button className="primary-btn" style={actionStyle} onClick={inspectCloud} disabled={busy}><RefreshCw size={15}/> 클라우드 확인</button><button className="secondary-btn" style={actionStyle} onClick={disconnectGoogle} disabled={busy}><LogOut size={15}/> 연결 해제</button></div>{cloudExists&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12}}><button className="primary-btn" onClick={importCloud} disabled={busy}>클라우드 데이터 가져오기</button><button className="secondary-btn" onClick={uploadLocal} disabled={busy}>현재 기기 데이터 업로드</button></div>}{cloudExists===false&&<button className="primary-btn" style={{marginTop:12}} onClick={uploadLocal} disabled={busy}>현재 기기 데이터 업로드</button>}</>:<button className="primary-btn" style={actionStyle} onClick={connectGoogle} disabled={busy}><GoogleIcon/> Google 계정으로 연결</button>}
 </section>
 <section className="card panel"><h3 style={{marginTop:0}}>데이터 백업</h3><p className="muted">보유량, 획득·사용 내역, 목표, 달성 기록을 JSON 파일로 내려받을 수 있어요.</p><button className="primary-btn" onClick={backup}><Download size={15} style={{display:"inline",verticalAlign:"middle",marginRight:7}}/>JSON 백업 다운로드</button></section>
 <section className="card panel"><h3 style={{marginTop:0}}>백업 복원</h3><p className="muted">이전에 내려받은 RIMIIN JSON 파일을 불러와요. 현재 데이터는 백업 내용으로 교체됩니다.</p><label className="secondary-btn" style={{display:"inline-block",cursor:"pointer"}}><Upload size={15} style={{display:"inline",verticalAlign:"middle",marginRight:7}}/>JSON 파일 선택<input type="file" accept="application/json,.json" onChange={restore} style={{display:"none"}}/></label></section>
 <section className="card panel"><h3 style={{marginTop:0}}>데이터 초기화</h3><p className="muted">현재 브라우저에 저장된 모든 크리스탈 기록과 목표를 삭제해요.</p><button className="secondary-btn" onClick={clear}>전체 데이터 삭제</button></section>
 </div>{message&&<p className="notice" style={{marginTop:14}}>{message}</p>}<p className="muted" style={{marginTop:20}}>클라우드 데이터는 직접 가져오기 또는 업로드로 관리해요. 중요한 데이터는 JSON 백업도 함께 보관해 주세요.</p></section></div></main>;
}
function GoogleIcon(){return <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.91c-.58 2.96-2.26 5.48-4.75 7.18l7.73 6C44.4 37.96 46.98 31.84 46.98 24.55z"/><path fill="#FBBC05" d="M10.54 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.17 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>}
