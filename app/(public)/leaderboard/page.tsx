import { createClient } from '@supabase/supabase-js';

interface LeaderboardEntry {
  id: string;
  roll_number: string;
  total_approved: number;
  department_name?: string;
  department_code?: string;
  rank: number;
}

async function getLeaderboard(search?: string): Promise<LeaderboardEntry[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  let query = supabase.from('v_leaderboard').select('*').limit(100);
  if (search) query = query.ilike('roll_number', `%${search}%`);
  const { data } = await query;
  return (data ?? []) as LeaderboardEntry[];
}

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const entries = await getLeaderboard(q);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>Contributors Leaderboard</h1>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>
        Ranked by approved paper contributions.
      </p>

      <form method="GET" style={{ marginBottom: '24px' }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by roll number..."
          style={{
            padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px',
            width: '300px', fontSize: '14px'
          }}
        />
      </form>

      {entries.length === 0 ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '60px' }}>
          {q ? `No contributors found for "${q}".` : 'No contributors yet. Be the first!'}
        </p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Rank</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Roll Number</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Department</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Approved Papers</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={entry.id} style={{ borderTop: '1px solid #e2e8f0', background: i < 3 ? '#fffbeb' : 'white' }}>
                <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                  {Number(entry.rank) === 1 ? '🥇' : Number(entry.rank) === 2 ? '🥈' : Number(entry.rank) === 3 ? '🥉' : `#${entry.rank}`}
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: '600' }}>
                  <a href={`/contributors/${encodeURIComponent(entry.roll_number)}`} style={{ color: '#1d4ed8', textDecoration: 'none' }}>
                    {entry.roll_number}
                  </a>
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>{entry.department_code ?? '—'}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>{entry.total_approved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export const revalidate = 300;
