"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  "https://dvtkcuqwvkakycsseydh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70"
);

const DEPT_MAP: Record<string,string> = {
  CS:"Computer Science", SE:"Software Engineering", AI:"Artificial Intelligence",
  CT:"Communication Technology", TE:"Textile Engineering", ME:"Mechanical Engineering",
  MS:"Management Sciences", EE:"Electrical Engineering", CHE:"Chemical Engineering", ENV:"Environmental Sciences",
};

// Lenient: a department is recognised as long as the roll contains "NTU-<CODE>".
// So "NTU-CS", "25-NTU-CS" and "25-NTU-CS-FL-1124" all resolve to CS. The actual
// department (and its display name) is then confirmed against the database.
function parseRoll(roll: string) {
  const m = roll.trim().toUpperCase().match(/NTU-([A-Z]+)/);
  return m ? { code: m[1], name: DEPT_MAP[m[1]] ?? m[1] } : null;
}

function fileMeta(mime: string) {
  if (mime?.includes("pdf")) return { label: "PDF", bg: "#fff0f0", fg: "#e03131" };
  if (mime?.includes("image")) return { label: "Image", bg: "#e7f5ff", fg: "#1c7ed6" };
  if (mime?.includes("word") || mime?.includes("document")) return { label: "DOCX", bg: "#edf2ff", fg: "#3b5bdb" };
  return { label: "File", bg: "#f1f3f5", fg: "#666" };
}

