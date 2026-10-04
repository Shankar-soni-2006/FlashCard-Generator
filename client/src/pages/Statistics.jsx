import { useEffect, useState } from 'react'
import { statisticsService } from '../services'
import { Skeleton } from '../components/common/Skeleton'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

function MetricRow({ label, value, sub }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--color-border-subtle)]">
      <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
      <div className="text-right">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">{value}</span>
        {sub && <span className="text-xs text-[var(--color-text-muted)] ml-2">{sub}</span>}
      </div>
    </div>
  )
}

const RATING_COLORS = {
  again: 'var(--color-danger)',
  hard: 'var(--color-warning)',
  good: 'var(--color-text-secondary)',
  easy: 'var(--color-success)',
}

export default function Statistics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statisticsService.get()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-32" />
      {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-10 w-full" />)}
    </div>
  )

  const reviewsPerDay = stats?.reviews_per_day || []
  const ratingDist = stats?.rating_distribution
    ? Object.entries(stats.rating_distribution).map(([name, value]) => ({ name, value }))
    : []

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">Statistics</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Your learning progress at a glance.</p>
      </div>

      {/* Key metrics */}
      <div>
        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Overview</p>
        <MetricRow label="Cards reviewed" value={stats?.cards_reviewed ?? '—'} />
        <MetricRow label="Review accuracy" value={stats?.accuracy ? `${stats.accuracy}%` : '—'} />
        <MetricRow label="Current streak" value={stats?.streak ? `${stats.streak} days` : '—'} />
        <MetricRow label="Cards mastered" value={stats?.cards_mastered ?? '—'} />
        <MetricRow label="Total cards" value={stats?.total_cards ?? '—'} />
        <MetricRow label="Total decks" value={stats?.total_decks ?? '—'} />
        <MetricRow label="Cards due" value={stats?.cards_due ?? '—'} />
        <MetricRow label="Total reviews" value={stats?.total_reviews ?? '—'} />
      </div>

      {/* Reviews per day */}
      {reviewsPerDay.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-4">Reviews per day</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={reviewsPerDay} barSize={8}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'var(--color-text-primary)',
                }}
                cursor={{ fill: 'var(--color-border-subtle)' }}
              />
              <Bar dataKey="count" fill="var(--color-text-primary)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Rating distribution */}
      {ratingDist.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-4">Rating distribution</p>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={ratingDist} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={55} strokeWidth={0}>
                  {ratingDist.map(entry => (
                    <Cell key={entry.name} fill={RATING_COLORS[entry.name] || 'var(--color-border)'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {ratingDist.map(entry => (
                <div key={entry.name} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: RATING_COLORS[entry.name] }} />
                  <span className="capitalize text-[var(--color-text-secondary)] w-12">{entry.name}</span>
                  <span className="text-[var(--color-text-primary)] font-medium font-mono">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
