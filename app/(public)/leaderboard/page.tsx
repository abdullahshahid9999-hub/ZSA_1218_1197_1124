"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  "https://dvtkcuqwvkakycsseydh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70"
);

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sb.from("v_leaderboard").select("*").limit(100).then(({ data }) => {
      setEntries(data ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = entries.filter(e =>
    e.roll_number?.toLowerCase().includes(search.toLowerCase())
  );

  const openProfile = async (roll: string) => {
    setProfileLoading(true);
    setProfile({ loading: true });
    const [{ data: c }, { data: papers }] = await Promise.all([
      sb.from("contributors").select("*, departments(name,code)").eq("roll_number", roll).single(),
      sb.from("papers")
        .select("exam_type,semester,term,year,status,subjects(name,course_code),teachers(name)")
        .eq("roll_number", roll).order("created_at", { ascending: false }),
    ]);
    setProfile({ c, papers: papers ?? [] });
    setProfileLoading(false);
  };

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  const medalColor = (rank: number) => {
    if (rank === 1) return { bg: "linear-gradient(135deg,#f6d365,#fda085)", shadow: "0 8px 24px rgba(253,160,133,0.4)", label: "1st" };
    if (rank === 2) return { bg: "linear-gradient(135deg,#e0e0e0,#bdbdbd)", shadow: "0 8px 24px rgba(189,189,189,0.4)", label: "2nd" };
    if (rank === 3) return { bg: "linear-gradient(135deg,#f093fb,#c471ed)", shadow: "0 8px 24px rgba(196,113,237,0.3)", label: "3rd" };
    return { bg: "#f5f5f5", shadow: "none", label: `#${rank}` };
  };

  return (
    <div style={{ maxWidth: 820 }}>

      {/* Hero */}
      <div className="fade-up" style={{
        background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        borderRadius: 20, padding: "40px 36px", marginBottom: 32, color: "#fff",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -20, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", bottom: -30, left: 60, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.5px" }}>Leaderboard</h1>
        <p style={{ fontSize: 15, opacity: 0.9 }}>
          {loading ? "Loading…" : `${entries.length} contributors ne papers share kiye hain`}
        </p>
      </div>

      {/* Top 3 Podium */}
      {!loading && top3.length > 0 && (
        <div className="fade-up-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 14, marginBottom: 24 }}>
          {top3.map((e, i) => {
            const m = medalColor(i + 1);
            return (
              <div key={e.id} className="card-hover" style={{
                background: "#fff", borderRadius: 16,
                border: "1px solid #e8e8e8", overflow: "hidden",
                animation: `fadeUp 0.4s ${i * 0.08}s ease both`,
              }}
                onClick={() => openProfile(e.roll_number)}
              >
                <div style={{ background: m.bg, padding: "20px 20px 24px", position: "relative" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label} Place</div>
                  <div style={{ fontSize: 38, fontWeight: 900, color: "#fff", lineHeight: 1, marginTop: 6 }}>{e.total_approved}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>approved papers</div>
                </div>
                <div style={{ padding: "14px 20px" }}>
                  <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: "#111", marginBottom: 4 }}>{e.roll_number}</div>
                  {e.department_code && (
                    <span style={{ background: "#eef2ff", color: "#3b5bdb", padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700 }}>
                      {e.department_code}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rest of table */}
      <div className="fade-up-2" style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
            {filtered.length > 3 ? `All Contributors` : "Contributors"}
          </span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Roll number search…"
            style={{
              padding: "8px 13px", border: "1.5px solid #e0e0e0", borderRadius: 8,
              fontSize: 13, outline: "none", width: 220, fontFamily: "inherit",
              transition: "border-color 0.17s",
            }}
            onFocus={e => (e.target.style.borderColor = "#667eea")}
            onBlur={e => (e.target.style.borderColor = "#e0e0e0")}
          />
        </div>

        {loading ? (
          <div style={{ padding: 56, textAlign: "center" }}>
            <div style={{ display: "inline-flex", gap: 6 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#43e97b", animation: `pulse 1s ${i * 0.2}s ease infinite` }} />
              ))}
            </div>
            <p style={{ fontSize: 14, color: "#bbb", marginTop: 12 }}>Loading…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "56px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🏆</div>
            <p style={{ fontWeight: 700, color: "#333", marginBottom: 6 }}>
              {search ? "Koi result nahi mila" : "Abhi koi contributor nahi"}
            </p>
            <p style={{ fontSize: 13, color: "#bbb" }}>
              {!search && "Pehle paper contribute karo aur leaderboard pe aao!"}
            </p>
            {!search && (
              <a href="/contribute" style={{
                display: "inline-block", marginTop: 16, padding: "9px 20px",
                background: "linear-gradient(135deg,#43e97b,#38f9d7)", color: "#fff",
                borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: "none",
              }}>
                Contribute Karo
              </a>
            )}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                {["Rank","Roll Number","Dept","Approved","Action"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, idx) => {
                const rank = Number(e.rank);
                const m = medalColor(rank);
                return (
                  <tr key={e.id} className="table-row" style={{ borderBottom: "1px solid #f7f7f7", animation: `fadeUp 0.35s ${idx * 0.04}s ease both` }}>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: 7,
                        fontSize: 12, fontWeight: 800,
                        background: rank <= 3 ? m.bg : "#f5f5f5",
                        color: rank <= 3 ? "#fff" : "#aaa",
                      }}>
                        {m.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: "#111" }}>{e.roll_number}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {e.department_code && (
                        <span style={{ background: "#eef2ff", color: "#3b5bdb", padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                          {e.department_code}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: "#059669" }}>{e.total_approved}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => openProfile(e.roll_number)} style={{
                        padding: "5px 14px", background: "transparent",
                        border: "1.5px solid #e0e0e0", borderRadius: 7,
                        cursor: "pointer", fontSize: 12, color: "#555", fontWeight: 600,
                        fontFamily: "inherit", transition: "all 0.15s",
                      }}
                        onMouseEnter={ev => { ev.currentTarget.style.borderColor = "#667eea"; ev.currentTarget.style.color = "#667eea"; }}
                        onMouseLeave={ev => { ev.currentTarget.style.borderColor = "#e0e0e0"; ev.currentTarget.style.color = "#555"; }}
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Profile Modal */}
      {profile && (
        <div className="modal-overlay" onClick={() => setProfile(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            {profile.loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "#bbb" }}>Loading…</div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
                  <div>
                    <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 18, color: "#111", marginBottom: 4 }}>{profile.c?.roll_number}</div>
                    <div style={{ fontSize: 13, color: "#888" }}>{profile.c?.departments?.name ?? "—"}</div>
                  </div>
                  <button onClick={() => setProfile(null)} style={{
                    background: "#f5f5f5", border: "none", borderRadius: 8,
                    width: 34, height: 34, cursor: "pointer", fontSize: 17, color: "#888",
                  }}>✕</button>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
                  {[
                    { l: "Approved", v: profile.c?.total_approved, grad: "linear-gradient(135deg,#43e97b,#38f9d7)", c: "#065f46" },
                    { l: "Pending",  v: profile.c?.total_pending,  grad: "linear-gradient(135deg,#f6d365,#fda085)", c: "#92400e" },
                    { l: "Rejected", v: profile.c?.total_rejected, grad: "linear-gradient(135deg,#f093fb,#f5576c)", c: "#fff" },
                  ].map(({ l, v, grad, c }) => (
                    <div key={l} style={{ background: grad, borderRadius: 12, padding: "18px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{l}</div>
                      <div style={{ fontSize: 30, fontWeight: 900, color: "#fff" }}>{v ?? 0}</div>
                    </div>
                  ))}
                </div>

                {/* Papers Table */}
                <div style={{ fontSize: 11, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Upload History</div>
                <div style={{ border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#fafafa" }}>
                        {["Subject","Exam","Term","Status"].map(h => (
                          <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#bbb", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {profile.papers.map((p: any, i: number) => (
                        <tr key={i} className="table-row" style={{ borderTop: "1px solid #f5f5f5" }}>
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ fontWeight: 600, color: "#111", fontSize: 13 }}>{p.subjects?.name}</div>
                            <div style={{ fontSize: 11, color: "#bbb", fontFamily: "monospace" }}>{p.subjects?.course_code}</div>
                          </td>
                          <td style={{ padding: "10px 12px", color: "#666" }}>{p.exam_type}</td>
                          <td style={{ padding: "10px 12px", color: "#666", whiteSpace: "nowrap" }}>{p.term} {p.year}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{
                              padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                              background: p.status === "Approved" ? "#d1fae5" : p.status === "Pending" ? "#fef3c7" : "#fee2e2",
                              color: p.status === "Approved" ? "#065f46" : p.status === "Pending" ? "#92400e" : "#991b1b",
                            }}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {!profile.papers.length && (
                        <tr><td colSpan={4} style={{ padding: 28, textAlign: "center", color: "#bbb", fontSize: 13 }}>Abhi koi paper nahi</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