const IconDoc = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);
const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function PapersPage() {
  const [roll, setRoll] = useState("");
  const [dept, setDept] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewer, setViewer] = useState<{ url:string; paper:any } | null>(null);
  const [busy, setBusy] = useState<string|null>(null);
  const [step, setStep] = useState<1|2|3|4>(1);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [subjectsByTeacher, setSubjectsByTeacher] = useState<Record<string, any[]>>({});
  const [rollError, setRollError] = useState("");
  const [subjectsFiltered, setSubjectsFiltered] = useState(false);

  const handleRoll = async () => {
    const parsed = parseRoll(roll);
    if (!parsed) { setRollError("Include your department code after NTU — e.g. NTU-CS."); setDept(null); return; }
    setRollError(""); setDept(null); setTeacherId(""); setSubjects([]); setSubjectId(""); setPapers([]); setStep(1);

    const { data: dRow } = await sb.from("departments").select("id,name,code").eq("code", parsed.code).eq("is_active", true).maybeSingle();
    if (!dRow) {
      setRollError(`"${parsed.code}" isn't available yet. Currently available: Computer Science (CS), Software Engineering (SE) and Artificial Intelligence (AI).`);
      return;
    }
    setDept({ code: dRow.code, name: dRow.name });

    const { data: t } = await sb.from("teachers").select("id,name,teacher_type").eq("department_id", dRow.id).eq("is_active", true).order("name");
    const teacherList = t ?? [];
    setTeachers(teacherList); setTeacherSearch("");

    // Preload all subjects for these teachers so students can also search by course code / title
    const tIds = teacherList.map((x: any) => x.id);
    const byTeacher: Record<string, any[]> = {};
    if (tIds.length > 0) {
      const { data: allSubs } = await sb.from("subjects")
        .select("id,name,course_code,credits,teacher_id")
        .in("teacher_id", tIds).eq("is_active", true).order("name");
      (allSubs ?? []).forEach((s: any) => {
        if (!byTeacher[s.teacher_id]) byTeacher[s.teacher_id] = [];
        byTeacher[s.teacher_id].push(s);
      });
    }
    setSubjectsByTeacher(byTeacher);
    setStep(2);
  };

  // Select a teacher -> show that teacher's subjects. If the student searched a
  // course (code/title), show ONLY the matching course(s); otherwise show all.
  const handleTeacher = (tid: string) => {
    setTeacherId(tid); setSubjectId(""); setPapers([]); setStep(3);
    const all = subjectsByTeacher[tid] ?? [];
    const q = teacherSearch.trim().toLowerCase();
    const matched = q ? all.filter(s =>
      s.course_code?.toLowerCase().includes(q) || s.name?.toLowerCase().includes(q)) : [];
    if (matched.length > 0) { setSubjects(matched); setSubjectsFiltered(true); }
    else { setSubjects(all); setSubjectsFiltered(false); }
  };

  const showAllSubjects = () => {
    setSubjects(subjectsByTeacher[teacherId] ?? []); setSubjectsFiltered(false);
  };

  // Select a subject -> show ONLY this subject's papers
  const handleSubject = async (sid: string) => {
    setSubjectId(sid); setPapers([]); setLoading(true); setStep(4);
    const { data: p } = await sb.from("papers")
      .select("id,subject_id,exam_type,semester,term,year,file_type,subjects(id,name,course_code),teachers(name)")
      .eq("status", "Approved")
      .eq("subject_id", sid)
      .order("year", { ascending: false });
    setPapers(p ?? []);
    setLoading(false);
  };

  const reset = () => {
    setRoll(""); setDept(null); setTeachers([]); setTeacherId("");
    setSubjects([]); setSubjectId(""); setPapers([]); setStep(1);
    setTeacherSearch(""); setSubjectsByTeacher({}); setSubjectsFiltered(false); setRollError("");
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

  const selectedSubject = subjects.find(s => s.id === subjectId);
  const selectedTeacher = teachers.find(t => t.id === teacherId);

  const tq = teacherSearch.trim().toLowerCase();
  const matchedSubjects = (tid: string) =>
    (subjectsByTeacher[tid] ?? []).filter(s =>
      s.course_code?.toLowerCase().includes(tq) || s.name?.toLowerCase().includes(tq));
  const filteredTeachers = !tq ? teachers : teachers.filter(t =>
    t.name.toLowerCase().includes(tq) || matchedSubjects(t.id).length > 0);

  const steps = [["1","Roll No."],["2","Teacher"],["3","Subject"],["4","Papers"]];

  return (
    <div style={{ maxWidth:940 }}>

      {/* Hero */}
      <div className="fade-up" style={{
        background:"linear-gradient(130deg,#6a5cff 0%,#8b5cf6 48%,#a855f7 100%)",
        borderRadius:22, padding:"44px 38px", marginBottom:24, color:"#fff",
        position:"relative", overflow:"hidden",
        boxShadow:"0 22px 50px rgba(124,92,250,0.32)",
      }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />
        <div style={{ position:"absolute", bottom:-20, right:60, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
        <h1 style={{ fontSize:28, fontWeight:800, marginBottom:8, letterSpacing:"-0.5px" }}>Past Papers Archive</h1>
        <p style={{ fontSize:15, opacity:0.85, maxWidth:480 }}>Enter your roll number, pick a teacher, then a subject to see its past papers.</p>
      </div>

      {/* Coverage / expansion notice */}
      <div className="fade-up-1" style={{
        display:"flex", gap:10, alignItems:"flex-start",
        background:"#eef4ff", border:"1px solid #d6e4ff", borderRadius:12,
        padding:"12px 16px", marginBottom:18,
      }}>
        <span style={{ fontSize:16, lineHeight:1.4, flexShrink:0 }}>🚀</span>
        <p style={{ fontSize:12.5, color:"#3b5bdb", lineHeight:1.55, margin:0 }}>
          <b>Now available:</b> Computer Science, Software Engineering and Artificial Intelligence.
          Communication Technology is being added next — and Textile is on the roadmap, Inshallah.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="fade-up-1" style={{ display:"flex", alignItems:"center", gap:6, marginBottom:20 }}>
        {steps.map(([num, label], i) => {
          const n = parseInt(num); const active = step === n; const done = step > n;
          return (
            <div key={num} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div className={`step-dot ${done ? "done" : active ? "active" : "idle"}`}>{done ? "✓" : num}</div>
                <span className="step-label" style={{ fontSize:13, fontWeight: active ? 700 : 400, color: active ? "#111" : done ? "#059669" : "#bbb" }}>{label}</span>
              </div>
              {i < steps.length - 1 && <div style={{ width:24, height:1.5, background: done ? "#059669" : "#e0e0e0", transition:"background 0.3s" }} />}
            </div>
          );
        })}
        {step > 1 && (
          <button onClick={reset} className="btn-secondary" style={{ marginLeft:"auto", padding:"5px 14px", fontSize:12 }}>
            Start Over
          </button>
        )}
      </div>

      {/* Step 1 — Roll Number */}
      <div className="section-card fade-up-1">
        <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#aaa", letterSpacing:"0.08em", marginBottom:10, textTransform:"uppercase" }}>Roll Number</label>
        <div style={{ display:"flex", gap:10 }}>
          <input value={roll} onChange={e => { setRoll(e.target.value); if (rollError) setRollError(""); }}
            onKeyDown={e => e.key === "Enter" && parseRoll(roll) && handleRoll()}
            placeholder="e.g. NTU-CS  (or 25-NTU-CS-FL-1124)" className="input-field" />
          <button onClick={handleRoll} disabled={!parseRoll(roll)} className="btn-primary"
            style={{ padding:"11px 22px", flexShrink:0, opacity: parseRoll(roll) ? 1 : 0.45 }}>
            Search
          </button>
        </div>
        {/* Format hint — department code is compulsory */}
        <p style={{ fontSize:12, color:"#888", marginTop:9, lineHeight:1.5 }}>
          📌 Your department code after <b>NTU</b> is required — Computer Science students must include <b>NTU-CS</b>.
          You can type just <b>NTU-CS</b>, or your full roll number.
        </p>

        {dept && (
          <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ background:"#d1fae5", color:"#065f46", padding:"3px 10px", borderRadius:999, fontSize:12, fontWeight:700 }}>✓ {dept.code}</span>
            <span style={{ fontSize:13, color:"#059669", fontWeight:500 }}>{dept.name}</span>
          </div>
        )}
        {rollError && (
          <p style={{ fontSize:12.5, color:"#dc2626", marginTop:9, lineHeight:1.5 }}>{rollError}</p>
        )}
      </div>

      {/* Step 2 — Select Teacher */}
      {step >= 2 && (
        <div className="section-card fade-up-2">
          <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#aaa", letterSpacing:"0.08em", marginBottom:12, textTransform:"uppercase" }}>Select Teacher</label>

          {teachers.length === 0 ? (
            <p style={{ fontSize:13, color:"#bbb" }}>No teachers found for your department.</p>
          ) : (
            <>
              {/* Search across teacher name + course code/title */}
              <div style={{ position:"relative", marginBottom:14 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <input value={teacherSearch} onChange={e => setTeacherSearch(e.target.value)}
                  placeholder="Search by teacher name, course code, or title…"
                  className="input-field" style={{ paddingLeft:38, paddingRight: teacherSearch ? 38 : 14 }} />
                {teacherSearch && (
                  <button onClick={() => setTeacherSearch("")} aria-label="Clear search"
                    style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"#f0f0f0", border:"none", borderRadius:"50%", width:22, height:22, cursor:"pointer", color:"#888", fontSize:12, lineHeight:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    ✕
                  </button>
                )}
              </div>

              {filteredTeachers.length === 0 ? (
                <p style={{ fontSize:13, color:"#bbb", padding:"4px 2px" }}>
                  No teacher or course matches “{teacherSearch}”.
                </p>
              ) : (
                <>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8, maxHeight:300, overflowY:"auto", paddingRight:2 }}>
                    {filteredTeachers.map(t => {
                      const hits = tq ? matchedSubjects(t.id) : [];
                      const byCourse = tq && !t.name.toLowerCase().includes(tq) && hits.length > 0;
                      return (
                        <button key={t.id} onClick={() => handleTeacher(t.id)}
                          className={`chip ${teacherId === t.id ? "active" : ""}`}
                          style={{ display:"inline-flex", alignItems:"center", gap:7 }}
                          title={byCourse ? `Teaches ${hits.map(h => h.course_code).join(", ")}` : undefined}>
                          {t.name}
                          {t.teacher_type === "Visiting" && (
                            <span style={{
                              fontSize:10, fontWeight:800, padding:"1px 7px", borderRadius:999,
                              background: teacherId === t.id ? "rgba(255,255,255,0.25)" : "#fff4e6",
                              color: teacherId === t.id ? "#fff" : "#e8590c",
                            }}>
                              Visiting
                            </span>
                          )}
                          {byCourse && (
                            <span style={{
                              fontSize:10, fontWeight:700, fontFamily:"monospace", padding:"1px 7px", borderRadius:999,
                              background: teacherId === t.id ? "rgba(255,255,255,0.22)" : "#eef2ff",
                              color: teacherId === t.id ? "#fff" : "#3b5bdb",
                            }}>
                              {hits[0].course_code}{hits.length > 1 ? ` +${hits.length - 1}` : ""}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ fontSize:11, color:"#bbb", marginTop:10 }}>
                    {tq ? `${filteredTeachers.length} of ${teachers.length} teachers match` : `${teachers.length} teacher${teachers.length !== 1 ? "s" : ""} in ${dept?.code ?? "your department"}`}
                  </p>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Visiting-teacher warning */}
      {step >= 3 && selectedTeacher?.teacher_type === "Visiting" && (
        <div className="fade-up-2" style={{
          background:"#fff9f0", border:"1px solid #ffd8a8", borderRadius:16,
          padding:"18px 20px", marginBottom:14,
          display:"flex", gap:14, alignItems:"flex-start",
        }}>
          <div style={{ fontSize:22, lineHeight:1, flexShrink:0 }}>⚠️</div>
          <div>
            <div style={{ fontWeight:800, fontSize:14.5, color:"#b35309", marginBottom:5 }}>
              Heads up — {selectedTeacher.name} is a Visiting teacher
            </div>
            <div style={{ fontSize:13, color:"#7c4a03", lineHeight:1.6 }}>
              Visiting teachers usually teach for a limited time (often a single semester), so their
              exam/paper pattern may not match the permanent faculty. Please use these past papers
              as <b>reference only</b> — don&apos;t assume they reflect your current course instructor&apos;s style.
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Select Subject */}
      {step >= 3 && (
        <div className="section-card fade-up-2">
          <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#aaa", letterSpacing:"0.08em", marginBottom:12, textTransform:"uppercase" }}>Select Subject</label>
          {subjectsFiltered && (
            <p style={{ fontSize:12, color:"#7c4a03", background:"#fff9f0", border:"1px solid #ffe8cc", borderRadius:8, padding:"7px 11px", marginBottom:12 }}>
              Showing only courses matching “{teacherSearch}”.{" "}
              <button onClick={showAllSubjects} style={{ background:"none", border:"none", padding:0, color:"#3b5bdb", fontWeight:700, cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>
                Show all courses
              </button>
            </p>
          )}
          {subjects.length === 0 ? (
            <p style={{ fontSize:13, color:"#bbb" }}>No subjects found for this teacher.</p>
          ) : (
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {subjects.map(s => (
                <button key={s.id} onClick={() => handleSubject(s.id)}
                  className={`chip ${subjectId === s.id ? "active" : ""}`}
                  style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontFamily:"monospace", fontWeight:700 }}>{s.course_code}</span>
                  <span>{s.name}</span>
                  {s.credits != null && (
                    <span style={{
                      fontSize:11, fontWeight:700, padding:"1px 7px", borderRadius:999,
                      background: subjectId === s.id ? "rgba(255,255,255,0.22)" : "#eef2ff",
                      color: subjectId === s.id ? "#fff" : "#3b5bdb",
                    }}>
                      {s.credits} cr
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4 — Papers for the selected subject */}
      {step === 4 && (
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
            <p style={{ fontSize:13, color:"#aaa", marginBottom:20 }}>No approved papers found for this subject yet. Be the first to contribute!</p>
            <a href="/contribute" className="btn-primary" style={{ display:"inline-block", padding:"10px 22px", textDecoration:"none", borderRadius:9 }}>
              Contribute a Paper
            </a>
          </div>
        ) : (
          <div className="fade-up-3">
            {/* Results header */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18, flexWrap:"wrap" }}>
              {selectedSubject && (
                <div style={{ minWidth:0 }}>
                  <h3 style={{ fontSize:18, fontWeight:800, color:"#111", margin:0, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <span style={{ background:"#eef2ff", color:"#3b5bdb", padding:"4px 10px", borderRadius:8, fontSize:13, fontFamily:"monospace", fontWeight:700 }}>{selectedSubject.course_code}</span>
                    {selectedSubject.name}
                  </h3>
                  {selectedTeacher && <div style={{ fontSize:13, color:"#888", marginTop:5 }}>by {selectedTeacher.name}</div>}
                </div>
              )}
              <span style={{ marginLeft:"auto", fontSize:12.5, fontWeight:700, color:"#3b5bdb", background:"#eef2ff", padding:"6px 13px", borderRadius:999, whiteSpace:"nowrap" }}>
                {papers.length} paper{papers.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Paper cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(228px,1fr))", gap:16 }}>
              {papers.map((p: any, idx: number) => {
                const ft = fileMeta(p.file_type);
                const isFinal = p.exam_type === "Final";
                return (
                  <div key={p.id} className="card-hover" style={{
                    background:"#fff", border:"1px solid #ececec", borderRadius:16, overflow:"hidden",
                    display:"flex", flexDirection:"column",
                    animation:`fadeUp 0.4s ${idx*0.05}s ease both`,
                  }}>
                    {/* exam-type accent strip */}
                    <div style={{ height:5, background: isFinal ? "linear-gradient(90deg,#667eea,#764ba2)" : "linear-gradient(90deg,#f6a93b,#fda085)" }} />

                    <div style={{ padding:"16px 18px", display:"flex", flexDirection:"column", flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                        <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:10.5, fontWeight:800, color:ft.fg, background:ft.bg, padding:"4px 9px", borderRadius:7, letterSpacing:"0.02em" }}>
                          <IconDoc /> {ft.label}
                        </span>
                        <span style={{ fontSize:10.5, fontWeight:800, letterSpacing:"0.04em", textTransform:"uppercase", color: isFinal ? "#5b3fa8" : "#b06a00", background: isFinal ? "#efeafd" : "#fff3e0", padding:"4px 10px", borderRadius:999 }}>
                          {p.exam_type}
                        </span>
                      </div>

                      <div className="paper-year" style={{ fontSize:32, fontWeight:800, color:"#111", lineHeight:1, letterSpacing:"-0.5px" }}>{p.year}</div>
                      <div style={{ fontSize:13, color:"#888", marginTop:7, marginBottom:18, display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontWeight:600, color:"#555" }}>{p.term}</span>
                        <span style={{ width:3, height:3, borderRadius:"50%", background:"#ccc" }} />
                        <span>Semester {p.semester}</span>
                      </div>

                      <div style={{ display:"flex", gap:8, marginTop:"auto" }}>
                        <button onClick={() => handleView(p)} disabled={busy === p.id} style={{
                          flex:1, display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7,
                          padding:"10px", borderRadius:10, border:"none", cursor: busy === p.id ? "default" : "pointer",
                          fontSize:13, fontWeight:700, color:"#fff", fontFamily:"inherit",
                          background:"linear-gradient(135deg,#667eea,#764ba2)", opacity: busy === p.id ? 0.6 : 1,
                          boxShadow:"0 4px 12px rgba(102,126,234,0.25)",
                        }}>
                          {busy === p.id ? "Loading…" : <><IconEye /> View</>}
                        </button>
                        <button onClick={() => handleDownload(p)} title="Download" aria-label="Download" style={{
                          width:42, flexShrink:0, display:"inline-flex", alignItems:"center", justifyContent:"center",
                          padding:"10px", borderRadius:10, border:"1px solid #e6e6e6", background:"#fff", cursor:"pointer", color:"#555",
                        }}>
                          <IconDownload />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
