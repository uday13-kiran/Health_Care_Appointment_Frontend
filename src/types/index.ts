export type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'RECEPTIONIST'

export interface User {
  id: number
  email: string
  role: Role
  profile_id?: number | null
}

export interface Patient {
  id: number
  patient_code: string
  first_name: string
  last_name: string
  date_of_birth?: string | null
  gender?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
}

export interface Doctor {
  id: number
  doctor_code: string
  first_name: string
  last_name: string
  specialization: string
  license_number?: string | null
  phone?: string | null
  email?: string | null
  status: string
}

export interface Appointment {
  id: number
  patient_id: number
  patient_name?: string | null
  doctor_id: number
  doctor_name?: string | null
  appointment_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  status: string
  appointment_type: string
  reason?: string | null
}

export interface Availability {
  id: number
  doctor_id: number
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

export interface Leave {
  id: number
  doctor_id: number
  leave_date: string
  start_time?: string | null
  end_time?: string | null
  reason?: string | null
  approval_status?: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export interface QueueEntry {
  id: number
  appointment_id?: number | null
  patient_id: number
  patient_name?: string | null
  doctor_id: number
  doctor_name?: string | null
  queue_number: number
  status: string
  arrival_time: string
}

export interface WaitTime {
  doctor_id: number
  queue_number: number
  estimated_wait_minutes: number
}

export interface Visit {
  id: number
  appointment_id: number
  doctor_id: number
  patient_id: number
  status: string
  diagnosis?: string | null
  notes?: string | null
  prescription?: string | null
}

export interface DoctorWorkload {
  doctor_id: number
  doctor_name: string
  total_appointments: number
  completed_appointments: number
  cancelled_appointments: number
}

export interface UserAccount {
  id: number
  email: string
  role: Role
  is_active: boolean
}

export interface DoctorBreak {
  id: number
  doctor_id: number
  break_date: string
  start_time: string
  end_time: string
  reason?: string | null
}

export interface QueueControl {
  doctor_id: number
  is_paused: boolean
  reason?: string | null
}

export interface TodayCareFlow {
  date: string
  total_appointments: number
  scheduled: number
  checked_in: number
  in_queue: number
  in_consultation: number
  completed: number
  cancelled: number
  waiting_queue: number
  called: number
  queue_completed: number
}
