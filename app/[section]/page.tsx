import Link from "next/link";
import { notFound } from "next/navigation";
import { Gem } from "lucide-react";

const pages:Record<string,{title:string;description:string;detail:string}> = {
  history:{title:"Crystal History",description:"크리스탈의 획득과 사용, 보유량을 기록하는 공간이에요.",detail:"날짜별 보유량 기록과 획득·사용 내역 입력 기능을 다음 개발 단계에서 연결할 예정이에요."},
  goals:{title:"Future Gacha",description:"미래시 목표 카드와 천장 계획을 관리해요.",detail:"카드 이름, 이미지, 목표 크리스탈, 기한, 우선순위를 등록할 수 있도록 준비 중이에요."},
  analytics:{title:"Crystal Analytics",description:"나의 크리스탈 수급 추세와 목표 달성 예상일을 확인해요.",detail:"최근 7일·30일·전체 기록을 비교하는 분석 화면을 준비 중이에요."},
  settings:{title:"Settings",description:"계정과 데이터 보관 설정을 관리해요.",detail:"클라우드 연결, JSON 백업 및 복원 기능을 추가할 예정이에요."}
};
export default async function SectionPage({params}:{params:Promise<{section:string}>}) {
  const {section}=await params;
  const page=pages[section];
  if(!page) notFound();
  return <main className="page-wrap"><div className="shell"><header className="topbar"><Link href="/" className="brand"><span className="brand-mark"><Gem size={20}/></span><span>RIMIIN<small>CRYSTAL PLANNER</small></span></Link><Link href="/" className="pill">홈으로</Link></header><section className="subpage"><div className="card panel"><div className="hero-kicker" style={{color:"#927bd0"}}>YOUR SEKAI, YOUR PLAN</div><h1>{page.title}</h1><p className="muted">{page.description}</p><div className="notice" style={{marginTop:22}}><span>✦</span><span>{page.detail}</span></div><p style={{marginTop:22}}><Link href="/" className="primary-btn">대시보드로 돌아가기</Link></p></div></section></div><nav className="bottom-nav"><Link className="nav-link" href="/"><span>⌂</span>홈</Link><Link className={"nav-link "+(section==="history"?"active":"")} href="/history"><span>▤</span>기록</Link><Link className={"nav-link "+(section==="goals"?"active":"")} href="/goals"><span>◎</span>목표</Link><Link className={"nav-link "+(section==="analytics"?"active":"")} href="/analytics"><span>⌁</span>분석</Link><Link className={"nav-link "+(section==="settings"?"active":"")} href="/settings"><span>⚙</span>설정</Link></nav></main>;
}