'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q');

export default function PendingPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [rejectId, setRejectId] = useState<string|null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [loading, setLoading] = useState<string|null>(null);
  const [previewUrl, setPreviewUrl] = useState<string|null>(null);

  const load = async () => {
    const { data } = await sb.from('papers')
      .select('*, departments(name,code), teachers(name), subjects(name,course_code)')
      .eq('status','Pending').order('created_at', { ascending: false });
    setPapers(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const approve = async (p: any) => {
    setLoading(p.id);
    const newPath = p.file_path.replace('pending/', 'approved/');
    await sb.storage.from('papers').move(p.file_path, newPath).catch(() => {});
    const { data: urlData } = sb.storage.from('papers').getPublicUrl(newPath);
    await sb.from('papers').update({
      status: 'Approved', file_path: newPath,
      file_url: urlData?.publicUrl, reviewed_at: new Date().toISOString()
    }).eq('id', p.id);
    setLoading(null);
    await load();
  };

  const reject = async () => {
    if (!rejectId || !rejectNote.trim()) return;
    setLoading(rejectId);
    await sb.from('papers').update({
      status: 'Rejected', admin_note: rejectNote, reviewed_at: new Date().toISOString()
    }).eq('id', rejectId);
    setRejectId(null); setRejectNote(''); setLoading(null);
    await load();
  };

  const getPreview = async (p: any) => {
    const { data } = await sb.storage.from('papers').createSignedUrl(p.file_path, 60);
    setPreviewUrl(data?.signedUrl ?? null);
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '8px' }}>Pending Papers</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>{papers.length} papers awaiting review</p>

      {papers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#6b7280' }}>
          All caught up! No pending papers.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {papers.map(p => (
          <div key={p.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{ fontWeight: '600', margin: '0 0 2px', fontSize: '15px' }}>{p.subjects?.name}</h3>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#6b7280' }}>{p.subjects?.course_code}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: '2', marginBottom: '12px' }}>
              <div><b>Dept:</b> {p.departments?.name} ({p.departments?.code})</div>
              <div><b>Teacher:</b> {p.teachers?.name}</div>
              <div><b>Exam:</b> {p.exam_type} · Sem {p.semester} · {p.term} {p.year}</div>
              <div><b>Roll No:</b> <span style={{ fontFamily: 'monospace' }}>{p.roll_number}</span></div>
              <div><b>File:</b> {p.file_name}</div>
              <div><b>Submitted:</b> {new Date(p.created_at).toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => getPreview(p)}
                style={{ padding: '7px 12px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                Preview
              </button>
              <button onClick={() => approve(p)} disabled={loading === p.id}
                style={{ padding: '7px 14px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                {loading === p.id ? '...' : 'Approve'}
              </button>
              <button onClick={() => { setRejectId(p.id); setRejectNote(''); }}
                style={{ padding: '7px 14px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'white', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Paper Preview</span>
            <button onClick={() => setPreviewUrl(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
          </div>
          <iframe src={previewUrl} style={{ flex: 1, border: 'none' }} title="Preview" />
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '10px', padding: '28px', width: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '12px' }}>Reject Paper</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>Provide a reason for rejection:</p>
            <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} rows={4} placeholder="e.g. Poor image quality, wrong subject..."
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' as const, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectId(null)}
                style={{ padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              <button onClick={reject} disabled={!rejectNote.trim()}
                style={{ padding: '8px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
