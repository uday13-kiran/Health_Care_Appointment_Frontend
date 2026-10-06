import { CheckCircle2, XCircle } from 'lucide-react'
export function Toast({ message, error = false }: { message: string; error?: boolean }) {
  return <div className={`toast ${error ? 'toast-error' : ''}`}><span>{error ? <XCircle size={18} /> : <CheckCircle2 size={18} />}</span>{message}</div>
}
