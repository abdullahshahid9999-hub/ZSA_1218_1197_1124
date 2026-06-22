"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  "https://dvtkcuqwvkakycsseydh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70"
);

const METHOD_COLOR: Record<string, { bg: string; fg: string }> = {
  JazzCash: { bg: "#fde7ee", fg: "#c2185b" },
  EasyPaisa: { bg: "#e7f7ed", fg: "#1b8a4b" },
  SadaPay: { bg: "#eceefe", fg: "#4338ca" },
  Bank: { bg: "#eef2ff", fg: "#3b5bdb" },
  Other: { bg: "#f1f3f5", fg: "#555" },
};

export default function CharityPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    sb.from("charity_members")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true })
      .then(({ data }) => { setMembers(data ?? []); setLoading(false); });
  }, []);

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(c => (c === key ? null : c)), 1500);
    } catch {}
  };

  return (
    <div style={{ maxWidth: 940 }}>

      {/* Hero */}
      <div className="fade-up" style={{
        background: "linear-gradient(135deg,#0ea5e9 0%,#10b981 100%)",
        borderRadius: 22, padding: "44px 36px", marginBottom: 26, color: "#fff",
        position: "relative", overflow: "hidden",
        boxShadow: "0 22px 50px rgba(14,165,233,0.28)",
      }}>
        <div style={{ position: "absolute", top: -40, right: -20, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.10)" }} />
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 10, letterSpacing: "-0.5px" }}>Charity & Support</h1>
        <p style={{ fontSize: 15, opacity: 0.95, maxWidth: 600, lineHeight: 1.6 }}>
          Some students struggle with their semester fees. These trusted members collect donations
          to help them. Every contribution — however small — makes a real difference. 💚
        </p>
      </div>

      {/* Safety note */}
      <div className="fade-up-1" style={{
        background: "#fffaf0", border: "1px solid #ffe2b0", borderRadius: 12,
        padding: "12px 16px", marginBottom: 22, display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
        <p style={{ fontSize: 12.5, color: "#8a5a00", lineHeight: 1.55, margin: 0 }}>
          Please confirm the account name before sending, and donate only what you can. StudyNest lists
          these members in good faith but does not process or hold any money itself.
        </p>
      </div>

      {/* Members */}
      {loading ? (
        <div style={{ padding: 56, textAlign: "center" }}>
          <div style={{ display: "inline-flex", gap: 6 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", animation: `pulse 1s ${i * 0.2}s ease infinite` }} />
            ))}
          </div>
          <p style={{ fontSize: 14, color: "#bbb", marginTop: 12 }}>Loading…</p>
        </div>
      ) : members.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 16, padding: "56px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>💚</div>
          <p style={{ fontWeight: 700, color: "#333", marginBottom: 6 }}>No charity members listed yet.</p>
          <p style={{ fontSize: 14, color: "#999" }}>Check back soon.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 18 }}>
          {members.map((m, i) => (
            <div key={m.id} className="card-hover" style={{
              background: "#fff", borderRadius: 16, border: "1px solid #e8e8e8",
              padding: 22, animation: `fadeUp 0.4s ${i * 0.07}s ease both`,
              display: "flex", flexDirection: "column",
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{
                  width: 54, height: 54, borderRadius: "50%", flexShrink: 0,
                  background: m.avatar_url ? `center/cover no-repeat url(${m.avatar_url})` : "linear-gradient(135deg,#0ea5e9,#10b981)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 21,
                  boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
                }}>
                  {!m.avatar_url && (m.name?.[0]?.toUpperCase() ?? "?")}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 17, color: "#111", letterSpacing: "-0.3px" }}>{m.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginTop: 3 }}>
                    {m.department && <span style={{ fontSize: 12.5, color: "#0d9488", fontWeight: 600 }}>{m.department}</span>}
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: m.is_passout ? "#f3e8ff" : "#e7f7ed", color: m.is_passout ? "#7c3aed" : "#1b8a4b" }}>
                      {m.is_passout ? "Alumnus" : "Current Student"}
                    </span>
                  </div>
                </div>
              </div>

              {m.info && <p style={{ fontSize: 13.5, color: "#555", lineHeight: 1.6, marginBottom: 16 }}>{m.info}</p>}

              {/* Payment accounts */}
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: "auto" }}>
                {(Array.isArray(m.payments) ? m.payments : []).map((p: any, idx: number) => {
                  const c = METHOD_COLOR[p.method] ?? METHOD_COLOR.Other;
                  const key = `${m.id}-${idx}`;
                  return (
                    <div key={idx} style={{ border: "1px solid #eee", borderRadius: 11, padding: "10px 12px", background: "#fcfcfd" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 6, background: c.bg, color: c.fg }}>{p.method}</span>
                        {p.account_name && <span style={{ fontSize: 12, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.account_name}</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: "#111", letterSpacing: "0.3px" }}>{p.number}</span>
                        <button onClick={() => copy(key, p.number)} style={{
                          padding: "5px 11px", borderRadius: 7, border: "1px solid #e0e0e0",
                          background: copied === key ? "#10b981" : "#fff", color: copied === key ? "#fff" : "#555",
                          cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", flexShrink: 0, transition: "all 0.15s",
                        }}>
                          {copied === key ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                  );
                })}
                {(!Array.isArray(m.payments) || m.payments.length === 0) && (
                  <span style={{ fontSize: 12.5, color: "#bbb" }}>No accounts listed.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
