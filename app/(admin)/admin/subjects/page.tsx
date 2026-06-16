'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q');

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [credits, setCredits] = useState('');
  const [editId, setEditId] = useState<string|null>(null);
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    const [{ data: s }, { data: t }] = await Promise.all([
      sb.from('subjects').select('*, teachers(name, departments(code))').order('name'),
      sb.from('teachers').select('id,name,department_id,departments(code)').eq('is_active',true).order('name'),
    ]);
    setSubjects(s ?? []); setTeachers(t ?? []);
  };
  useEffect(() => { load(); }, []);

  const flash = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: '', ok: true }), 2500); };

  const save = async () => {
    if (!name.trim() || !code.trim() || !teacherId) { flash('All required fields needed.', false); return; }
    setLoading(true);
    const payload = { name: name.trim(), course_code: code.trim().toUpperCase(), teacher_id: teacherId, credits: credits ? parseInt(credits) : null };

    let dupQuery = sb
      .from('subjects')
      .select('id')
      .eq('course_code', payload.course_code)
      .eq('teacher_id', payload.teacher_id);
    if (editId) dupQuery = dupQuery.neq('id', editId);
    const { data: existing } = await dupQuery.maybeSingle();
    if (existing) {
      flash('This teacher already has this course assigned', false);
      setLoading(false);
      return;
    }

    if (editId) {
      const { error } = await sb.from('subjects').update(payload).eq('id', editId);
      if (error) flash(error.message, false); else { flash('Updated!'); setName(''); setCode(''); setTeacherId(''); setCredits(''); setEditId(null); await load(); }
    } else {
      const { error } = await sb.from('subjects').insert(payload);
      if (error) flash(error.message, false); else { flash('Added!'); setName(''); setCode(''); setTeacherId(''); setCredits(''); await load(); }
    }
    setLoading(false);
  };

  const del = async (id: string) => {
    if (!confirm('Delete subject?')) return;
    const { error } = await sb.from('subjects').delete().eq('id', id);
    if (error) flash('Cannot delete — papers are linked.', false); else { flash('Deleted.'); await load(); }
  };

  const inp: React.CSSProperties = { padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none', color: '#111' };
  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.course_code.toLowerCase().includes(search.toLowerCase()) ||
    s.teachers?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1000 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 24 }}>Subjects</h1>

      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 14 }}>{editId ? 'Edit Subject' : 'Add Subject'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 0.5fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Subject Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Data Structures" style={inp}
              onFocus={e => (e.target.style.borderColor = '#111')} onBlur={e => (e.target.style.borderColor = '#e0e0e0')} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Course Code *</label>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="CS201" style={inp}
              onFocus={e => (e.target.style.borderColor = '#111')} onBlur={e => (e.target.style.borderColor = '#e0e0e0')} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Teacher *</label>
            <select value={teacherId} onChange={e => setTeacherId(e.target.value)} style={inp}>
              <option value="">Select teacher</option>
              {teachers.map(t => <option key={t.id} value={t.id}>[{(t.departments as any)?.code}] {t.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Credits</label>
            <input value={credits} onChange={e => setCredits(e.target.value)} placeholder="3" type="number" min="1" max="6" style={inp}
              onFocus={e => (e.target.style.borderColor = '#111')} onBlur={e => (e.target.style.borderColor = '#e0e0e0')} />
          </div>
        </div>
        {msg.text && <p style={{ fontSize: 13, color: msg.ok ? '#059669' : '#dc2626', marginBottom: 10 }}>{msg.text}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save} disabled={loading} style={{ padding: '8px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            {loading ? 'Saving…' : editId ? 'Update' : 'Add'}
          </button>
          {editId && <button onClick={() => { setEditId(null); setName(''); setCode(''); setTeacherId(''); setCredits(''); }}
            style={{ padding: '8px 14px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Cancel</button>}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{filtered.length} subjects</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, code, teacher…"
            style={{ padding: '6px 12px', border: '1px solid #e0e0e0', borderRadius: 7, fontSize: 13, outline: 'none', width: 220 }} />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              {['Subject','Code','Teacher','Credits','Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid #f5f5f5' : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '12px 16px', fontWeight: 500, fontSize: 14 }}>{s.name}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: '#f0fdf4', color: '#166534', padding: '2px 9px', borderRadius: 5, fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{s.course_code}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#555' }}>
                  <span style={{ background: '#f0f4ff', color: '#3b5bdb', padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 700, marginRight: 6 }}>{(s.teachers as any)?.departments?.code}</span>
                  {s.teachers?.name}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#777' }}>{s.credits ?? '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditId(s.id); setName(s.name); setCode(s.course_code); setTeacherId(s.teacher_id); setCredits(s.credits?.toString() ?? ''); }}
                      style={{ padding: '5px 12px', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Edit</button>
                    <button onClick={() => del(s.id)}
                      style={{ padding: '5px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: 14 }}>No subjects yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
