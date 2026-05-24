"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session, router]);

  return (
    <main style={{
      minHeight: "100vh",
      background: "#020408",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Mono', monospace",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        .grid-bg {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
        .scanlines {
          position: absolute; inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.012) 2px, rgba(0,212,255,0.012) 4px);
          pointer-events: none; z-index: 1;
        }
        .login-box {
          position: relative; z-index: 2;
          border: 1px solid #0e2030;
          background: #060d14;
          padding: 48px 56px;
          width: 440px;
        }
        .corner { position: absolute; width: 14px; height: 14px; border-color: #00d4ff; border-style: solid; opacity: 0.6; }
        .tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
        .tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
        .bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
        .br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }
        .login-btn {
          width: 100%; padding: 14px;
          background: transparent;
          border: 1px solid #00d4ff;
          color: #00d4ff;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.12em;
          cursor: pointer;
          transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .login-btn:hover { background: rgba(0,212,255,0.08); box-shadow: 0 0 20px rgba(0,212,255,0.15); }
        .blink { animation: blink 1s infinite; }
        @keyframes blink { 0%,50%{opacity:1} 51%,100%{opacity:0} }
        .fade-in { animation: fadeIn 0.8s ease forwards; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="grid-bg" />
      <div className="scanlines" />

      <div className="login-box fade-in">
        <div className="corner tl" />
        <div className="corner tr" />
        <div className="corner bl" />
        <div className="corner br" />

        <div style={{ marginBottom: 8, fontSize: 10, letterSpacing: "0.2em", color: "#4a7a9b" }}>
          
        </div>

        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: "-1px",
          color: "#e2f4ff",
          marginBottom: 4,
          lineHeight: 1,
        }}>
          DEV<span style={{ color: "#00d4ff" }}>LENS</span>
        </h1>

        <div style={{ fontSize: 11, color: "#2a4a5e", letterSpacing: "0.1em", marginBottom: 32 }}>
          AI-POWERED CODE REVIEW SYSTEM
        </div>

        <div style={{ marginBottom: 32 }}>
          {["Connects to your GitHub repos", "Fetches open pull requests", "AI reviews every diff instantly"].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 12, color: "#4a7a9b" }}>
              <div style={{ width: 4, height: 4, background: "#00d4ff", borderRadius: "50%", opacity: 0.6 }} />
              {item}
            </div>
          ))}
        </div>

        <button className="login-btn" onClick={() => signIn("github")}>
          <svg width="16" height="16" fill="#00d4ff" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          AUTHENTICATE WITH GITHUB
        </button>

        <div style={{ marginTop: 20, fontSize: 10, color: "#152840", textAlign: "center", letterSpacing: "0.08em" }}>
          GEMINI AI · GITHUB REST API · NEXTAUTH
        </div>
      </div>
    </main>
  );
}