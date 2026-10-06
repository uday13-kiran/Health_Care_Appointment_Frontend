import { Activity, CalendarCheck2, CheckCircle2, ClipboardList, Clock3, HeartPulse, Plus, Stethoscope, Users, UserRoundPlus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { demoAppointments, demoDoctors, demoPatients, demoQueue, demoWorkload } from '../api/demo'
import { Avatar } from '../components/Avatar'
import { PageHeader } from '../components/PageHeader'
import { SectionCard } from '../components/SectionCard'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import { QuickAction } from '../layouts/AppLayout'
import { useAuth } from '../context/AuthContext'
import type { Appointment, Doctor, DoctorWorkload, Patient, QueueEntry, TodayCareFlow } from '../types'
import { doctorName, formatDate, formatTime, fullName } from '../utils/format'
import { Link } from 'react-router-dom'

export function Dashboard() {
  const { user, demoMode } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [queue, setQueue] = useState<QueueEntry[]>([])
  const [workload, setWorkload] = useState<DoctorWorkload[]>([])
  const [careFlow, setCareFlow] = useState<TodayCareFlow | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    if (demoMode) {
      setPatients(demoPatients)
      setDoctors(demoDoctors)
      setAppointments(demoAppointments)
      setQueue(demoQueue)
      setWorkload(demoWorkload)
      return
    }
    const doctorsRequest = api.listDoctors()
    const loads: Promise<unknown>[] = [doctorsRequest.then(setDoctors)]
    if (user.role === 'ADMIN' || user.role === 'RECEPTIONIST') loads.push(api.listAppointments().then(setAppointments))
    if (user.role === 'DOCTOR' && user.profile_id) loads.push(api.doctorAppointments(user.profile_id).then(setAppointments))
    if (user.role === 'PATIENT' && user.profile_id) loads.push(api.patientAppointments(user.profile_id).then(setAppointments))
    if (user.role === 'ADMIN' || user.role === 'RECEPTIONIST') loads.push(api.listPatients().then(setPatients))
    if (user.role === 'ADMIN') { loads.push(api.workload().then(setWorkload)); loads.push(api.todayCareFlow().then(setCareFlow)) }
    if (user.role === 'DOCTOR') loads.push(api.myQueue().then(setQueue))
    if (user.role === 'PATIENT' && user.profile_id) loads.push(api.patientQueue(user.profile_id).then(setQueue))
    if (user.role === 'ADMIN' || user.role === 'RECEPTIONIST') loads.push(doctorsRequest.then(async ds => {
      const queues = await Promise.all(ds.map(doctor => api.waitingQueue(doctor.id)))
      setQueue(queues.flat())
    }))
    Promise.all(loads).catch(e => setError(e instanceof Error ? e.message : 'Some dashboard data could not be loaded'))
  }, [user, demoMode])

  const today = new Date().toISOString().slice(0, 10)
  const todayAppointments = appointments.filter(a => a.appointment_date === today).length
  const completed = user?.role === 'ADMIN' && workload.length
    ? workload.reduce((total, doctor) => total + doctor.completed_appointments, 0)
    : appointments.filter(a => a.status === 'COMPLETED').length
  const waiting = queue.filter(q => ['WAITING', 'CHECKED_IN'].includes(q.status)).length
  const greeting = user?.role === 'PATIENT' ? 'Your care dashboard' : user?.role === 'DOCTOR' ? 'Today at a glance' : user?.role === 'RECEPTIONIST' ? 'Keep the clinic moving' : 'Clinic command center'
  const title = user?.role === 'PATIENT' ? 'Welcome back' : user?.role === 'DOCTOR' ? 'Good morning, Doctor' : user?.role === 'RECEPTIONIST' ? 'Welcome back, Reception' : 'Good morning, Admin'

  const quickActions = useMemo(() => {
    if (!user) return []
    if (user.role === 'ADMIN') return [
      { title: 'Register patient', text: 'Create a patient record', icon: UserRoundPlus, to: '/patients' },
      { title: 'Add doctor', text: 'Create a doctor profile', icon: Stethoscope, to: '/doctors' },
      { title: 'View reports', text: 'Doctor workload', icon: Activity, to: '/reports' },
    ]
    if (user.role === 'RECEPTIONIST') return [
      { title: 'Register patient', text: 'Create a patient record', icon: UserRoundPlus, to: '/patients' },
      { title: 'Book appointment', text: 'Schedule a visit', icon: CalendarCheck2, to: '/appointments' },
      { title: 'Manage queue', text: 'Check in and queue', icon: Users, to: '/queue' },
    ]
    if (user.role === 'DOCTOR') return [
      { title: 'Queue', text: 'Call the next patient', icon: Users, to: '/queue' },
      { title: 'Consultation', text: 'Record a visit', icon: ClipboardIcon, to: '/consultation' },
      { title: 'Availability', text: 'Manage working hours', icon: Clock3, to: '/availability' },
    ]
    return [
      { title: 'Book appointment', text: 'Choose a doctor and time', icon: CalendarCheck2, to: '/appointments' },
      { title: 'My appointments', text: 'View visit history', icon: CheckCircle2, to: '/appointments' },
      { title: 'Queue status', text: 'Track your wait', icon: Clock3, to: '/queue' },
    ]
  }, [user])

  return <div className="dashboard-page">
    <PageHeader title={title} subtitle={greeting} action={<Link to="/appointments" className="primary-button"><Plus size={17} /> New appointment</Link>} />
    {error && <div className="inline-alert">{error}</div>}
    <div className="hero-banner clay-card"><div><span className="soft-chip"><HeartPulse size={14} /> Care operations</span><h2>We Care for your Health.</h2><p>Patients, schedules and queues stay visible without overwhelming the team.</p></div><div className="hero-illustration"><div className="sun-orb" /><div className="clinic-block"><div className="cross">+</div><span>Care</span></div><div className="leaf leaf-a" /><div className="leaf leaf-b" /></div></div>

    <div className="stats-grid">
      <StatCard label="Total patients" value={patients.length || (user?.role === 'PATIENT' ? 1 : '—')} change="Live from backend" icon={Users} />
      <StatCard label="Today's appointments" value={todayAppointments} change="Scheduled visits" icon={CalendarCheck2} />
      <StatCard label="In queue" value={waiting} change="Waiting / checked in" icon={Clock3} />
      <StatCard label="Completed visits" value={completed} change="Completed" icon={CheckCircle2} />
    </div>

    {user?.role === 'ADMIN' && careFlow && <SectionCard title="Today's care flow analytics" subtitle={formatDate(careFlow.date)}><div className="table-wrap"><table><thead><tr><th>Total</th><th>Scheduled</th><th>Checked in</th><th>In queue</th><th>Consulting</th><th>Completed</th><th>Cancelled</th><th>Waiting</th><th>Called</th></tr></thead><tbody><tr><td>{careFlow.total_appointments}</td><td>{careFlow.scheduled}</td><td>{careFlow.checked_in}</td><td>{careFlow.in_queue}</td><td>{careFlow.in_consultation}</td><td>{careFlow.completed}</td><td>{careFlow.cancelled}</td><td>{careFlow.waiting_queue}</td><td>{careFlow.called}</td></tr></tbody></table></div></SectionCard>}

    <div className="dashboard-grid">
      <SectionCard title="Today's care flow" subtitle={today ? formatDate(today) : ''} action={<Link to="/appointments" className="text-button">View all</Link>}>
        {appointments.length ? <div className="table-wrap"><table><thead><tr><th>Time</th><th>Patient</th><th>Doctor</th><th>Status</th></tr></thead><tbody>{appointments.slice(0, 5).map(a => <tr key={a.id}><td>{formatTime(a.start_time)}</td><td>{patients.find(p => p.id === a.patient_id) ? fullName(patients.find(p => p.id === a.patient_id)) : `Patient #${a.patient_id}`}</td><td>{doctors.find(d => d.id === a.doctor_id) ? doctorName(doctors.find(d => d.id === a.doctor_id)) : `Doctor #${a.doctor_id}`}</td><td><StatusBadge status={a.status} /></td></tr>)}</tbody></table></div> : <div className="soft-placeholder"><CalendarCheck2 size={20} /> No appointment list endpoint is exposed for this role yet.</div>}
      </SectionCard>
      <SectionCard title="Quick actions" subtitle="Common clinic actions"><div className="quick-grid">{quickActions.map(item => <QuickAction key={item.to + item.title} icon={item.icon} title={item.title} text={item.text} onClick={() => window.location.assign(item.to)} />)}</div></SectionCard>
    </div>

    <div className="dashboard-grid lower">
      <SectionCard title="Current queue" subtitle="Real-time queue state" action={<Link to="/queue" className="text-button">Open queue</Link>}>
        {queue.length ? <div className="queue-list">{queue.slice(0, 5).map(q => { const p = patients.find(x => x.id === q.patient_id); const doctor = doctors.find(x => x.id === q.doctor_id); return <div className="queue-row" key={q.id}><span className="queue-no">{q.queue_number}</span><Avatar name={p ? fullName(p) : 'Patient'} role="PATIENT" size="sm" /><div className="queue-person"><strong>{p ? fullName(p) : `Patient #${q.patient_id}`}</strong><small>{q.doctor_name || (doctor ? doctorName(doctor) : 'Assigned doctor')}</small></div><StatusBadge status={q.status} /></div> })}</div> : <div className="soft-placeholder"><Clock3 size={20} /> Queue data appears here after a patient is added.</div>}
      </SectionCard>
      {(user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST') && <SectionCard title="Care team workload" subtitle="Completed appointments out of total appointments">
        {doctors.length ? <div className="workload-bars">{doctors.map(doctor => {
          const doctorAppointments = appointments.filter(item => item.doctor_id === doctor.id)
          const completedAppointments = doctorAppointments.filter(item => item.status === 'COMPLETED').length
          const completion = doctorAppointments.length ? Math.round(completedAppointments / doctorAppointments.length * 100) : 0
          return <div className="workload-row" key={doctor.id}>
            <div><strong>{doctorName(doctor)}</strong><span>{completedAppointments} completed / {doctorAppointments.length} appointments</span></div>
            <div className="bar-track"><i style={{ width: `${completion}%` }} /></div>
          </div>
        })}</div> : <div className="soft-placeholder"><Activity size={20} /> No doctors are available to show.</div>}
      </SectionCard>}
    </div>
  </div>
}

function ClipboardIcon(props: { size?: number }) { return <ClipboardList size={props.size} /> }
