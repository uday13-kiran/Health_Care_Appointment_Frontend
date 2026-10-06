
import type { FormEvent } from 'react'
import { CalendarOff, Check, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { demoDoctors } from '../api/demo'
import { PageHeader } from '../components/PageHeader'
import { SectionCard } from '../components/SectionCard'
import { StatusBadge } from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import type { Leave, Doctor } from '../types'
import { doctorName, formatDate, formatTime } from '../utils/format'

export function Leave(){
 const{user,demoMode}=useAuth();const[doctors,setDoctors]=useState<Doctor[]>([]);const[leaves,setLeaves]=useState<Leave[]>([]);const[doctorId,setDoctorId]=useState('');const[form,setForm]=useState({leave_date:'',start_time:'',end_time:'',reason:''});const[message,setMessage]=useState('')
 useEffect(()=>{if(!user)return;if(demoMode){setDoctors(demoDoctors);setDoctorId(user.role==='DOCTOR'?'1':'1');return}if(user.role==='ADMIN')api.listDoctors().then(ds=>{setDoctors(ds);if(ds.length)setDoctorId(String(ds[0].id))});else if(user.role==='DOCTOR'&&user.profile_id)setDoctorId(String(user.profile_id))},[user,demoMode])
 useEffect(()=>{if(!user)return;const id=user.role==='DOCTOR'?user.profile_id:Number(doctorId)||undefined;if(!id&&!demoMode)return;if(demoMode){setLeaves([]);return}api.listLeaves(id||undefined).then(setLeaves).catch(e=>setMessage(e.message))},[user,doctorId,demoMode])
 async function submit(e:FormEvent){e.preventDefault();try{if(!demoMode){const r=await api.createLeave(Number(doctorId),{leave_date:form.leave_date,start_time:form.start_time||undefined,end_time:form.end_time||undefined,reason:form.reason||undefined});setLeaves(prev=>[r,...prev])}setMessage('Leave request submitted. Admin approval is required before it blocks appointments.')}catch(e){setMessage(e instanceof Error?e.message:'Could not create leave')}}
 async function approve(id:number,status:'APPROVED'|'REJECTED'){try{const r=await api.approveLeave(id,status);setLeaves(prev=>prev.map(l=>l.id===id?r:l));setMessage(`Leave ${status.toLowerCase()}.`)}catch(e){setMessage(e instanceof Error?e.message:'Could not update leave')}}
 return <div><PageHeader title="Doctor leave" subtitle={user?.role==='ADMIN'?'Review and approve doctor leave requests.':'Submit leave requests for admin approval.'}/>{message&&<div className="inline-alert">{message}</div>}
 <div className="dashboard-grid"><SectionCard title={user?.role==='ADMIN'?'Leave requests':'Request leave'} subtitle={user?.role==='ADMIN'?'Only approved leave blocks appointment booking.':'Your request remains pending until admin approval.'}>
 {user?.role==='DOCTOR'&&<form className="form-stack" onSubmit={submit}><label>Date<input required type="date" value={form.leave_date} onChange={e=>setForm({...form,leave_date:e.target.value})}/></label><div className="form-grid"><label>Start time<input type="time" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})}/></label><label>End time<input type="time" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})}/></label></div><label>Reason<textarea rows={3} value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})}/></label><button className="primary-button"><Plus size={17}/> Submit leave request</button></form>}
 {user?.role==='ADMIN'&&<div className="table-wrap"><table><thead><tr><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr></thead><tbody>{leaves.map(l=><tr key={l.id}><td>{doctors.find(d=>d.id===l.doctor_id)?doctorName(doctors.find(d=>d.id===l.doctor_id)!):`Doctor #${l.doctor_id}`}</td><td>{formatDate(l.leave_date)}</td><td>{l.start_time?`${formatTime(l.start_time)} – ${formatTime(l.end_time||'23:59')}`:'Full day'}</td><td><StatusBadge status={l.approval_status||'PENDING'}/></td><td>{l.approval_status==='PENDING'&&<div className="row-actions"><button className="small-button" onClick={()=>approve(l.id,'APPROVED')}><Check size={14}/> Approve</button><button className="small-button danger" onClick={()=>approve(l.id,'REJECTED')}><X size={14}/> Reject</button></div>}</td></tr>)}</tbody></table>{!leaves.length&&<div className="soft-placeholder"><CalendarOff size={20}/>No leave requests.</div>}</div>}
 {user?.role==='DOCTOR'&&<div className="table-wrap"><table><thead><tr><th>Date</th><th>Time</th><th>Reason</th><th>Status</th></tr></thead><tbody>{leaves.map(l=><tr key={l.id}><td>{formatDate(l.leave_date)}</td><td>{l.start_time?`${formatTime(l.start_time)} – ${formatTime(l.end_time||'23:59')}`:'Full day'}</td><td>{l.reason||'—'}</td><td><StatusBadge status={l.approval_status||'PENDING'}/></td></tr>)}</tbody></table></div>}
 </SectionCard></div></div>
}
