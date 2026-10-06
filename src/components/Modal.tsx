import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export function Modal({ open, title, onClose, children, wide = false }: { open: boolean; title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  if (!open) return null
  return <div className="modal-backdrop" onMouseDown={onClose}>
    <div className={`modal-card ${wide ? 'modal-wide' : ''}`} onMouseDown={e => e.stopPropagation()}>
      <div className="modal-header"><div><p className="eyebrow">HealthCare</p><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
      {children}
    </div>
  </div>
}
