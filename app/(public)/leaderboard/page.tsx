'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70');

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sb.from('v_leaderboard').select('*').limit(100).then(({ data }) => { setEntries(data ?? []); setLoading(false); });
  }, []);

  const filtered = entries.filter(e => e.roll_number?.toLowerCase().includes(search.toLowerCase()));

  const viewProfile = async (roll: string) => {
    const [{ data: c }, { data: papers }] = await Promise.all([
      sb.from('contributors').select('*, departments(name,code)').eq('roll_number', roll).single(),
      sb.from('papers').select('exam_type,semester,term,year,status,subjects(name,course_code),teachers(name)').eq('roll_number', roll).order('created_at',{ascending:false}),
    ]);
    setProfile({ contributor: c, papers: papers ?? [] });
  };

  const medals = ['🥇','🥈','🥉'];
  const top3 = entries.slice(0,3);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>Contributors Leaderboard</h1>
        <p style={{ color: '#6b7280', fontSize: '15px' }}>Recognizing students who make this archive possible.</p>
      </div>

      {/* Top 3 Podium */}
      {!loading && top3.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '36px' }}>
          {top3.map((e, i) => (
            <div key={e.id} style={{
              background: i === 0 ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : i === 1 ? 'linear-gradient(135deg, #f3f4f6, #e5e7eb)' : 'linear-gradient(135deg, #fef3c7, #fed7aa)',
              border: `2px solid ${i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : '#d97706'}`,
              borderRadius: '14px', padding: '20px', textAlign: 'center',
              transform: i === 0 ? 'scale(1.03)' : 'scale(1)',
              boxShadow: i === 0 ? '0 8px 24px rgba(245,158,11,0.25)' : '0 2px 8px rgba(0,0,0,0.08)',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{medals[i]}</div>
              <div style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '13px', color: '#111827', marginBottom: '4px', wordBreak: 'break-all' }}>{e.roll_number}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>{e.department_code ?? '—'}</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: i === 0 ? '#92400e' : '#374151' }}>{e.total_approved}</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>papers approved</div>
            </div>
          ))}
        </div>
      )}

      {/* Search + Table */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>All Contributors ({entries.length})</h2>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '14px' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roll number..."
              style={{ padding: '8px 12px 8px 34px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', width: '220px' }} />
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Rank','Roll Number','Dept','Approved',''].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={e.id} style={{ borderTop: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                onMouseEnter={ev => (ev.currentTarget.style.background = '#f9fafb')}
                onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '13px 16px', fontWeight: '700', fontSize: '15px' }}>
                  {Number(e.rank) <= 3 ? medals[Number(e.rank)-1] : <span style={{ color: '#9ca3af', fontSize: '13px' }}>#{e.rank}</span>}
                </td>
                <td style={{ padding: '13px 16px', fontFamily: 'monospace', fontWeight: '600', fontSize: '13px', color: '#1a56db' }}>{e.roll_number}</td>
                <td style={{ padding: '13px 16px' }}>
                  {e.department_code && <span style={{ background: '#dbeafe', color: '#1e40af', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' }}>{e.department_code}</span>}
                </td>
                <td style={{ padding: '13px 16px', fontWeight: '700', fontSize: '18px', color: '#059669' }}>{e.total_approved}</td>
                <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                  <button onClick={() => viewProfile(e.roll_number)}
                    style={{ padding: '5px 14px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                {search ? 'No contributor found.' : 'No contributors yet. Be the first!'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Profile Modal */}
      {profile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setProfile(null)}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '540px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '18px', color: '#1a56db', marginBottom: '4px' }}>{profile.contributor?.roll_number}</div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>{profile.contributor?.departments?.name ?? 'Unknown Department'}</div>
              </div>
              <button onClick={() => setProfile(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
              {[['Approved', profile.contributor?.total_approved, '#059669', '#d1fae5'],
                ['Pending', profile.contributor?.total_pending, '#d97706', '#fef3c7'],
                ['Rejected', profile.contributor?.total_rejected, '#dc2626', '#fee2e2']].map(([l,v,c,bg]) => (
                <div key={l as string} style={{ background: bg as string, borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: c as string, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{l as string}</div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: c as string }}>{v as number}</div>
                </div>
              ))}
            </div>
            <h3 style={{ fontWeight: '700', fontSize: '14px', color: '#111827', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Upload History</h3>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Subject','Exam','Term','Status'].map(h => (
                      <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {profile.papers.map((p: any, i: number) => (
                    <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: '500' }}>{p.subjects?.name}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>{p.subjects?.course_code}</div>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#6b7280' }}>{p.exam_type}</td>
                      <td style={{ padding: '10px 12px', color: '#6b7280' }}>{p.term} {p.year}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '700',
                          background: p.status==='Approved'?'#d1fae5':p.status==='Pending'?'#fef3c7':'#fee2e2',
                          color: p.status==='Approved'?'#065f46':p.status==='Pending'?'#92400e':'#991b1b',
                        }}>{p.status}</span>
                      </td>
                    </tr>
                  ))}
                  {profile.papers.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No papers yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
