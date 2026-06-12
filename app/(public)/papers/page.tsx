'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70');

export default function PapersPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterExam, setFilterExam] = useState('');
  const [filterTerm, setFilterTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const load = async () => {
    setLoading(true);
    let q = sb.from('v_papers_public').select('*').order('year', { ascending: false }).order('created_at', { ascending: false });
    if (filterDept) q = q.eq('department_id', filterDept);
    if (filterExam) q = q.eq('exam_type', filterExam);
    if (filterTerm) q = q.eq('term', filterTerm);
    if (filterYear) q = q.eq('year', parseInt(filterYear));
    if (filterSem) q = q.eq('semester', filterSem);
    if (search) q = q.or(`subject_name.ilike.%${search}%,teacher_name.ilike.%${search}%,course_code.ilike.%${search}%`);
    const { data } = await q.limit(100);
    setPapers(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    sb.from('departments').select('id,name,code').eq('is_active', true).order('name').then(({ data }) => setDepts(data ?? []));
  }, []);
  useEffect(() => { load(); }, [filterDept, filterExam, filterTerm, filterYear, filterSem]);

  const inp: React.CSSProperties = {
    padding: '9px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px',
    fontSize: '14px', background: 'white', color: '#111827', fontFamily: 'inherit',
    outline: 'none', transition: 'border-color 0.15s',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Hero */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>Past Papers</h1>
        <p style={{ color: '#6b7280', fontSize: '15px' }}>{loading ? 'Loading...' : `${papers.length} papers available for download`}</p>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px', marginBottom: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 220px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '16px' }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()}
                placeholder="Subject, teacher, code..." style={{ ...inp, paddingLeft: '38px', width: '100%' }} />
            </div>
          </div>
          {[
            { label: 'Department', val: filterDept, set: setFilterDept, opts: depts.map(d => ({ v: d.id, l: `${d.code} - ${d.name}` })) },
            { label: 'Exam Type', val: filterExam, set: setFilterExam, opts: [{ v: 'Mid', l: 'Mid Term' }, { v: 'Final', l: 'Final Term' }] },
            { label: 'Term', val: filterTerm, set: setFilterTerm, opts: [{ v: 'Spring', l: 'Spring' }, { v: 'Fall', l: 'Fall' }] },
            { label: 'Semester', val: filterSem, set: setFilterSem, opts: ['1','2','3','4','5','6','7','8'].map(s => ({ v: s, l: `Semester ${s}` })) },
            { label: 'Year', val: filterYear, set: setFilterYear, opts: years.map(y => ({ v: String(y), l: String(y) })) },
          ].map(({ label, val, set, opts }) => (
            <div key={label} style={{ flex: '1 1 140px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
              <select value={val} onChange={e => set(e.target.value)} style={{ ...inp, width: '100%' }}>
                <option value="">All</option>
                {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', paddingBottom: '1px' }}>
            <button onClick={load} style={{ padding: '10px 20px', background: '#1a56db', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Search</button>
            <button onClick={() => { setSearch(''); setFilterDept(''); setFilterExam(''); setFilterTerm(''); setFilterYear(''); setFilterSem(''); }}
              style={{ padding: '10px 16px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', color: '#6b7280' }}>Clear</button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px', height: '200px', animation: 'pulse 2s infinite' }}>
              <div style={{ height: '16px', background: '#f3f4f6', borderRadius: '4px', marginBottom: '12px', width: '70%' }} />
              <div style={{ height: '12px', background: '#f3f4f6', borderRadius: '4px', marginBottom: '8px', width: '40%' }} />
              <div style={{ height: '12px', background: '#f3f4f6', borderRadius: '4px', width: '60%' }} />
            </div>
          ))}
        </div>
      ) : papers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>No papers found</h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Try adjusting your search filters</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
          {papers.map(p => (
            <div key={p.id} style={{
              background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px',
              padding: '20px', display: 'flex', flexDirection: 'column',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: '700', fontSize: '15px', color: '#111827', marginBottom: '3px', lineHeight: '1.3' }}>{p.subject_name}</h3>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>{p.course_code}</span>
                </div>
                <span style={{
                  flexShrink: 0, marginLeft: '10px',
                  padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700',
                  background: p.exam_type === 'Final' ? '#dbeafe' : '#fef3c7',
                  color: p.exam_type === 'Final' ? '#1e40af' : '#92400e',
                }}>{p.exam_type}</span>
              </div>

              {/* Details */}
              <div style={{ flex: 1, marginBottom: '16px' }}>
                {[
                  { icon: '🏫', text: p.department_name },
                  { icon: '👤', text: p.teacher_name },
                  { icon: '📅', text: `Semester ${p.semester} · ${p.term} ${p.year}` },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px', color: '#4b5563' }}>
                    <span style={{ fontSize: '14px', flexShrink: 0 }}>{icon}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '14px', borderTop: '1px solid #f3f4f6' }}>
                <button onClick={() => setPreview(p)} style={{
                  flex: 1, padding: '9px', background: '#1a56db', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                }}>👁 View</button>
                <a href={p.file_url} download target="_blank" rel="noopener noreferrer" style={{
                  flex: 1, padding: '9px', background: 'white', border: '1.5px solid #e5e7eb',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  color: '#374151', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                }}>⬇ Download</a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Viewer Modal */}
      {preview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', flexDirection: 'column' }} onClick={() => setPreview(null)}>
          <div style={{ background: 'white', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            onClick={e => e.stopPropagation()}>
            <div>
              <span style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>{preview.subject_name}</span>
              <span style={{ color: '#6b7280', fontSize: '13px', marginLeft: '10px' }}>{preview.course_code} · {preview.exam_type} · {preview.term} {preview.year}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <a href={preview.file_url} download target="_blank" rel="noopener noreferrer"
                style={{ padding: '7px 16px', background: '#1a56db', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
                ⬇ Download
              </a>
              <button onClick={() => setPreview(null)}
                style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1, transform: 'rotate(-25deg)' }}>
              <span style={{ fontSize: '28px', fontWeight: '800', color: 'rgba(0,0,0,0.05)', userSelect: 'none', whiteSpace: 'nowrap', letterSpacing: '2px' }}>NTU PAST PAPERS ARCHIVE</span>
            </div>
            <iframe src={preview.file_url + '#toolbar=0'} style={{ width: '100%', height: '100%', border: 'none' }} title="Paper Preview" />
          </div>
        </div>
      )}
    </div>
  );
}
