const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  detail: string
  constructor(status: number, detail: string) {
    super(detail)
    this.status = status
    this.detail = detail
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('hc_access_token')
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  const text = await response.text()
  let data: unknown = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }

  if (!response.ok) {
    const detail = typeof data === 'object' && data && 'detail' in data
      ? String((data as { detail: unknown }).detail)
      : `Request failed with status ${response.status}`
    throw new ApiError(response.status, detail)
  }
  return data as T
}

export const api = {
  login: (body: { email: string; password: string; role: string }) =>
    apiFetch<{ access_token: string; token_type: string }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => apiFetch<{ id: number; email: string; role: string; profile_id?: number | null }>('/auth/me'),
  registerPatient: (body: { email: string; password: string; first_name: string; last_name: string; date_of_birth?: string | null; gender?: string | null; phone?: string | null; address?: string | null }) =>
    apiFetch<{ id: number; email: string; role: string; profile_id: number; profile_code: string; message: string }>('/auth/register/patient', { method: 'POST', body: JSON.stringify(body) }),
  registerDoctor: (body: { email: string; password: string; first_name: string; last_name: string; specialization: string; license_number?: string | null; phone?: string | null }) =>
    apiFetch<{ id: number; email: string; role: string; profile_id: number; profile_code: string; message: string }>('/auth/register/doctor', { method: 'POST', body: JSON.stringify(body) }),
  health: () => fetch(`${API_BASE_URL.replace(/\/api\/v1$/, '')}/health`).then(r => r.ok),

  listPatients: () => apiFetch<import('../types').Patient[]>('/patients/'),
  getPatient: (id: number) => apiFetch<import('../types').Patient>(`/patients/${id}`),
  createPatient: (body: Omit<import('../types').Patient, 'id' | 'patient_code'>) =>
    apiFetch<import('../types').Patient>('/patients/', { method: 'POST', body: JSON.stringify(body) }),

  listDoctors: (specialization?: string) => apiFetch<import('../types').Doctor[]>(`/doctors/${specialization ? `?specialization=${encodeURIComponent(specialization)}` : ''}`),
  getDoctor: (id: number) => apiFetch<import('../types').Doctor>(`/doctors/${id}`),
  createDoctor: (body: Omit<import('../types').Doctor, 'id' | 'doctor_code' | 'status'>) =>
    apiFetch<import('../types').Doctor>('/doctors/', { method: 'POST', body: JSON.stringify(body) }),

  createAppointment: (body: { patient_id: number; doctor_id: number; appointment_date: string; start_time?: string; duration_minutes?: number; reason?: string; appointment_type?: string }) =>
    apiFetch<import('../types').Appointment>('/appointments/', { method: 'POST', body: JSON.stringify(body) }),
  listAppointments: (appointmentDate?: string) => apiFetch<import('../types').Appointment[]>(`/appointments/${appointmentDate ? `?appointment_date=${encodeURIComponent(appointmentDate)}` : ''}`),
  doctorAppointments: (doctorId: number, appointmentDate?: string) => apiFetch<import('../types').Appointment[]>(`/appointments/doctor/${doctorId}${appointmentDate ? `?appointment_date=${encodeURIComponent(appointmentDate)}` : ''}`),
  getAppointment: (id: number) => apiFetch<import('../types').Appointment>(`/appointments/${id}`),
  patientAppointments: (patientId: number) => apiFetch<import('../types').Appointment[]>(`/appointments/patient/${patientId}`),
  cancelAppointment: (id: number) => apiFetch<import('../types').Appointment>(`/appointments/${id}/cancel`, { method: 'POST' }),
  checkIn: (id: number) => apiFetch<import('../types').Appointment>(`/appointments/${id}/check-in`, { method: 'POST' }),

  createAvailability: (doctorId: number, body: { day_of_week: number; start_time: string; end_time: string }) =>
    apiFetch<import('../types').Availability>(`/availability/doctor/${doctorId}`, { method: 'POST', body: JSON.stringify(body) }),
  getAvailability: (doctorId: number) => apiFetch<import('../types').Availability[]>(`/availability/doctor/${doctorId}`),
  createBreak: (doctorId: number, body: { break_date: string; start_time: string; end_time: string; reason?: string }) =>
    apiFetch<import('../types').DoctorBreak>(`/availability/doctor/${doctorId}/breaks`, { method: 'POST', body: JSON.stringify(body) }),
  getBreaks: (doctorId: number) => apiFetch<import('../types').DoctorBreak[]>(`/availability/doctor/${doctorId}/breaks`),
  createLeave: (doctorId: number, body: { leave_date: string; start_time?: string; end_time?: string; reason?: string }) =>
    apiFetch<import('../types').Leave>(`/leaves/doctor/${doctorId}`, { method: 'POST', body: JSON.stringify(body) }),
  listLeaves: (doctorId?: number) => apiFetch<import('../types').Leave[]>(`/leaves/${doctorId ? `?doctor_id=${doctorId}` : ''}`),
  approveLeave: (id: number, approval_status: 'APPROVED' | 'REJECTED') =>
    apiFetch<import('../types').Leave>(`/leaves/${id}/approve`, { method: 'POST', body: JSON.stringify({ approval_status }) }),

  addToQueue: (appointmentId: number) => apiFetch<import('../types').QueueEntry>(`/queue/appointment/${appointmentId}`, { method: 'POST' }),
  myQueue: () => apiFetch<import('../types').QueueEntry[]>('/queue/my'),
  patientQueue: (patientId: number) => apiFetch<import('../types').QueueEntry[]>(`/queue/patient/${patientId}`),
  waitingQueue: (doctorId: number) => apiFetch<import('../types').QueueEntry[]>(`/queue/doctor/${doctorId}`),
  queueControl: (doctorId: number) => apiFetch<import('../types').QueueControl>(`/queue/doctor/${doctorId}/control`),
  pauseQueue: (doctorId: number, reason?: string) => apiFetch<import('../types').QueueControl>(`/queue/doctor/${doctorId}/pause`, { method: 'POST', body: JSON.stringify({ reason }) }),
  resumeQueue: (doctorId: number) => apiFetch<import('../types').QueueControl>(`/queue/doctor/${doctorId}/resume`, { method: 'POST' }),
  emergency: (body: { patient_id: number; doctor_id: number; reason: string }) =>
    apiFetch<import('../types').QueueEntry>('/queue/emergency', { method: 'POST', body: JSON.stringify(body) }),
  callNext: (doctorId: number) => apiFetch<import('../types').QueueEntry>(`/queue/doctor/${doctorId}/call-next`, { method: 'POST' }),
  startQueue: (entryId: number) => apiFetch<import('../types').QueueEntry>(`/queue/${entryId}/start`, { method: 'POST' }),
  completeQueue: (entryId: number) => apiFetch<import('../types').QueueEntry>(`/queue/${entryId}/complete`, { method: 'POST' }),
  waitTime: (doctorId: number, queueNumber: number) => apiFetch<import('../types').WaitTime>(`/queue/doctor/${doctorId}/wait-time?queue_number=${queueNumber}`),

  createVisit: (body: { appointment_id: number; diagnosis?: string; notes?: string; prescription?: string }) =>
    apiFetch<import('../types').Visit>('/visits/', { method: 'POST', body: JSON.stringify(body) }),
  completeVisit: (id: number) => apiFetch<import('../types').Visit>(`/visits/${id}/complete`, { method: 'POST' }),

  workload: () => apiFetch<import('../types').DoctorWorkload[]>('/reports/doctor-workload'),
  todayCareFlow: () => apiFetch<import('../types').TodayCareFlow>('/reports/today-care-flow'),
  createUser: (body: { email: string; password: string; role: string }) =>
    apiFetch<import('../types').UserAccount>('/admin/users', { method: 'POST', body: JSON.stringify(body) }),
}

export const apiBaseUrl = API_BASE_URL
