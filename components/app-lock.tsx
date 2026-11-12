"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";

const PASSWORD = "110341";
const SESSION_KEY = "rimiin-unlocked";

export default function AppLock({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      setUnlocked(sessionStorage.getItem(SESSION_KEY) === "true");
    } catch {
      setUnlocked(false);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !unlocked) inputRef.current?.focus();
  }, [ready, unlocked]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password === PASSWORD) {
      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch {
        // Keep this tab unlocked even if session storage is unavailable.
      }
      setError("");
      setPassword("");
      setUnlocked(true);
      return;
    }
    setPassword("");
    setError("비밀번호가 올바르지 않아요. 다시 입력해 주세요.");
    inputRef.current?.focus();
  }

  if (!ready) return <div className="app-lock-loading" aria-label="잠금 화면 불러오는 중" />;

  return (
    <>
      <div className={unlocked ? "app-content-unlocked" : "app-content-locked"} aria-hidden={!unlocked}>
        {children}
      </div>
      {!unlocked && (
        <main className="app-lock-screen">
          <div className="app-lock-glow app-lock-glow-one" />
          <div className="app-lock-glow app-lock-glow-two" />
          <section className="app-lock-card">
            <div className="app-lock-icon"><LockKeyhole size={27} strokeWidth={1.8} /></div>
            <p className="app-lock-eyebrow">PERSONAL CRYSTAL PLANNER</p>
            <h1>RIMIIN<span>.</span></h1>
            <p className="app-lock-subtitle">나만의 크리스탈 플래너</p>
            <div className="app-lock-divider" />
            <form onSubmit={submit}>
              <label className="app-lock-label" htmlFor="app-lock-password">비밀번호를 입력해 주세요</label>
              <input
                ref={inputRef}
                id="app-lock-password"
                className="app-lock-input"
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                maxLength={12}
                value={password}
                onChange={(event) => { setPassword(event.target.value); setError(""); }}
                placeholder="••••••"
                aria-describedby="app-lock-error"
              />
              <p id="app-lock-error" className="app-lock-error" role="alert">{error || " "}</p>
              <button className="app-lock-submit" type="submit" disabled={!password}>
                잠금 해제 <span>→</span>
              </button>
            </form>
            <p className="app-lock-footer"><ShieldCheck size={13} /> PRIVATE SPACE</p>
          </section>
          <p className="app-lock-copyright">RIMIIN · YOUR CRYSTALS, YOUR FUTURE</p>
        </main>
      )}
    </>
  );
}
