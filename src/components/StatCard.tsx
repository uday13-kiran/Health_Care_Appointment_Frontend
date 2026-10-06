import type { LucideIcon } from 'lucide-react'
export function StatCard({ label, value, change, icon: Icon }: { label: string; value: string | number; change?: string; icon: LucideIcon }) {
  return <article className="stat-card clay-card">
    <div className="stat-icon"><Icon size={21} /></div>
    <div className="stat-copy"><span>{label}</span><strong>{value}</strong>{change && <small>{change}</small>}</div>
  </article>
}
