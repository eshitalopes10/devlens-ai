"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  language: string | null;
  open_issues_count: number;
}

interface PR {
  number: number;
  title: string;
  body: string | null;
  user: string;
  created_at: string;
  changed_files: number;
  additions: number;
  deletions: number;
  diff: string;
}

interface UserSession {
  user?: { name?: string | null; email?: string | null; image?: string | null };
  accessToken?: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [prs, setPrs] = useState<PR[]>([]);
  const [selectedPR, setSelectedPR] = useState<PR | null>(null);
  const [review, setReview] = useState<string>("");
  const [loadingPRs, setLoadingPRs] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/github/repos").then((r) => r.json()).then(setRepos);
    }
  }, [session]);

  const loadPRs = async (repoFullName: string) => {
    setLoadingPRs(true);
    setPrs([]); setSelectedPR(null); setReview("");
    const [owner, repo] = repoFullName.split("/");
    const data = await fetch(`/api/github/prs?owner=${owner}&repo=${repo}`).then((r) => r.json());
    setPrs(data);
    setLoadingPRs(false);
  };

  const runReview = async (pr: PR) => {
    setSelectedPR(pr); setReview(""); setReviewing(true);
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diff: pr.diff, prTitle: pr.title, prBody: pr.body }),
    });
    const text = await res.text();
    setReview(text);
    setReviewing(false);
  };

  const userSession = session as UserSession;
  const userName = userSession?.user?.name ?? "";

  return (
    <div style={{ minHeight: "100vh", background: "#020408", color: "#e2f4ff", fontFamily: "'DM Mono', monospace", fontSize: 13, display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #020408; }
        ::-webkit-scrollbar-thumb { background: #0e2030; border-radius: 2px; }
        .grid-bg { position: fixed; inset: 0; background-image: linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; z-index: 0; }
        .scanlines { position: fixed; inset: 0; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.01) 2px, rgba(0,212,255,0.01) 4px); pointer-events: none; z-index: 0; }
        .navbar { display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 48px; border-bottom: 1px solid #0e2030; position: relative; z-index: 10; background: rgba(2,4,8,0.95); backdrop-filter: blur(8px); }
        .logo { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800; letter-spacing: -0.5px; }
        .logo span { color: #00d4ff; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; }
        .main-layout { display: grid; grid-template-columns: 220px 1fr 1fr; flex: 1; overflow: hidden; position: relative; z-index: 1; height: calc(100vh - 48px); }
        .sidebar { border-right: 1px solid #0e2030; padding: 16px 0; overflow-y: auto; background: rgba(6,13,20,0.8); }
        .section-label { font-size: 9px; letter-spacing: 0.15em; color: #2a4a5e; padding: 0 16px; margin: 12px 0 6px; }
        .repo-btn { width: 100%; text-align: left; padding: 10px 16px; background: transparent; border: none; border-left: 2px solid transparent; cursor: pointer; transition: all 0.15s; color: #4a7a9b; font-family: 'DM Mono', monospace; font-size: 11px; }
        .repo-btn:hover { color: #e2f4ff; background: rgba(0,212,255,0.04); }
        .repo-btn.active { color: #00d4ff; border-left-color: #00d4ff; background: rgba(0,212,255,0.06); }
        .repo-lang { font-size: 9px; color: #2a4a5e; margin-top: 2px; }
        .pr-panel { border-right: 1px solid #0e2030; display: flex; flex-direction: column; overflow: hidden; }
        .panel-header { padding: 12px 16px; border-bottom: 1px solid #0e2030; display: flex; align-items: center; justify-content: space-between; background: rgba(6,13,20,0.9); }
        .panel-label { font-size: 9px; letter-spacing: 0.15em; color: #4a7a9b; }
        .pr-list { flex: 1; overflow-y: auto; padding: 12px; }
        .pr-card { padding: 12px 14px; border: 1px solid #0e2030; border-left: 2px solid #152840; margin-bottom: 8px; cursor: pointer; transition: all 0.15s; background: transparent; font-family: 'DM Mono', monospace; width: 100%; text-align: left; color: #e2f4ff; }
        .pr-card:hover { border-color: #152840; background: rgba(0,212,255,0.03); }
        .pr-card.active { border-color: #0e2030; border-left-color: #00d4ff; background: rgba(0,212,255,0.06); }
        .pr-title-text { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: #e2f4ff; line-height: 1.4; margin-bottom: 6px; }
        .pr-meta-row { display: flex; align-items: center; gap: 8px; font-size: 10px; color: #4a7a9b; }
        .review-panel { display: flex; flex-direction: column; overflow: hidden; background: #060d14; }
        .review-header { padding: 12px 16px; border-bottom: 1px solid #0e2030; }
        .review-body { flex: 1; overflow-y: auto; padding: 20px; }
        .review-section { margin-bottom: 20px; }
        .rev-label { font-size: 9px; letter-spacing: 0.15em; color: #00d4ff; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .rev-label::after { content: ''; flex: 1; height: 1px; background: #0e2030; }
        .rev-content { font-size: 12px; color: #4a7a9b; line-height: 1.8; white-space: pre-wrap; }
        .score-box { display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(0,212,255,0.2); background: rgba(0,212,255,0.06); padding: 6px 14px; font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #00d4ff; }
        .spinner { display: flex; gap: 4px; align-items: center; }
        .spinner-dot { width: 4px; height: 4px; border-radius: 50%; background: #00d4ff; animation: pulse 1.2s infinite; }
        @keyframes pulse { 0%,80%,100%{opacity:0.2;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }
        .copy-btn { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.1em; color: #4a7a9b; background: transparent; border: 1px solid #0e2030; padding: 4px 12px; cursor: pointer; transition: all 0.15s; }
        .copy-btn:hover { color: #00d4ff; border-color: #00d4ff; }
        .empty-state { display: flex; align-items: center; justify-content: center; height: 100%; color: #2a4a5e; font-size: 11px; letter-spacing: 0.1em; flex-direction: column; gap: 8px; }
        .tag { display: inline-block; padding: 2px 8px; font-size: 9px; letter-spacing: 0.08em; border: 1px solid; }
        .tag-warn { color: #f59e0b; border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.06); }
        .tag-ok { color: #10b981; border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.06); }
        .cursor-blink { display: inline-block; width: 7px; height: 12px; background: #00d4ff; animation: blink 1s infinite; vertical-align: middle; margin-left: 4px; }
        @keyframes blink { 0%,50%{opacity:1} 51%,100%{opacity:0} }
        .review-raw { font-size: 12px; color: #7a9ab5; line-height: 1.9; white-space: pre-wrap; }
      `}</style>

      <div className="grid-bg" />
      <div className="scanlines" />

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">DEV<span>LENS</span> <span style={{ fontSize: 10, fontWeight: 400, color: "#2a4a5e", letterSpacing: "0.1em" }}></span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "#4a7a9b" }}>
          <div className="status-dot" />
          SYSTEM ONLINE
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, color: "#4a7a9b" }}>{userName}</span>
          <button onClick={() => signOut()} style={{ background: "transparent", border: "1px solid #0e2030", color: "#4a7a9b", fontFamily: "'DM Mono', monospace", fontSize: 10, padding: "4px 10px", cursor: "pointer", letterSpacing: "0.08em" }}>
            SIGN OUT
          </button>
        </div>
      </nav>

      <div className="main-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="section-label"></div>
          {repos.map((r) => (
            <button
              key={r.id}
              className={`repo-btn ${selectedRepo === r.full_name ? "active" : ""}`}
              onClick={() => { setSelectedRepo(r.full_name); loadPRs(r.full_name); }}
            >
              <div>{r.name}</div>
              <div className="repo-lang">{r.language ?? "Unknown"} · {r.open_issues_count} issues</div>
            </button>
          ))}
          <div style={{ marginTop: "auto", padding: "16px", borderTop: "1px solid #0e2030", marginLeft: 0 }}>
            <div style={{ fontSize: 9, color: "#2a4a5e", letterSpacing: "0.1em", lineHeight: 1.8 }}>
              GEMINI AI · ACTIVE<br />
              GITHUB API · CONNECTED<br />
              NEXTAUTH · AUTHORIZED
            </div>
          </div>
        </div>

        {/* PR Panel */}
        <div className="pr-panel">
          <div className="panel-header">
            <span className="panel-label"> {selectedRepo ? ` · ${selectedRepo.split("/")[1].toUpperCase()}` : ""}</span>
            {prs.length > 0 && <span style={{ fontSize: 10, color: "#00d4ff" }}>{prs.length} OPEN</span>}
          </div>
          <div className="pr-list">
            {!selectedRepo && <div className="empty-state"><div>SELECT A REPOSITORY</div><div style={{ fontSize: 9 }}>TO VIEW PULL REQUESTS</div></div>}
            {loadingPRs && <div className="empty-state"><div className="spinner">{[0,1,2].map(i => <div key={i} className="spinner-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}</div><div style={{ marginTop: 8 }}>LOADING PRs...</div></div>}
            {!loadingPRs && selectedRepo && prs.length === 0 && <div className="empty-state"><div>NO OPEN PRs</div><div style={{ fontSize: 9 }}>IN THIS REPOSITORY</div></div>}
            {prs.map((pr) => (
              <button key={pr.number} className={`pr-card ${selectedPR?.number === pr.number ? "active" : ""}`} onClick={() => runReview(pr)}>
                <div className="pr-title-text">{pr.title}</div>
                <div className="pr-meta-row">
                  <span>#{pr.number}</span>
                  <span>·</span>
                  <span>{pr.user}</span>
                  <span style={{ marginLeft: "auto", color: "#10b981" }}>+{pr.additions}</span>
                  <span style={{ color: "#ef4444" }}>-{pr.deletions}</span>
                  <span>{pr.changed_files}f</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Review Panel */}
        <div className="review-panel">
          <div className="review-header">
            <div className="panel-label">{selectedPR ? ` · PR #${selectedPR.number}` : ""}</div>
            {selectedPR && <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 600, color: "#e2f4ff", marginTop: 4 }}>{selectedPR.title}</div>}
          </div>

          {!selectedPR && !reviewing && (
            <div className="empty-state" style={{ flex: 1 }}>
              <div>SELECT A PULL REQUEST</div>
              <div style={{ fontSize: 9 }}>TO RUN AI REVIEW</div>
            </div>
          )}

          {reviewing && (
            <div className="empty-state" style={{ flex: 1 }}>
              <div className="spinner">{[0,1,2].map(i => <div key={i} className="spinner-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}</div>
              <div style={{ marginTop: 12 }}>GEMINI IS REVIEWING</div>
              <div style={{ fontSize: 9, color: "#2a4a5e" }}>ANALYSING DIFF · DETECTING ISSUES</div>
            </div>
          )}

          {review && !reviewing && (
            <>
              <div className="review-body">
                <div className="review-raw">{review}</div>
              </div>
              <div style={{ padding: "10px 16px", borderTop: "1px solid #0e2030", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 9, color: "#2a4a5e", letterSpacing: "0.1em" }}>POWERED BY GEMINI 1.5 FLASH</span>
                <button className="copy-btn" onClick={() => navigator.clipboard.writeText(review)}>COPY REPORT</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}/ /   T O D O :   a d d   l o a d i n g   a n i m a t i o n  
 