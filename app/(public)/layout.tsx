export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <a href="/papers" style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#111827', textDecoration: 'none' }}>
            NTU Past Papers Archive
          </a>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[['Papers','/papers'],['Contribute','/contribute'],['Leaderboard','/leaderboard']].map(([label,href]) => (
              <a key={href} href={href}
                style={{ padding: '7px 16px', color: '#374151', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderRadius: '6px', border: '1px solid transparent' }}
                onMouseOver={e => (e.currentTarget.style.background='#f3f4f6')}
                onMouseOut={e => (e.currentTarget.style.background='transparent')}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>
      <main>{children}</main>
      <footer style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '13px', marginTop: '60px' }}>
        © {new Date().getFullYear()} NTU Past Papers Archive. For NTU students.
      </footer>
    </div>
  );
}
