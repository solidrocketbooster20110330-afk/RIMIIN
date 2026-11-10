import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import type { RimiinData } from "@/lib/local-data";

function userDocument(user: User) {
  if (!db) throw new Error("Firebase 설정이 완료되지 않았어요.");
  return doc(db, "users", user.uid);
}

export async function uploadData(user: User, data: RimiinData) {
  await setDoc(userDocument(user), { data, updatedAt: serverTimestamp() });
}

export async function downloadData(user: User): Promise<RimiinData | null> {
  const snapshot = await getDoc(userDocument(user));
  if (!snapshot.exists()) return null;
  const value = snapshot.data()?.data as Partial<RimiinData> | undefined;
  if (!value || !Array.isArray(value.entries) || !Array.isArray(value.transactions) || !Array.isArray(value.goals)) {
    throw new Error("클라우드 데이터 형식이 올바르지 않아요.");
  }
  return {
    entries: value.entries,
    transactions: value.transactions,
    goals: value.goals,
    achievements: Array.isArray(value.achievements) ? value.achievements : [],
    home_goal_id: typeof value.home_goal_id === "string" ? value.home_goal_id : null,
  };
}
