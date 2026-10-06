import type { Appointment, Availability, Doctor, DoctorWorkload, Patient, QueueEntry } from '../types'

export const demoPatients: Patient[] = [
  { id: 1, patient_code: 'PAT-00001', first_name: 'Ravi', last_name: 'Kumar', date_of_birth: '1992-04-18', gender: 'Male', phone: '+91 98765 43210', email: 'ravi@example.com', address: '12 MG Road, Bengaluru' },
  { id: 2, patient_code: 'PAT-00002', first_name: 'Anita', last_name: 'Sharma', date_of_birth: '1988-09-02', gender: 'Female', phone: '+91 98765 11122', email: 'anita@example.com', address: 'Banjara Hills, Hyderabad' },
  { id: 3, patient_code: 'PAT-00003', first_name: 'Suresh', last_name: 'Patel', date_of_birth: '1979-02-12', gender: 'Male', phone: '+91 98765 22334', email: 'suresh@example.com', address: 'Jubilee Hills, Hyderabad' },
  { id: 4, patient_code: 'PAT-00004', first_name: 'Meena', last_name: 'Reddy', date_of_birth: '1995-06-21', gender: 'Female', phone: '+91 98765 33445', email: 'meena@example.com', address: 'Madhapur, Hyderabad' },
]

export const demoDoctors: Doctor[] = [
  { id: 1, doctor_code: 'DOC-00001', first_name: 'Sarah', last_name: 'Wilson', specialization: 'General Physician', phone: '+91 90000 10001', email: 'sarah@healthcare.local', status: 'ACTIVE' },
  { id: 2, doctor_code: 'DOC-00002', first_name: 'Robert', last_name: 'Lee', specialization: 'Cardiology', phone: '+91 90000 10002', email: 'robert@healthcare.local', status: 'ACTIVE' },
  { id: 3, doctor_code: 'DOC-00003', first_name: 'Priya', last_name: 'Nair', specialization: 'Dermatology', phone: '+91 90000 10003', email: 'priya@healthcare.local', status: 'ACTIVE' },
]

export const demoAppointments: Appointment[] = [
  { id: 1, patient_id: 1, doctor_id: 1, appointment_date: '2026-09-30', start_time: '09:00:00', end_time: '09:30:00', duration_minutes: 30, status: 'IN_CONSULTATION', appointment_type: 'SCHEDULED', reason: 'Follow-up' },
  { id: 2, patient_id: 2, doctor_id: 2, appointment_date: '2026-09-30', start_time: '09:30:00', end_time: '10:00:00', duration_minutes: 30, status: 'SCHEDULED', appointment_type: 'SCHEDULED', reason: 'New consultation' },
  { id: 3, patient_id: 3, doctor_id: 3, appointment_date: '2026-09-30', start_time: '10:00:00', end_time: '10:30:00', duration_minutes: 30, status: 'CHECKED_IN', appointment_type: 'SCHEDULED', reason: 'Skin review' },
  { id: 4, patient_id: 4, doctor_id: 1, appointment_date: '2026-09-30', start_time: '10:30:00', end_time: '11:00:00', duration_minutes: 30, status: 'SCHEDULED', appointment_type: 'SCHEDULED', reason: 'Routine check' },
]

export const demoQueue: QueueEntry[] = [
  { id: 1, appointment_id: 1, patient_id: 1, doctor_id: 1, queue_number: 1, status: 'IN_CONSULTATION', arrival_time: '2026-09-30T08:54:00' },
  { id: 2, appointment_id: 2, patient_id: 2, doctor_id: 1, queue_number: 2, status: 'WAITING', arrival_time: '2026-09-30T09:15:00' },
  { id: 3, appointment_id: 3, patient_id: 3, doctor_id: 1, queue_number: 3, status: 'WAITING', arrival_time: '2026-09-30T09:27:00' },
  { id: 4, appointment_id: 4, patient_id: 4, doctor_id: 1, queue_number: 4, status: 'CHECKED_IN', arrival_time: '2026-09-30T09:40:00' },
]

export const demoAvailability: Availability[] = [
  { id: 1, doctor_id: 1, day_of_week: 1, start_time: '09:00:00', end_time: '17:00:00', is_active: true },
  { id: 2, doctor_id: 1, day_of_week: 2, start_time: '09:00:00', end_time: '17:00:00', is_active: true },
  { id: 3, doctor_id: 1, day_of_week: 3, start_time: '09:00:00', end_time: '17:00:00', is_active: true },
]

export const demoWorkload: DoctorWorkload[] = [
  { doctor_id: 1, doctor_name: 'Dr. Sarah Wilson', total_appointments: 36, completed_appointments: 28, cancelled_appointments: 2 },
  { doctor_id: 2, doctor_name: 'Dr. Robert Lee', total_appointments: 29, completed_appointments: 21, cancelled_appointments: 3 },
  { doctor_id: 3, doctor_name: 'Dr. Priya Nair', total_appointments: 24, completed_appointments: 18, cancelled_appointments: 1 },
]
