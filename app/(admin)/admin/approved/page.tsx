'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q');

export default function ApprovedPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    const { data } = await sb.from('papers')
      .select('*, departments(name,code), teachers(name), subjects(name,course_code)')
      .eq('status', 'Approved').order('created_at', { ascending: false });
    setPapers(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const filtered = papers.filter(p =>
    p.subjects?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.subjects?.course_code?.toLowerCase().includes(search.toLowerCase()) ||
    p.teachers?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.roll_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '8px' }}>Approved Papers</h1>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>{papers.length} approved papers</p>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by subject, teacher, roll number..."
        style={{ padding: '9px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', width: '320px', marginBottom: '20px' }} />
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Subject','Teacher','Dept','Exam','Term/Year','Roll No','Approved On'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid #f3f4f6' : 'none' }}>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ fontWeight: '500', fontSize: '13px' }}>{p.subjects?.name}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{p.subjects?.course_code}</div>
                </td>
                <td style={{ padding: '11px 14px', fontSize: '13px' }}>{p.teachers?.name}</td>
                <td style={{ padding: '11px 14px' }}><span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>{p.departments?.code}</span></td>
                <td style={{ padding: '11px 14px', fontSize: '13px' }}>{p.exam_type}</td>
                <td style={{ padding: '11px 14px', fontSize: '13px' }}>{p.term} {p.year} · Sem {p.semester}</td>
                <td style={{ padding: '11px 14px', fontSize: '12px', fontFamily: 'monospace', color: '#6b7280' }}>{p.roll_number}</td>
                <td style={{ padding: '11px 14px', fontSize: '12px', color: '#6b7280' }}>{new Date(p.reviewed_at ?? p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No approved papers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
