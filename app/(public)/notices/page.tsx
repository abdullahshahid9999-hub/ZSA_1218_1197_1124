"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  "https://dvtkcuqwvkakycsseydh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70"
);

const CAT_COLOR: Record<string, { bg: string; fg: string }> = {
  General: { bg: "#eef2ff", fg: "#3b5bdb" }, Exam: { bg: "#fff4e6", fg: "#e8590c" },
  Result: { bg: "#ebfbee", fg: "#2b8a3e" }, Event: { bg: "#f3e8ff", fg: "#7c3aed" },
  Holiday: { bg: "#e6fcf5", fg: "#0c8599" }, Fee: { bg: "#fff9db", fg: "#b08900" },
  Urgent: { bg: "#fff5f5", fg: "#e03131" },
};

function fmtDate(d: string) {
  if (!d) return "";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch { return d; }
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sb.from("notices")
      .select("*")
      .eq("is_active", true)
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => { setNotices(data ?? []); setLoading(false); });
  }, []);

  return (
    <div style={{ maxWidth: 820 }}>

      {/* Hero */}
      <div className="fade-up" style={{
        background: "linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)",
        borderRadius: 20, padding: "40px 36px", marginBottom: 32, color: "#fff",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -20, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.5px" }}>Notices</h1>
        <p style={{ fontSize: 15, opacity: 0.95 }}>
          {loading ? "Loading notices…" : notices.length ? `${notices.length} active notice${notices.length !== 1 ? "s" : ""}` : "Announcements & updates for students"}
        </p>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: 56, textAlign: "center" }}>
          <div style={{ display: "inline-flex", gap: 6 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#4facfe", animation: `pulse 1s ${i * 0.2}s ease infinite` }} />
            ))}
          </div>
          <p style={{ fontSize: 14, color: "#bbb", marginTop: 12 }}>Loading notices…</p>
        </div>
      ) : notices.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 16, padding: "56px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
          <p style={{ fontWeight: 700, color: "#333", marginBottom: 6 }}>No notices right now.</p>
          <p style={{ fontSize: 14, color: "#999" }}>Check back later for announcements and updates.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {notices.map((n, i) => {
            const c = CAT_COLOR[n.category] ?? { bg: "#f1f3f5", fg: "#666" };
            return (
              <div key={n.id} className="card-hover" style={{
                background: "#fff", borderRadius: 16,
                border: n.is_pinned ? "1px solid #b3d9ff" : "1px solid #e8e8e8",
                borderLeft: n.is_pinned ? "4px solid #4facfe" : "1px solid #e8e8e8",
                padding: "20px 22px", animation: `fadeUp 0.4s ${i * 0.05}s ease both`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                  {n.is_pinned && <span title="Pinned" style={{ fontSize: 14 }}>📌</span>}
                  {n.category && <span style={{ background: c.bg, color: c.fg, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{n.category}</span>}
                  <span style={{ fontSize: 12, color: "#aaa", marginLeft: "auto" }}>{fmtDate(n.published_at)}</span>
                </div>

                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#111", letterSpacing: "-0.3px", marginBottom: 8 }}>{n.title}</h2>

                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{n.content}</p>

                {n.link_url && (
                  <a href={n.link_url} target="_blank" rel="noopener noreferrer" style={{
                    display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14,
                    padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 700,
                    textDecoration: "none", color: "#fff",
                    background: "linear-gradient(135deg,#4facfe,#00f2fe)",
                  }}>
                    {n.link_label || "Open link"} →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
