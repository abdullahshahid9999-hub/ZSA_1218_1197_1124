'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q', { auth: { persistSession: false, autoRefreshToken: false } });

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [deptId, setDeptId] = useState('');
  const [designation, setDesignation] = useState('');
  const [type, setType] = useState('Permanent');
  const [editId, setEditId] = useState<string|null>(null);
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [desigFilter, setDesigFilter] = useState('All');

  const load = async () => {
    const [{ data: t }, { data: d }] = await Promise.all([
      sb.from('teachers').select('*, departments(name,code)').order('name'),
      sb.from('departments').select('id,name,code').eq('is_active',true).order('name'),
    ]);
    setTeachers(t ?? []); setDepts(d ?? []);
  };
  useEffect(() => { load(); }, []);

  const flash = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: '', ok: true }), 2500); };

  const resetForm = () => { setName(''); setDeptId(''); setDesignation(''); setType('Permanent'); setEditId(null); };

  const save = async () => {
    if (!name.trim() || !deptId) { flash('Name and department required.', false); return; }
    setLoading(true);
    const payload = { name: name.trim(), department_id: deptId, designation: designation.trim() || null, teacher_type: type };
    if (editId) {
      const { error } = await sb.from('teachers').update(payload).eq('id', editId);
      if (error) flash(error.message, false); else { flash('Updated!'); resetForm(); await load(); }
    } else {
      const { error } = await sb.from('teachers').insert(payload);
      if (error) flash(error.message, false); else { flash('Added!'); resetForm(); await load(); }
    }
    setLoading(false);
  };

  const del = async (id: string) => {
    if (!confirm('Delete teacher?')) return;
    const { error } = await sb.from('teachers').delete().eq('id', id);
    if (error) flash('Cannot delete — subjects are linked.', false); else { flash('Deleted.'); await load(); }
  };

  const inp: React.CSSProperties = { padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none', color: '#111' };

  const designations = ['All', ...Array.from(new Set(teachers.map(t => t.designation).filter(Boolean)))];
  const filtered = teachers.filter(t => {
    const mS = t.name.toLowerCase().includes(search.toLowerCase()) || t.departments?.code?.toLowerCase().includes(search.toLowerCase());
    const mD = desigFilter === 'All' || t.designation === desigFilter;
    return mS && mD;
  });

  return (
    <div style={{ maxWidth: 980 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 24 }}>Teachers</h1>

      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 14 }}>{editId ? 'Edit Teacher' : 'Add Teacher'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Full Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Ahmed Ali" style={inp}
              onFocus={e => (e.target.style.borderColor = '#111')} onBlur={e => (e.target.style.borderColor = '#e0e0e0')} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Department *</label>
            <select value={deptId} onChange={e => setDeptId(e.target.value)} style={inp}>
              <option value="">Select</option>
              {depts.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Designation</label>
            <input value={designation} onChange={e => setDesignation(e.target.value)} placeholder="Lecturer" style={inp}
              onFocus={e => (e.target.style.borderColor = '#111')} onBlur={e => (e.target.style.borderColor = '#e0e0e0')} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Type *</label>
            <select value={type} onChange={e => setType(e.target.value)} style={inp}>
              <option value="Permanent">Permanent</option>
              <option value="Visiting">Visiting</option>
            </select>
          </div>
        </div>
        {msg.text && <p style={{ fontSize: 13, color: msg.ok ? '#059669' : '#dc2626', marginBottom: 10 }}>{msg.text}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save} disabled={loading} style={{ padding: '8px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            {loading ? 'Saving…' : editId ? 'Update' : 'Add'}
          </button>
          {editId && <button onClick={resetForm}
            style={{ padding: '8px 14px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Cancel</button>}
        </div>
      </div>

      {/* Designation Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {designations.map(d => (
          <button key={d as string} onClick={() => setDesigFilter(d as string)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
            background: desigFilter === d ? '#111' : '#f5f5f5', color: desigFilter === d ? '#fff' : '#555',
            boxShadow: desigFilter === d ? '0 2px 6px rgba(0,0,0,0.1)' : 'none'
          }}>
            {d as string}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{filtered.length} teachers</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or dept…"
            style={{ padding: '6px 12px', border: '1px solid #e0e0e0', borderRadius: 7, fontSize: 13, outline: 'none', width: 200 }} />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              {['Name','Department','Designation','Type','Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid #f5f5f5' : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '12px 16px', fontWeight: 500, fontSize: 14 }}>{t.name}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: '#f0f4ff', color: '#3b5bdb', padding: '2px 9px', borderRadius: 5, fontSize: 12, fontWeight: 700 }}>{t.departments?.code}</span>
                  <span style={{ marginLeft: 8, fontSize: 13, color: '#777' }}>{t.departments?.name}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#777' }}>{t.designation || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    background: t.teacher_type === 'Visiting' ? '#fff4e6' : '#ebfbee',
                    color: t.teacher_type === 'Visiting' ? '#e8590c' : '#2b8a3e',
                    padding: '2px 9px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                  }}>{t.teacher_type ?? 'Permanent'}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditId(t.id); setName(t.name); setDeptId(t.department_id); setDesignation(t.designation ?? ''); setType(t.teacher_type ?? 'Permanent'); }}
                      style={{ padding: '5px 12px', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Edit</button>
                    <button onClick={() => del(t.id)}
                      style={{ padding: '5px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: 14 }}>No teachers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
