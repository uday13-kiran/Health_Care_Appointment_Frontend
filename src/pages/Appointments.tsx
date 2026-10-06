
import type { FormEvent } from 'react'
import { CalendarCheck2, Plus, RefreshCw, Search, UserCheck, Users, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { demoAppointments, demoDoctors, demoPatients } from '../api/demo'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { SectionCard } from '../components/SectionCard'
import { StatusBadge } from '../components/StatusBadge'
import { Toast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import type { Appointment, Doctor, Patient } from '../types'
import { doctorName, formatDate, formatTime, fullName } from '../utils/format'

export function Appointments() {
  const { user, demoMode } = useAuth()
  const [appointments,setAppointments]=useState<Appointment[]>([])
  const [doctors,setDoctors]=useState<Doctor[]>([])
  const [patients,setPatients]=useState<Patient[]>([])
  const [open,setOpen]=useState(false); const [search,setSearch]=useState(''); const [message,setMessage]=useState(''); const [toast,setToast]=useState('')
  const [busyAppointmentId,setBusyAppointmentId]=useState<number|null>(null)
  const [queuedAppointmentIds,setQueuedAppointmentIds]=useState<Set<number>>(()=>new Set())
  useEffect(()=>{ if(!user)return; const load=async()=>{try{
    if(demoMode){setDoctors(demoDoctors);setPatients(demoPatients);setAppointments(user.role==='PATIENT'?demoAppointments.filter(a=>a.patient_id===1):demoAppointments);return}
    if(user.role==='ADMIN'||user.role==='RECEPTIONIST'){const [d,p,a]=await Promise.all([api.listDoctors(),api.listPatients(),api.listAppointments()]);setDoctors(d);setPatients(p);setAppointments(a)}
    else if(user.role==='DOCTOR'&&user.profile_id){setAppointments(await api.doctorAppointments(user.profile_id))}
    else if(user.role==='PATIENT'&&user.profile_id){const [d,a]=await Promise.all([api.listDoctors(),api.patientAppointments(user.profile_id)]);setDoctors(d);setAppointments(a)}
  }catch(e){setMessage(e instanceof Error?e.message:'Could not load appointments')}};load()},[user,demoMode])
  const canBook=user?.role==='ADMIN'||user?.role==='RECEPTIONIST'||user?.role==='PATIENT'
  const filtered=useMemo(()=>appointments.filter(a=>`${a.patient_name||''} ${a.doctor_name||''} ${a.status} ${a.reason||''}`.toLowerCase().includes(search.toLowerCase())),[appointments,search])
  async function cancel(id:number){try{const next=demoMode?appointments.find(a=>a.id===id)!:await api.cancelAppointment(id);setAppointments(prev=>prev.map(a=>a.id===id?{...a,status:demoMode?'CANCELLED':next.status}:a))}catch(e){setMessage(e instanceof Error?e.message:'Could not cancel appointment')}}
  async function checkInAndQueue(appointment:Appointment){
    setBusyAppointmentId(appointment.id)
    setMessage('')
    let checkedIn=false
    try{
      if(appointment.status!=='CHECKED_IN'){
        const next=demoMode?{...appointment,status:'CHECKED_IN'}:await api.checkIn(appointment.id)
        setAppointments(prev=>prev.map(a=>a.id===appointment.id?next:a))
        checkedIn=true
      }
      if(!demoMode)await api.addToQueue(appointment.id)
      setQueuedAppointmentIds(prev=>new Set(prev).add(appointment.id))
      setToast('Patient checked in and added to the queue.')
      setTimeout(()=>setToast(''),3500)
    }catch(e){
      const detail=e instanceof Error?e.message:'Could not add patient to the queue'
      setMessage(checkedIn?`Patient checked in, but could not be added to the queue: ${detail}`:detail)
    }finally{setBusyAppointmentId(null)}
  }
  const canManageCheckIn=user?.role==='ADMIN'||user?.role==='RECEPTIONIST'
  return <div>
    <PageHeader title="Appointments" subtitle={user?.role==='PATIENT'?'Book by doctor and date. Your appointment time is assigned automatically.':canManageCheckIn?'Manage visits, check patients in and add them to the queue':'Manage scheduled visits'} action={canBook?<button className="primary-button" onClick={()=>setOpen(true)}><Plus size={17}/> Book appointment</button>:undefined}/>
    {message&&<div className="inline-alert">{message}</div>}{toast&&<Toast message={toast}/>}
    <div className="toolbar clay-card"><div className="field-search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by patient, doctor or status"/></div><span className="muted">{filtered.length} shown</span></div>
    <SectionCard title={user?.role==='PATIENT'?'My appointments':'Appointment workspace'} subtitle="Times are assigned from the doctor's approved schedule">
      <div className="table-wrap"><table><thead><tr>{user?.role!=='PATIENT'&&<th>Patient</th>}<th>Date</th><th>Doctor</th><th>Time</th><th>Status</th>{(user?.role==='PATIENT'||canManageCheckIn)&&<th>{canManageCheckIn?'Front desk':'Actions'}</th>}</tr></thead><tbody>
      {filtered.map(a=><tr key={a.id}>{user?.role!=='PATIENT'&&<td>{a.patient_name || (patients.find(p=>p.id===a.patient_id) ? fullName(patients.find(p=>p.id===a.patient_id)!) : 'Patient')}</td>}<td>{formatDate(a.appointment_date)}</td><td>{a.doctor_name || (doctors.find(d=>d.id===a.doctor_id) ? doctorName(doctors.find(d=>d.id===a.doctor_id)!) : 'Doctor')}</td><td>{formatTime(a.start_time)} – {formatTime(a.end_time)}</td><td><StatusBadge status={a.status}/></td>{canManageCheckIn&&<td>{queuedAppointmentIds.has(a.id)?<span className="muted small">Added to queue</span>:['SCHEDULED','CONFIRMED','CHECKED_IN'].includes(a.status)&&<button className="small-button" disabled={busyAppointmentId===a.id} onClick={()=>checkInAndQueue(a)}>{busyAppointmentId===a.id?<RefreshCw size={14}/>:a.status==='CHECKED_IN'?<Users size={14}/>:<UserCheck size={14}/>} {busyAppointmentId===a.id?'Processing…':a.status==='CHECKED_IN'?'Add to queue':'Check in & queue'}</button>}</td>}{user?.role==='PATIENT'&&<td>{!['CANCELLED','COMPLETED'].includes(a.status)&&<button className="small-button danger" onClick={()=>cancel(a.id)}><X size={14}/> Cancel</button>}</td>}</tr>)}</tbody></table>{!filtered.length&&<div className="soft-placeholder"><CalendarCheck2 size={20}/> No appointments found.</div>}</div>
    </SectionCard>
    <Modal open={open} title="Book appointment" onClose={()=>setOpen(false)} wide><AppointmentForm userRole={user?.role||'PATIENT'} patients={patients} doctors={doctors} demoMode={demoMode} patientId={user?.profile_id} onSaved={a=>{setAppointments(prev=>[a,...prev]);setOpen(false);setMessage('');setToast('Appointment created successfully. Your appointment time has been assigned.');setTimeout(()=>setToast(''),3500)}}/></Modal>
  </div>
}

function AppointmentForm({userRole,patients,doctors,demoMode,patientId,onSaved}:{userRole:string;patients:Patient[];doctors:Doctor[];demoMode:boolean;patientId?:number|null;onSaved:(a:Appointment)=>void}){
  const [form,setForm]=useState({patient_id:String(patientId||''),doctor_id:'',appointment_date:'',reason:''});const [error,setError]=useState('');const [busy,setBusy]=useState(false)
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError('');try{const body={patient_id:Number(form.patient_id),doctor_id:Number(form.doctor_id),appointment_date:form.appointment_date,duration_minutes:30,reason:form.reason||undefined,appointment_type:'SCHEDULED'};let result:Appointment;if(demoMode){result={id:Date.now(),patient_id:body.patient_id,patient_name:patients.find(p=>p.id===body.patient_id)?fullName(patients.find(p=>p.id===body.patient_id)!):'Patient',doctor_id:body.doctor_id,doctor_name:doctors.find(d=>d.id===body.doctor_id)?doctorName(doctors.find(d=>d.id===body.doctor_id)!):'Doctor',appointment_date:body.appointment_date,start_time:'09:00:00',end_time:'09:30:00',duration_minutes:30,status:'SCHEDULED',appointment_type:'SCHEDULED',reason:body.reason||null}}else result=await api.createAppointment(body);onSaved(result)}catch(e){setError(e instanceof Error?e.message:'Could not book appointment')}finally{setBusy(false)}}
  return <form className="form-stack" onSubmit={submit}>{error&&<div className="form-error">{error}</div>}<div className="form-grid">
    {userRole!=='PATIENT'&&<label>Patient<select required value={form.patient_id} onChange={e=>setForm({...form,patient_id:e.target.value})}><option value="">Select patient</option>{patients.map(p=><option value={p.id} key={p.id}>{fullName(p)}</option>)}</select></label>}
    <label>Doctor<select required value={form.doctor_id} onChange={e=>setForm({...form,doctor_id:e.target.value})}><option value="">Select doctor</option>{doctors.map(d=><option value={d.id} key={d.id}>{doctorName(d)} — {d.specialization}</option>)}</select></label>
    <label>Date<input required type="date" value={form.appointment_date} onChange={e=>setForm({...form,appointment_date:e.target.value})}/></label>
  </div>
  <label>Reason<textarea rows={3} value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="Optional reason for visit"/></label>
  <div className="form-hint"><RefreshCw size={14}/> No time selection is needed. The backend finds the first available 30-minute slot while respecting availability, leave, breaks and existing appointments.</div>
  <button className="primary-button full" disabled={busy}><CalendarCheck2 size={17}/>{busy?'Booking…':'Confirm appointment'}</button></form>
}
