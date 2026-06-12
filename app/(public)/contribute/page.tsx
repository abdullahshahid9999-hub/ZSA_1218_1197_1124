'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70');

const DEPT_MAP: Record<string,string> = {
  CS:'Department of Computer Science', TE:'Textile Engineering',
  ME:'Mechanical Engineering', MS:'Management Sciences',
  EE:'Electrical Engineering', CHE:'Chemical Engineering', ENV:'Environmental Sciences',
};

function parseRoll(roll: string) {
  const m = roll.trim().toUpperCase().match(/^(\d{2})-([A-Z]+)-([A-Z]+)-[A-Z]+-\d{4,6}$/);
  if (!m || m[2] !== 'NTU') return null;
  return { code: m[3], name: DEPT_MAP[m[3]] ?? m[3] };
}

const SEMS = ['1','2','3','4','5','6','7','8'];
const CY = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_,i) => CY - i);

const inp: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  border: '1.5px solid #e5e7eb', borderRadius: '10px',
  fontSize: '14px', fontFamily: 'inherit', color: '#111827',
  background: 'white', outline: 'none', transition: 'border-color 0.15s',
  boxSizing: 'border-box',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: '600',
  color: '#374151', marginBottom: '6px',
};

export default function ContributePage() {
  const [roll, setRoll] = useState('');
  const [dept, setDept] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teacherId, setTeacherId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [examType, setExamType] = useState('');
  const [semester, setSemester] = useState('');
  const [term, setTerm] = useState('');
  const [year, setYear] = useState(CY);
  const [file, setFile] = useState<File|null>(null);
  const [fileErr, setFileErr] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const parsed = parseRoll(roll);
    if (!parsed) { setDept(null); setTeachers([]); setTeacherId(''); return; }
    setDept(parsed);
    sb.from('departments').select('id').eq('code', parsed.code).eq('is_active',true).single()
      .then(({ data: d }) => {
        if (!d) return;
        sb.from('teachers').select('id,name').eq('department_id',d.id).eq('is_active',true).order('name')
          .then(({ data }) => { setTeachers(data ?? []); setTeacherId(''); setSubjects([]); setSubjectId(''); });
      });
  }, [roll]);

  useEffect(() => {
    if (!teacherId) { setSubjects([]); setSubjectId(''); return; }
    sb.from('subjects').select('id,name,course_code').eq('teacher_id',teacherId).eq('is_active',true).order('name')
      .then(({ data }) => { setSubjects(data ?? []); setSubjectId(''); });
  }, [teacherId]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; setFileErr('');
    if (!f) { setFile(null); return; }
    const ok = ['application/pdf','image/jpeg','image/jpg','image/png','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!ok.includes(f.type)) { setFileErr('Only PDF, JPG, PNG, DOCX allowed'); setFile(null); return; }
    if (f.size > 20*1024*1024) { setFileErr('Max file size is 20MB'); setFile(null); return; }
    setFile(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setFileErr('Please select a file'); return; }
    setStatus('loading');
    const fd = new FormData();
    fd.append('roll_number', roll.trim().toUpperCase());
    fd.append('teacher_id', teacherId); fd.append('subject_id', subjectId);
    fd.append('exam_type', examType); fd.append('semester', semester);
    fd.append('term', term); fd.append('year', String(year));
    fd.append('file', file); fd.append('recaptcha_token', 'bypass');
    const res = await fetch('/api/contribute', { method: 'POST', body: fd });
    const json = await res.json();
    if (json.success) { setStatus('success'); setMsg(json.message); }
    else { setStatus('error'); setMsg(json.error); }
  };

  if (status === 'success') return (
    <div style={{ maxWidth: '540px', margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
      <div style={{ width: '80px', height: '80px', background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 24px' }}>✅</div>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>Submitted Successfully!</h2>
      <p style={{ color: '#6b7280', marginBottom: '28px', lineHeight: '1.7' }}>{msg}</p>
      <button onClick={() => { setStatus('idle'); setRoll(''); setFile(null); setTeacherId(''); setSubjectId(''); setExamType(''); setSemester(''); setTerm(''); setYear(CY); }}
        style={{ padding: '12px 28px', background: '#1a56db', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' }}>
        Submit Another Paper
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Contribute a Paper</h1>
        <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.7' }}>
          Share your past exam papers and help fellow NTU students prepare better.
          Papers are reviewed by admins before going live.
        </p>
      </div>

      {/* Info box */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px 16px', marginBottom: '28px', display: 'flex', gap: '12px' }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>ℹ️</span>
        <p style={{ fontSize: '13px', color: '#1e40af', margin: 0, lineHeight: '1.6' }}>
          Your roll number is only used for the leaderboard. Papers appear publicly after admin approval — usually within 24 hours.
        </p>
      </div>

      <form onSubmit={submit}>
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f3f4f6' }}>Your Information</h2>
          <div>
            <label style={lbl}>Roll Number <span style={{ color: '#e02424' }}>*</span></label>
            <input value={roll} onChange={e => setRoll(e.target.value)} placeholder="e.g. 25-NTU-CS-FL-1124" required style={inp}
              onFocus={e => (e.target.style.borderColor = '#1a56db')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
            {dept && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>✅</span>
                <span style={{ fontSize: '13px', color: '#059669', fontWeight: '500' }}>{dept.code} — {dept.name}</span>
              </div>
            )}
            {roll.length > 8 && !dept && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>❌</span>
                <span style={{ fontSize: '13px', color: '#dc2626' }}>Invalid format. Use: YY-NTU-DEPT-TYPE-NUMBER</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f3f4f6' }}>Paper Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={lbl}>Teacher <span style={{ color: '#e02424' }}>*</span></label>
              <select value={teacherId} onChange={e => setTeacherId(e.target.value)} required disabled={!dept} style={{ ...inp, cursor: dept ? 'pointer' : 'not-allowed', opacity: dept ? 1 : 0.6 }}>
                <option value="">{!dept ? 'Enter your roll number first' : teachers.length === 0 ? 'No teachers found for your department' : 'Select your teacher'}</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Subject <span style={{ color: '#e02424' }}>*</span></label>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required disabled={!teacherId} style={{ ...inp, cursor: teacherId ? 'pointer' : 'not-allowed', opacity: teacherId ? 1 : 0.6 }}>
                <option value="">{!teacherId ? 'Select teacher first' : subjects.length === 0 ? 'No subjects found' : 'Select subject'}</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.course_code} — {s.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={lbl}>Exam Type <span style={{ color: '#e02424' }}>*</span></label>
                <select value={examType} onChange={e => setExamType(e.target.value)} required style={{ ...inp, cursor: 'pointer' }}>
                  <option value="">Select</option>
                  <option value="Mid">Mid Term</option>
                  <option value="Final">Final Term</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Semester <span style={{ color: '#e02424' }}>*</span></label>
                <select value={semester} onChange={e => setSemester(e.target.value)} required style={{ ...inp, cursor: 'pointer' }}>
                  <option value="">Select</option>
                  {SEMS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Term <span style={{ color: '#e02424' }}>*</span></label>
                <select value={term} onChange={e => setTerm(e.target.value)} required style={{ ...inp, cursor: 'pointer' }}>
                  <option value="">Select</option>
                  <option value="Spring">Spring</option>
                  <option value="Fall">Fall</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Year <span style={{ color: '#e02424' }}>*</span></label>
                <select value={year} onChange={e => setYear(parseInt(e.target.value))} style={{ ...inp, cursor: 'pointer' }}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '28px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f3f4f6' }}>Upload File</h2>
          <div
            onClick={() => document.getElementById('file-inp')?.click()}
            style={{
              border: `2px dashed ${file ? '#059669' : '#d1d5db'}`,
              borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer',
              background: file ? '#f0fdf4' : '#fafafa', transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>{file ? '📄' : '☁️'}</div>
            {file ? (
              <div>
                <p style={{ fontWeight: '600', color: '#059669', marginBottom: '4px' }}>{file.name}</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>{(file.size/1024/1024).toFixed(2)} MB · Click to change</p>
              </div>
            ) : (
              <div>
                <p style={{ fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Click to upload or drag & drop</p>
                <p style={{ fontSize: '13px', color: '#9ca3af' }}>PDF, JPG, PNG, DOCX · Max 20MB</p>
              </div>
            )}
            <input id="file-inp" type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={handleFile} style={{ display: 'none' }} />
          </div>
          {fileErr && <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '8px' }}>⚠️ {fileErr}</p>}
        </div>

        {status === 'error' && msg && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '10px' }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
            <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{msg}</p>
          </div>
        )}

        <button type="submit" disabled={status === 'loading'} style={{
          width: '100%', padding: '14px', background: status === 'loading' ? '#93c5fd' : '#1a56db',
          color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
        }}>
          {status === 'loading' ? '⏳ Submitting your paper...' : '🚀 Submit Paper'}
        </button>
      </form>
    </div>
  );
}
