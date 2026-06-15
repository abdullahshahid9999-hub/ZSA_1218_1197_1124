
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  "https://dvtkcuqwvkakycsseydh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q"
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ departments: 0, teachers: 0, subjects: 0, pending: 0, approved: 0, rejected: 0, contributors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [d, t, s, pending, approved, rejected, c] = await Promise.all([
        sb.from("departments").select("id", { count: "exact", head: true }),
        sb.from("teachers").select("id", { count: "exact", head: true }),
        sb.from("subjects").select("id", { count: "exact", head: true }),
        sb.from("papers").select("id", { count: "exact", head: true }).eq("status", "Pending"),
        sb.from("papers").select("id", { count: "exact", head: true }).eq("status", "Approved"),
        sb.from("papers").select("id", { count: "exact", head: true }).eq("status", "Rejected"),
        sb.from("contributors").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        departments: d.count ?? 0, teachers: t.count ?? 0, subjects: s.count ?? 0,
        pending: pending.count ?? 0, approved: approved.count ?? 0,
        rejected: rejected.count ?? 0, contributors: c.count ?? 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { label: "Departments", value: stats.departments, href: "/admin/departments", color: "#3b5bdb", bg: "#eef2ff" },
    { label: "Teachers", value: stats.teachers, href: "/admin/teachers", color: "#0ea5e9", bg: "#e0f2fe" },
    { label: "Subjects", value: stats.subjects, href: "/admin/subjects", color: "#8b5cf6", bg: "#f3e8ff" },
    { label: "Contributors", value: stats.contributors, href: "/admin/contributors", color: "#f59e0b", bg: "#fef3c7" },
    { label: "Pending Review", value: stats.pending, href: "/admin/pending", color: "#f97316", bg: "#fff7ed", highlight: true },
    { label: "Approved", value: stats.approved, href: "/admin/approved", color: "#10b981", bg: "#d1fae5" },
    { label: "Rejected", value: stats.rejected, href: "/admin/rejected", color: "#ef4444", bg: "#fee2e2" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: "#888" }}>StudyNest Admin Panel — NTU Past Papers Archive</p>
      </div>

      {loading ? (
        <div style={{ color: "#aaa", fontSize: 14 }}>Loading stats…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
          {cards.map(({ label, value, href, color, bg, highlight }) => (
            <a key={label} href={href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "#fff",
                border: `1px solid ${highlight && value > 0 ? color : "#e8e8e8"}`,
                borderRadius: 12,
                padding: "20px 18px",
                cursor: "pointer",
                transition: "box-shadow 0.15s, transform 0.15s",
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; el.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = "none"; el.style.transform = "none"; }}
              >
                <div style={{ display: "inline-flex", padding: "8px 10px", borderRadius: 8, background: bg, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 800, color: highlight && value > 0 ? color : "#111", lineHeight: 1 }}>{value}</div>
              </div>
            </a>
          ))}
        </div>
      )}

      <div style={{ marginTop: 40, background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: "20px 24px" }}>
        <p style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>
          Quick links: &nbsp;
          {[["Pending", "/admin/pending"], ["Departments", "/admin/departments"], ["Teachers", "/admin/teachers"], ["Subjects", "/admin/subjects"]].map(([l, h]) => (
            <a key={h} href={h} style={{ color: "#3b5bdb", fontSize: 13, marginRight: 16, textDecoration: "none", fontWeight: 500 }}>{l}</a>
          ))}
        </p>
      </div>
    </div>
  );
}
