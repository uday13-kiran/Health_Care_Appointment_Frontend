import { HeartPulse } from 'lucide-react'
export function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty-state"><div className="empty-icon"><HeartPulse size={26} /></div><h3>{title}</h3><p>{text}</p></div>
}
