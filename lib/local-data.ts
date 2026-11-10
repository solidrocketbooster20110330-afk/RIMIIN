export type CrystalEntry = { id:string; entry_date:string; balance:number; memo:string };
export type CrystalTransaction = { id:string; transaction_date:string; kind:"gain"|"spend"; amount:number; reason:string };
export type CrystalGoal = { id:string; card_name:string; target_amount:number; deadline:string|null; priority:number; memo:string };
export type GoalAchievement = { id:string; goal_id:string; goal_name:string; target_amount:number; achieved_date:string };
export type GoalProgress = { goal:CrystalGoal; allocated:number; remaining:number; percent:number; completed:boolean };
export type RimiinData = { entries:CrystalEntry[]; transactions:CrystalTransaction[]; goals:CrystalGoal[]; achievements:GoalAchievement[]; home_goal_id:string|null };
const KEY="rimiin-data-v1";
const EMPTY:RimiinData={entries:[],transactions:[],goals:[],achievements:[],home_goal_id:null};
export function readData():RimiinData {
  if(typeof window==="undefined") return EMPTY;
  try {
    const raw=window.localStorage.getItem(KEY);
    if(!raw) return EMPTY;
    const parsed=JSON.parse(raw) as Partial<RimiinData>;
    return {entries:Array.isArray(parsed.entries)?parsed.entries:[],transactions:Array.isArray(parsed.transactions)?parsed.transactions:[],goals:Array.isArray(parsed.goals)?parsed.goals:[],achievements:Array.isArray(parsed.achievements)?parsed.achievements:[],home_goal_id:typeof parsed.home_goal_id==="string"?parsed.home_goal_id:null};
  } catch { return EMPTY; }
}
export function writeData(data:RimiinData):void {
  if(typeof window!=="undefined") window.localStorage.setItem(KEY,JSON.stringify(data));
}
export function makeId():string {
  return typeof crypto!=="undefined"&&"randomUUID" in crypto?crypto.randomUUID():String(Date.now())+"-"+Math.random().toString(36).slice(2);
}
/** Allocate the current crystal balance to goals in priority order, without double-counting. */
export function getGoalProgress(goals:CrystalGoal[],balance:number):GoalProgress[] {
  let unallocated=Math.max(0,Math.floor(balance));
  return [...goals].sort((a,b)=>a.priority-b.priority).map(goal=>{
    const target=Math.max(0,goal.target_amount);
    const allocated=Math.min(target,unallocated);
    unallocated-=allocated;
    const remaining=Math.max(0,target-allocated);
    return {goal,allocated,remaining,percent:target>0?Math.min(100,Math.round(allocated/target*100)):100,completed:remaining===0};
  });
}
/** Remove duplicate achievement records for the same goal. */
export function getUniqueAchievements(achievements:GoalAchievement[]):GoalAchievement[] {
  const unique=new Map<string,GoalAchievement>();
  for(const achievement of achievements) {
    if(!unique.has(achievement.goal_id)) unique.set(achievement.goal_id,achievement);
  }
  return [...unique.values()];
}
/** Persist each goal completion once, so it remains in the achievement log permanently. */
export function recordCompletedGoals(data:RimiinData):RimiinData {
  const latest=[...data.entries].sort((a,b)=>b.entry_date.localeCompare(a.entry_date))[0];
  const balance=latest?.balance??0;
  const progress=getGoalProgress(data.goals,balance);
  data.achievements=getUniqueAchievements(data.achievements);
  const known=new Set(data.achievements.map(a=>a.goal_id));
  const achievedDate=latest?.entry_date??new Date().toLocaleDateString("en-CA");
  const newlyAchieved=progress.filter(p=>p.completed&&!known.has(p.goal.id)).map(p=>({
    id:makeId(),goal_id:p.goal.id,goal_name:p.goal.card_name,target_amount:p.goal.target_amount,achieved_date:achievedDate
  }));
  if(newlyAchieved.length)data.achievements=[...data.achievements,...newlyAchieved];
  return data;
}
