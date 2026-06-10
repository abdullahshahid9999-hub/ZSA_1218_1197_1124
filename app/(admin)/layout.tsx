export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{ width: '220px', background: '#0f172a', color: 'white', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #1e293b' }}>
          <h1 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>NTU Archive</h1>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>Admin Panel</p>
        </div>
        <nav style={{ padding: '16px 0' }}>
          {[
            ['Dashboard', '/admin'],
            ['Departments', '/admin/departments'],
            ['Teachers', '/admin/teachers'],
            ['Subjects', '/admin/subjects'],
            ['Pending Papers', '/admin/pending'],
            ['Approved Papers', '/admin/approved'],
            ['Rejected Papers', '/admin/rejected'],
            ['Contributors', '/admin/contributors'],
            ['Leaderboard', '/admin/leaderboard'],
          ].map(([label, href]) => (
            <a key={href} href={href} style={{ display: 'block', padding: '8px 20px', color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#1e293b')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}>
              {label}
            </a>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1e293b', marginTop: 'auto' }}>
          <a href="/login" style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}>Sign Out</a>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '32px', background: '#f8fafc', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
