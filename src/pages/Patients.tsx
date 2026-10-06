import type { FormEvent } from 'react'
import { Mail, MapPin, Phone, Plus, Search, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { demoPatients } from '../api/demo'
import { Avatar } from '../components/Avatar'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'
import type { Patient } from '../types'
import { formatDate, fullName } from '../utils/format'

export function Patients() {
  const { demoMode } = useAuth(); const [items, setItems] = useState<Patient[]>([]); const [search, setSearch] = useState(''); const [open, setOpen] = useState(false); const [selected, setSelected] = useState<Patient | null>(null); const [message, setMessage] = useState('')
  async function load() { if (demoMode) { setItems(demoPatients); return } try { setItems(await api.listPatients()) } catch (e) { setMessage(e instanceof Error ? e.message : 'Could not load patients') } }
  useEffect(() => { load() }, [demoMode])
  const filtered = useMemo(() => items.filter(p => `${p.first_name} ${p.last_name} ${p.patient_code} ${p.email || ''} ${p.phone || ''}`.toLowerCase().includes(search.toLowerCase())), [items, search])
  return <div><PageHeader title="Patients" subtitle="Patient records and contact details" action={<button className="primary-button" onClick={() => { setSelected(null); setOpen(true) }}><Plus size={17} /> Register patient</button>} />
    {message && <div className="inline-alert">{message}</div>}
    <div className="toolbar clay-card"><div className="field-search"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, code, email or phone" /></div><span className="muted">{filtered.length} patient{filtered.length === 1 ? '' : 's'}</span></div>
    {filtered.length ? <div className="patient-grid">{filtered.map(p => <article className="patient-card clay-card" key={p.id} onClick={() => setSelected(p)}><div className="patient-top"><Avatar name={fullName(p)} role="PATIENT" size="lg" /><div><h3>{fullName(p)}</h3><span className="code-pill">{p.patient_code}</span></div></div><div className="patient-info">{p.phone && <span><Phone size={15} />{p.phone}</span>}{p.email && <span><Mail size={15} />{p.email}</span>}{p.address && <span><MapPin size={15} />{p.address}</span>}</div><div className="patient-footer"><span>{p.gender || 'Gender not set'}</span><span>DOB {formatDate(p.date_of_birth || undefined)}</span></div></article>)}</div> : <EmptyState title="No patients found" text="Try another search or register a new patient." />}
    <Modal open={open} title="Register patient" onClose={() => setOpen(false)}><PatientForm onSaved={p => { setItems(prev => [p, ...prev]); setOpen(false) }} demoMode={demoMode} /></Modal>
    <Modal open={Boolean(selected)} title={selected ? fullName(selected) : 'Patient'} onClose={() => setSelected(null)}>{selected && <div className="detail-profile"><Avatar name={fullName(selected)} role="PATIENT" size="xl" /><div className="detail-copy"><span className="code-pill">{selected.patient_code}</span><h3>{fullName(selected)}</h3><p>{selected.email || 'No email'} · {selected.phone || 'No phone'}</p><div className="detail-grid"><span><strong>Gender</strong>{selected.gender || '—'}</span><span><strong>Date of birth</strong>{formatDate(selected.date_of_birth || undefined)}</span><span><strong>Address</strong>{selected.address || '—'}</span></div></div></div>}</Modal>
  </div>
}

function PatientForm({ onSaved, demoMode }: { onSaved: (p: Patient) => void; demoMode: boolean }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', date_of_birth: '', gender: '', phone: '', email: '', address: '' }); const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  const change = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); setError(''); try { if (demoMode) onSaved({ ...form, id: Date.now(), patient_code: `PAT-${String(Date.now()).slice(-5)}`, date_of_birth: form.date_of_birth || null, gender: form.gender || null, phone: form.phone || null, email: form.email || null, address: form.address || null }); else onSaved(await api.createPatient({ ...form, date_of_birth: form.date_of_birth || null, gender: form.gender || null, phone: form.phone || null, email: form.email || null, address: form.address || null })) } catch (e) { setError(e instanceof Error ? e.message : 'Could not create patient') } finally { setBusy(false) } }
  return <form className="form-stack" onSubmit={submit}>{error && <div className="form-error">{error}</div>}<div className="form-grid"><label>First name<input required value={form.first_name} onChange={e => change('first_name', e.target.value)} /></label><label>Last name<input required value={form.last_name} onChange={e => change('last_name', e.target.value)} /></label><label>Date of birth<input type="date" value={form.date_of_birth} onChange={e => change('date_of_birth', e.target.value)} /></label><label>Gender<select value={form.gender} onChange={e => change('gender', e.target.value)}><option value="">Select</option><option>Female</option><option>Male</option><option>Other</option></select></label><label>Phone<input value={form.phone} onChange={e => change('phone', e.target.value)} /></label><label>Email<input type="email" value={form.email} onChange={e => change('email', e.target.value)} /></label></div><label>Address<textarea value={form.address} onChange={e => change('address', e.target.value)} rows={3} /></label><button className="primary-button full" disabled={busy}><UserRound size={17} />{busy ? 'Creating…' : 'Create patient'}</button></form>
}
