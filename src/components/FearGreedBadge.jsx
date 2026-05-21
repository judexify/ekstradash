import { useFearGreed } from '../hooks/useFearGreed.js'

export default function FearGreedBadge() {
  const { data, mood, loading, error } = useFearGreed()

  return (
    <aside className={`fear-greed ${mood}`} aria-label="Fear and Greed index">
      <span className="mood-dot" />
      <span className="badge-label">FNG</span>
      <strong>{loading ? '--' : data?.score ?? '--'}</strong>
      <span>{error ? 'offline' : data?.label ?? 'syncing'}</span>
    </aside>
  )
}
