import type { Appointment, Doctor, Patient } from '../types'

export const fullName = (p?: Patient | Doctor | null) => p ? `${p.first_name} ${p.last_name}` : 'Unknown'
export const doctorName = (d?: Doctor | null) => d ? `Dr. ${d.first_name} ${d.last_name}` : 'Doctor'
export const formatTime = (time?: string) => time ? new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
export const formatDate = (date?: string) => date ? new Date(`${date}T00:00:00`).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
export const statusLabel = (status: string) => status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
export const appointmentLabel = (a: Appointment) => `${formatDate(a.appointment_date)} · ${formatTime(a.start_time)}`

export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
