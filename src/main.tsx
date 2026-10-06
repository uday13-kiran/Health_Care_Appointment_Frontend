import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './styles.css'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './layouts/AppLayout'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Patients } from './pages/Patients'
import { Doctors } from './pages/Doctors'
import { Appointments } from './pages/Appointments'
import { Queue } from './pages/Queue'
import { Consultation } from './pages/Consultation'
import { Availability } from './pages/Availability'
import { Leave } from './pages/Leave'
import { Reports } from './pages/Reports'
import { Users } from './pages/Users'
import { Settings } from './pages/Settings'

function App() {
  return <AuthProvider><BrowserRouter><Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register/:kind" element={<Register />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<AppLayout><Dashboard /></AppLayout>} path="/dashboard" />
      <Route element={<ProtectedRoute roles={['ADMIN', 'RECEPTIONIST']} />}><Route element={<AppLayout><Patients /></AppLayout>} path="/patients" /></Route>
      <Route element={<ProtectedRoute roles={['ADMIN', 'RECEPTIONIST', 'PATIENT']} />}><Route element={<AppLayout><Doctors /></AppLayout>} path="/doctors" /></Route>
      <Route element={<AppLayout><Appointments /></AppLayout>} path="/appointments" />
      <Route element={<AppLayout><Queue /></AppLayout>} path="/queue" />
      <Route element={<ProtectedRoute roles={['ADMIN', 'DOCTOR']} />}><Route element={<AppLayout><Consultation /></AppLayout>} path="/consultation" /></Route>
      <Route element={<AppLayout><Availability /></AppLayout>} path="/availability" />
      <Route element={<ProtectedRoute roles={['ADMIN', 'DOCTOR']} />}><Route element={<AppLayout><Leave /></AppLayout>} path="/leave" /></Route>
      <Route element={<ProtectedRoute roles={['ADMIN']} />}><Route element={<AppLayout><Reports /></AppLayout>} path="/reports" /></Route>
      <Route element={<ProtectedRoute roles={['ADMIN']} />}><Route element={<AppLayout><Users /></AppLayout>} path="/users" /></Route>
      <Route element={<AppLayout><Settings /></AppLayout>} path="/settings" />
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></BrowserRouter></AuthProvider>
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
