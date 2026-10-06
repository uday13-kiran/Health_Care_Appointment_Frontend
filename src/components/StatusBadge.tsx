import { statusLabel } from '../utils/format'
export function StatusBadge({ status }: { status: string }) {
  const tone = status.toLowerCase().replaceAll('_', '-')
  return <span className={`status-badge status-${tone}`}>{statusLabel(status)}</span>
}
