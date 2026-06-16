"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  "https://dvtkcuqwvkakycsseydh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q"
);

const DEPT_MAP: Record<string,string> = {
  CS:"Computer Science", TE:"Textile Engineering", ME:"Mechanical Engineering",
  MS:"Management Sciences", EE:"Electrical Engineering", CHE:"Chemical Engineering", ENV:"Environmental Sciences",
};

function parseRoll(roll: string) {
  const m = roll.trim().toUpperCase().match(/^\d{2}-NTU-([A-Z]+)-[A-Z]+-\d{4,6}$/);
  return m ? { code: m[1], name: DEPT_MAP[m[1]] ?? m[1] } : null;
}

export default function PapersPage() {
  const [roll, setRoll] = useState("");
  const [dept, setDept] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [viewer, setViewer] = useState<{ url:string; paper:any } | null>(null);
  const [busy, setBusy] = useState<string|null>(null);
  const [step, setStep] = useState<1|2|3|4>(1);

  const handleRoll = async () => {
    const parsed = parseRoll(roll);
    if (!parsed) return;
    setDept(parsed); setTeacherId(""); setSubjectId(""); setPapers([]); setSearched(false);
    const { data: dRow } = await sb.from("departments").select("id").eq("code", parsed.code).eq("is_active", true).single();
    if (!dRow) return;
    const { data: t } = await sb.from("teachers").select("id,name").eq("department_id", dRow.id).eq("is_active", true).order("name");
    setTeachers(t ?? []); setStep(2);
  };

  const handleTeacher = async (tid: string) => {
    setTeacherId(tid); setSubjectId(""); setPapers([]); setSearched(false);
    const { data: s } = await sb.from("subjects").select("id,name,course_code").eq("teacher_id", tid).eq("is_active", true).order("name");
    setSubjects(s ?? []); setStep(3);
  };

  const handleSubject = async (sid: string, sname: string) => {
    setSubjectId(sid); setSubjectName(sname); setLoading(true); setSearched(true);
    const { data } = await sb.from("papers")
      .select("id,exam_type,semester,term,year,file_type,subjects(name,course_code),teachers(name)")
      .eq("status", "Approved").eq("subject_id", sid).order("year", { ascending: false });
    setPapers(data ?? []); setLoading(false); setStep(4);
  };

  const reset = () => {
    setRoll(""); setDept(null); setTeachers([]); setTeacherId("");
    setSubjects([]); setSubjectId(""); setSubjectName(""); setPapers([]); setSearched(false); setStep(1);
  };

  const handleView = async (paper: any) => {
    setBusy(paper.id);
    try {
      const res = await fetch(`/api/papers/signed?id=${paper.id}`);
      const json = await res.json();
      if (json.url) setViewer({ url: json.url, paper });
      else alert("Unable to load file. Please contact the administrator.");
    } catch { alert("Network error. Please try again."); }
    setBusy(null);
  };

  const handleDownload = (paper: any) => {
    const a = document.createElement("a");
    a.href = `/api/papers/signed?id=${paper.id}&action=download`;
    a.target = "_blank"; a.rel = "noopener noreferrer";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const steps = [["1","Roll No."],["2","Teacher"],["3","Subject"],["4","Papers"]];

  return (
    <div style={{ maxWidth:940 }}>

      {/* Hero */}
      <div className="fade-up" style={{
        background:"linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
        borderRadius:20, padding:"40px 36px", marginBottom:28, color:"#fff",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />
        <div style={{ position:"absolute", bottom:-20, right:60, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
        <h1 style={{ fontSize:28, fontWeight:800, marginBottom:8, letterSpacing:"-0.5px" }}>Past Papers Archive</h1>
        <p style={{ fontSize:15, opacity:0.85, maxWidth:480 }}>Enter your roll number to instantly browse past papers for your department, teacher, and subject.</p>
      </div>

      {/* Step Indicator */}
      <div className="fade-up-1" style={{ display:"flex", alignItems:"center", gap:6, marginBottom:20 }}>
        {steps.map(([num, label], i) => {
          const n = parseInt(num); const active = step === n; const done = step > n;
          return (
            <div key={num} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div className={`step-dot ${done ? "done" : active ? "active" : "idle"}`}>{done ? "✓" : num}</div>
                <span style={{ fontSize:13, fontWeight: active ? 700 : 400, color: active ? "#111" : done ? "#059669" : "#bbb" }}>{label}</span>
              </div>
              {i < 3 && <div style={{ width:28, height:1.5, background: done ? "#059669" : "#e0e0e0", transition:"background 0.3s" }} />}
            </div>
          );
        })}
        {step > 1 && (
          <button onClick={reset} className="btn-secondary" style={{ marginLeft:"auto", padding:"5px 14px", fontSize:12 }}>
            Start Over
          </button>
        )}
      </div>

      {/* Step 1 */}
      <div className="section-card fade-up-1">
        <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#aaa", letterSpacing:"0.08em", marginBottom:10, textTransform:"uppercase" }}>Roll Number</label>
        <div style={{ display:"flex", gap:10 }}>
          <input value={roll} onChange={e => setRoll(e.target.value)}
            onKeyDown={e => e.key === "Enter" && parseRoll(roll) && handleRoll()}
            placeholder="e.g. 25-NTU-CS-FL-1124" className="input-field" />
          <button onClick={handleRoll} disabled={!parseRoll(roll)} className="btn-primary"
            style={{ padding:"11px 22px", flexShrink:0, opacity: parseRoll(roll) ? 1 : 0.45 }}>
            Search
          </button>
        </div>
        {dept && (
          <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ background:"#d1fae5", color:"#065f46", padding:"3px 10px", borderRadius:999, fontSize:12, fontWeight:700 }}>✓ {dept.code}</span>
            <span style={{ fontSize:13, color:"#059669", fontWeight:500 }}>{dept.name}</span>
          </div>
        )}
        {roll.length > 8 && !parseRoll(roll) && (
          <p style={{ fontSize:12, color:"#dc2626", marginTop:8 }}>Invalid format. Example: 25-NTU-CS-FL-1124</p>
        )}
      </div>

      {/* Step 2 */}
      {step >= 2 && (
        <div className="section-card fade-up-2">
          <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#aaa", letterSpacing:"0.08em", marginBottom:14, textTransform:"uppercase" }}>Select Teacher</label>
          {teachers.length === 0 ? (
            <p style={{ fontSize:13, color:"#bbb" }}>No teachers found for your department.</p>
          ) : (
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {teachers.map(t => (
                <button key={t.id} onClick={() => handleTeacher(t.id)}
                  className={`chip ${teacherId === t.id ? "active" : ""}`}>
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3 */}
      {step >= 3 && (
        <div className="section-card fade-up-2">
          <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#aaa", letterSpacing:"0.08em", marginBottom:14, textTransform:"uppercase" }}>Select Subject</label>
          {subjects.length === 0 ? (
            <p style={{ fontSize:13, color:"#bbb" }}>No subjects found for this teacher.</p>
          ) : (
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {subjects.map(s => (
                <button key={s.id} onClick={() => handleSubject(s.id, s.name)}
                  className={`chip ${subjectId === s.id ? "active" : ""}`}>
                  <span style={{ fontFamily:"monospace", fontSize:11, opacity:0.55, marginRight:6 }}>{s.course_code}</span>
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4 */}
      {searched && (
        loading ? (
          <div className="section-card" style={{ textAlign:"center", padding:"48px 20px" }}>
            <div style={{ display:"inline-flex", gap:6 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"#ccc", animation:`pulse 1s ${i*0.2}s ease infinite` }} />
              ))}
            </div>
            <p style={{ fontSize:14, color:"#bbb", marginTop:12 }}>Searching for papers…</p>
          </div>
        ) : papers.length === 0 ? (
          <div className="section-card" style={{ textAlign:"center", padding:"56px 20px" }}>
            <div style={{ width:60, height:60, borderRadius:"50%", background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:26 }}>📭</div>
            <p style={{ fontWeight:700, color:"#333", fontSize:15, marginBottom:8 }}>No Papers Available</p>
            <p style={{ fontSize:13, color:"#aaa", marginBottom:20 }}>No approved papers found for <b>{subjectName}</b>. Be the first to contribute!</p>
            <a href="/contribute" className="btn-primary" style={{ display:"inline-block", padding:"10px 22px", textDecoration:"none", borderRadius:9 }}>
              Contribute a Paper
            </a>
          </div>
        ) : (
          <div className="fade-up-3">
            <p style={{ fontSize:13, color:"#777", marginBottom:14 }}>
              <b style={{ color:"#111", fontSize:15 }}>{papers.length}</b> paper{papers.length !== 1 ? "s" : ""} found for <b style={{ color:"#111" }}>{subjectName}</b>
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
              {papers.map((p: any, idx: number) => (
                <div key={p.id} className="card-hover" style={{
                  background:"#fff", border:"1px solid #e8e8e8", borderRadius:14, padding:20,
                  display:"flex", flexDirection:"column",
                  animation:`fadeUp 0.4s ${idx*0.05}s ease both`,
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:"#111", marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.subjects?.name}</div>
                      <div style={{ fontSize:11, color:"#bbb", fontFamily:"monospace" }}>{p.subjects?.course_code}</div>
                    </div>
                    <span className="tag" style={{
                      marginLeft:8, flexShrink:0,
                      background: p.exam_type === "Final" ? "#e8f0fe" : "#fef9e7",
                      color: p.exam_type === "Final" ? "#1a56db" : "#92400e",
                    }}>
                      {p.exam_type}
                    </span>
                  </div>
                  <div style={{ fontSize:13, color:"#999", marginBottom:16, flex:1 }}>
                    Semester {p.semester} &middot; {p.term} {p.year}
                  </div>
                  <div style={{ display:"flex", gap:8, paddingTop:14, borderTop:"1px solid #f0f0f0" }}>
                    <button onClick={() => handleView(p)} disabled={busy === p.id} className="btn-primary"
                      style={{ flex:1, padding:"9px", opacity: busy === p.id ? 0.6 : 1 }}>
                      {busy === p.id ? "Loading…" : "View"}
                    </button>
                    <button onClick={() => handleDownload(p)} className="btn-secondary" style={{ flex:1, padding:"9px" }}>
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Fullscreen Viewer */}
      {viewer && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, background:"#0f0f0f", display:"flex", flexDirection:"column", animation:"fadeIn 0.2s ease" }}>
          <div style={{ background:"#fff", padding:"10px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0, borderBottom:"1px solid #e8e8e8", gap:12 }}>
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontWeight:700, fontSize:14, color:"#111", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{viewer.paper.subjects?.name}</div>
              <div style={{ fontSize:12, color:"#888" }}>{viewer.paper.subjects?.course_code} &middot; {viewer.paper.exam_type} &middot; Semester {viewer.paper.semester} &middot; {viewer.paper.term} {viewer.paper.year}</div>
            </div>
            <div style={{ display:"flex", gap:8, flexShrink:0 }}>
              <button onClick={() => handleDownload(viewer.paper)} className="btn-primary" style={{ padding:"7px 16px" }}>Download</button>
              <button onClick={() => setViewer(null)} className="btn-secondary" style={{ width:36, height:36, padding:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>✕</button>
            </div>
          </div>
          <div style={{ flex:1, overflow:"hidden" }}>
            {viewer.paper.file_type?.includes("image") ? (
              <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"#111", overflow:"auto" }}>
                <img src={viewer.url} alt="Paper" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }} />
              </div>
            ) : (
              <iframe src={viewer.url} style={{ width:"100%", height:"100%", border:"none" }} title="Paper Viewer" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
