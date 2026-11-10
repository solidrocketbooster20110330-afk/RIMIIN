export type CrystalEntry = { id:string; entry_date:string; balance:number; memo:string };
export type CrystalTransaction = { id:string; transaction_date:string; kind:"gain"|"spend"; amount:number; reason:string };
export type CrystalGoal = { id:string; card_name:string; target_amount:number; deadline:string|null; priority:number; memo:string };
export type GoalProgress = { goal:CrystalGoal; allocated:number; remaining:number; percent:number; completed:boolean };
export type RimiinData = { entries:CrystalEntry[]; transactions:CrystalTransaction[]; goals:CrystalGoal[] };
const KEY="rimiin-data-v1";
const EMPTY:RimiinData={entries:[],transactions:[],goals:[]};
export function readData():RimiinData {
  if(typeof window==="undefined") return EMPTY;
  try {
    const raw=window.localStorage.getItem(KEY);
    if(!raw) return EMPTY;
    const parsed=JSON.parse(raw) as Partial<RimiinData>;
    return {entries:Array.isArray(parsed.entries)?parsed.entries:[],transactions:Array.isArray(parsed.transactions)?parsed.transactions:[],goals:Array.isArray(parsed.goals)?parsed.goals:[]};
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
  return [...goals]
    .sort((a,b)=>a.priority-b.priority)
    .map(goal=>{
      const target=Math.max(0,goal.target_amount);
      const allocated=Math.min(target,unallocated);
      unallocated-=allocated;
      const remaining=Math.max(0,target-allocated);
      return {goal,allocated,remaining,percent:target>0?Math.min(100,Math.round(allocated/target*100)):100,completed:remaining===0};
    });
}
