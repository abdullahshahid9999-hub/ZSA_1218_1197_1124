'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export function PendingPapersClient({ papers }: { papers: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [error, setError] = useState('');

  async function getToken() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? '';
  }

  async function approve(id: string) {
    setLoading(id); setError('');
    const token = await getToken();
    const res = await fetch('/api/admin/approve', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ paper_id: id }) });
    const json = await res.json();
    if (json.success) router.refresh(); else setError(json.error);
    setLoading(null);
  }

  async function reject() {
    if (!rejectId || !rejectNote.trim()) { setError('Please provide a reason.'); return; }
    setLoading(rejectId); setError('');
    const token = await getToken();
    const res = await fetch('/api/admin/approve', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ paper_id: rejectId, admin_note: rejectNote }) });
    const json = await res.json();
    if (json.success) { setRejectId(null); setRejectNote(''); router.refresh(); } else setError(json.error);
    setLoading(null);
  }

  if (papers.length === 0) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>
      <p style={{ fontSize: '3rem' }}>✅</p>
      <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>All caught up! No pending papers.</p>
    </div>
  );

  return (
    <>
      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '12px', marginBottom: '16px', color: '#dc2626', fontSize: '14px' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {papers.map((p: any) => (
          <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', padding: '16px' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>{p.subject?.name}</h3>
            <p style={{ color: '#64748b', fontSize: '12px', fontFamily: 'monospace', marginBottom: '12px' }}>{p.subject?.course_code}</p>
            <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '2', marginBottom: '12px' }}>
              <div>🏫 {p.department?.name}</div>
              <div>👤 {p.teacher?.name}</div>
              <div>📝 {p.exam_type} · Sem {p.semester} · {p.term} {p.year}</div>
              <div>🎓 <span style={{ fontFamily: 'monospace' }}>{p.roll_number}</span></div>
              <div>📅 {new Date(p.created_at).toLocaleDateString()}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/authenticated/papers/${p.file_path}`} target="_blank" style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', textDecoration: 'none', color: '#374151' }}>👁 Preview</a>
              <button onClick={() => approve(p.id)} disabled={loading === p.id} style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', flex: 1 }}>
                {loading === p.id ? '...' : '✓ Approve'}
              </button>
              <button onClick={() => { setRejectId(p.id); setRejectNote(''); setError(''); }} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>✕ Reject</button>
            </div>
          </div>
        ))}
      </div>
      {rejectId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '400px' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '12px' }}>Reject Paper</h3>
            <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Reason for rejection..." rows={4}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
            {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectId(null)} style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', background: 'white' }}>Cancel</button>
              <button onClick={reject} disabled={!!loading} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
