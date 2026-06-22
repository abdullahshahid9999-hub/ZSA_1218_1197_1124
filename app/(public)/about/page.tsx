"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  "https://dvtkcuqwvkakycsseydh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70"
);

const linkBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
  textDecoration: "none", border: "1px solid #e6e6e6", color: "#444",
  background: "#fafafa", transition: "all 0.15s",
};

function IconLinkedIn() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
  );
}
function IconGitHub() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
  );
}
function IconLink() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
  );
}

export default function AboutPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [contact, setContact] = useState<any>(null);
  const [meet, setMeet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: m }, { data: c }, { data: mc }] = await Promise.all([
        sb.from("team_members").select("*").eq("is_active", true)
          .order("display_order", { ascending: true }).order("created_at", { ascending: true }),
        sb.from("contact_settings").select("*").eq("id", 1).maybeSingle(),
        sb.from("meeting_contacts").select("*").eq("is_active", true)
          .order("display_order", { ascending: true }).order("created_at", { ascending: true }),
      ]);
      setMembers(m ?? []);
      setContact(c ?? null);
      setMeet(mc ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{ maxWidth: 940 }}>

      {/* Hero */}
      <div className="fade-up" style={{
        background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
        borderRadius: 20, padding: "44px 36px", marginBottom: 32, color: "#fff",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -20, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 10, letterSpacing: "-0.5px" }}>About Us</h1>
        <p style={{ fontSize: 15, opacity: 0.92, maxWidth: 560, lineHeight: 1.6 }}>
          StudyNest is built and maintained by students, for students — a free archive of NTU past papers.
          Meet the people behind the project.
        </p>
      </div>

      {/* Team */}
      {loading ? (
        <div style={{ padding: 56, textAlign: "center" }}>
          <div style={{ display: "inline-flex", gap: 6 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#764ba2", animation: `pulse 1s ${i * 0.2}s ease infinite` }} />
            ))}
          </div>
          <p style={{ fontSize: 14, color: "#bbb", marginTop: 12 }}>Loading team…</p>
        </div>
      ) : members.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 16, padding: "56px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
          <p style={{ fontWeight: 700, color: "#333", marginBottom: 6 }}>Team details coming soon.</p>
          <p style={{ fontSize: 14, color: "#999" }}>The people behind StudyNest will appear here shortly.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>
          {members.map((m, i) => (
            <div key={m.id} className="card-hover" style={{
              background: "#fff", borderRadius: 16, border: "1px solid #e8e8e8",
              padding: 24, animation: `fadeUp 0.4s ${i * 0.07}s ease both`,
              display: "flex", flexDirection: "column",
            }}>
              {/* Avatar + name */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
                  background: m.avatar_url ? `center/cover no-repeat url(${m.avatar_url})` : "linear-gradient(135deg,#667eea,#764ba2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 22,
                  boxShadow: "0 4px 14px rgba(102,126,234,0.3)",
                }}>
                  {!m.avatar_url && (m.name?.[0]?.toUpperCase() ?? "?")}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 17, color: "#111", letterSpacing: "-0.3px" }}>{m.name}</div>
                  {m.role && <div style={{ fontSize: 13, color: "#764ba2", fontWeight: 600, marginTop: 2 }}>{m.role}</div>}
                </div>
              </div>

              {/* Quote */}
              {m.quote && (
                <div style={{
                  borderLeft: "3px solid #e0d8f5", paddingLeft: 12, margin: "2px 0 14px",
                  fontStyle: "italic", fontSize: 13.5, color: "#666", lineHeight: 1.5,
                }}>
                  “{m.quote}”
                </div>
              )}

              {/* Info */}
              {m.info && (
                <p style={{ fontSize: 13.5, color: "#555", lineHeight: 1.6, marginBottom: 16 }}>{m.info}</p>
              )}

              {/* Links */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "auto", paddingTop: 4 }}>
                {m.linkedin_url && (
                  <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer" style={linkBtn}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#0a66c2"; e.currentTarget.style.color = "#0a66c2"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e6e6e6"; e.currentTarget.style.color = "#444"; }}>
                    <IconLinkedIn /> LinkedIn
                  </a>
                )}
                {m.github_url && (
                  <a href={m.github_url} target="_blank" rel="noopener noreferrer" style={linkBtn}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#111"; e.currentTarget.style.color = "#111"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e6e6e6"; e.currentTarget.style.color = "#444"; }}>
                    <IconGitHub /> GitHub
                  </a>
                )}
                {Array.isArray(m.links) && m.links.map((l: any, idx: number) => (
                  l?.url ? (
                    <a key={idx} href={l.url} target="_blank" rel="noopener noreferrer" style={linkBtn}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#764ba2"; e.currentTarget.style.color = "#764ba2"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#e6e6e6"; e.currentTarget.style.color = "#444"; }}>
                      <IconLink /> {l.label || "Link"}
                    </a>
                  ) : null
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Us */}
      <div className="fade-up" style={{ marginTop: 44 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", letterSpacing: "-0.4px", marginBottom: 6 }}>Contact Us</h2>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 20, maxWidth: 560, lineHeight: 1.6 }}>
          {contact?.intro || "Want to collaborate, contribute, or just share an idea? We'd love to hear from you."}
        </p>

        {/* Email — horizontal banner */}
        <div style={{
          background: "#fff", border: "1px solid #e8e8e8", borderRadius: 16,
          padding: "20px 24px", marginBottom: 22,
          display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap",
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: "linear-gradient(135deg,#667eea,#764ba2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✉️</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 3 }}>Reach out by email</h3>
            <p style={{ fontSize: 13, color: "#777", lineHeight: 1.5 }}>For collaborations, ideas, corrections, or anything StudyNest.</p>
          </div>
          {contact?.contact_email ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
              <a href={`mailto:${contact.contact_email}`} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                textDecoration: "none", color: "#fff", whiteSpace: "nowrap",
                background: "linear-gradient(135deg,#667eea,#764ba2)",
              }}>
                Email us →
              </a>
              <span style={{ fontSize: 12, color: "#999", fontFamily: "monospace" }}>{contact.contact_email}</span>
            </div>
          ) : (
            <span style={{ fontSize: 13, color: "#aaa" }}>Email coming soon.</span>
          )}
        </div>

        {/* Meet on campus — polished cards */}
        {meet.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🎓</span> Meet us on campus
            </h3>
            <p style={{ fontSize: 13.5, color: "#666", lineHeight: 1.6, marginBottom: 16 }}>
              An NTU student and want to meet in person? Here&apos;s where to find us:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(248px,1fr))", gap: 14 }}>
              {meet.map((c, i) => (
                <div key={c.id} className="card-hover" style={{
                  background: "#fff", border: "1px solid #e8e8e8", borderRadius: 14, padding: 18,
                  animation: `fadeUp 0.4s ${i * 0.06}s ease both`,
                }}>
                  {/* Avatar + name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: (c.section || c.semester || c.availability) ? 12 : 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg,#667eea,#764ba2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 800, fontSize: 17,
                      boxShadow: "0 4px 12px rgba(102,126,234,0.28)",
                    }}>
                      {c.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#111", letterSpacing: "-0.2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                      {c.department && <div style={{ fontSize: 12.5, color: "#764ba2", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.department}</div>}
                    </div>
                  </div>

                  {/* Section / Semester tags */}
                  {(c.section || c.semester) && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: c.availability ? 10 : 0 }}>
                      {c.section && (
                        <span style={{ background: "#eef2ff", color: "#3b5bdb", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>Section {c.section}</span>
                      )}
                      {c.semester && (
                        <span style={{ background: "#f3e8ff", color: "#7c3aed", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>Semester {c.semester}</span>
                      )}
                    </div>
                  )}

                  {/* Availability */}
                  {c.availability && (
                    <div style={{ display: "flex", gap: 7, alignItems: "flex-start", fontSize: 12.5, color: "#777", lineHeight: 1.5 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9a6dd7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{c.availability}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Funny open-source note */}
        <div style={{
          background: "#fffaf0", border: "1px dashed #f0c36d", borderRadius: 14,
          padding: "16px 20px", display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <div style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>🔓</div>
          <div style={{ fontSize: 13, color: "#7a5d14", lineHeight: 1.65 }}>
            <b>Fun fact:</b> StudyNest is a proudly <b>open-source</b> project… with a strictly <b>private repository</b>.
            Open in spirit, locked in practice — a bit like the library during finals week. 😄 (Feel free to star
            the repo. You can&apos;t, but the thought counts.)
          </div>
        </div>
      </div>
    </div>
  );
}
