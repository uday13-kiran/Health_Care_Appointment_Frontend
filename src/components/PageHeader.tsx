import type { ReactNode } from 'react'
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="page-header"><div><p className="eyebrow">HealthCare workspace</p><h1>{title}</h1>{subtitle && <p className="muted">{subtitle}</p>}</div>{action}</div>
}
