import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import api from './api'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import LeadForm from './pages/LeadForm'
import Followups from './pages/Followups'
import Employees from './pages/Employees'
import Reports from './pages/Reports'
import AppShell from './layout/AppShell'

function App() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    api.get('/auth/me').then(r => setUser(r.data.user)).catch(() => setUser(null)).finally(() => setChecking(false))
  }, [])

  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    setUser(null)
  }

  if (checking) return <div className="boot"><div className="brand-mark">R<span>R</span></div><p>Preparing your workspace</p></div>

  return <Routes>
    <Route path="/submit-lead" element={<LeadForm />} />
    <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={setUser} />} />
    <Route path="/*" element={user ? <AppShell user={user} logout={logout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/leads" element={user.role === 'admin' ? <Navigate to="/dashboard" replace /> : <Leads user={user} />} />
        <Route path="/leads/new" element={<Navigate to="/submit-lead" replace />} />
        <Route path="/employees" element={user.role === 'admin' ? <Employees /> : <Navigate to="/dashboard" />} />
        <Route path="/follow-ups" element={user.role === 'admin' ? <Navigate to="/dashboard" replace /> : <Followups />} />
        <Route path="/reports" element={user.role === 'admin' ? <Reports /> : <Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell> : <Navigate to="/login" state={{ from: location }} replace />} />
  </Routes>
}

export default App
