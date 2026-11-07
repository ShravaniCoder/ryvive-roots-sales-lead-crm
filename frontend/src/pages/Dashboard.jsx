import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw, Search, MapPin, Phone, Mail, CalendarDays, UserRound, Building2, Image as ImageIcon, ExternalLink, Trash2 } from 'lucide-react'
import { PageHeading } from '../components/Shared'
import api from '../api'

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '').replace(/\/$/, '')

function imageUrl(value) {
  const path = typeof value === 'string' ? value : value?.url || value?.path || value?.filename || ''
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`
}

function formatDate(value, includeTime = false) {
  if (!value) return 'Not specified'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-IN', includeTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' })
}

function Dashboard() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [employeeFilter, setEmployeeFilter] = useState('All employees')
  const [deletingId, setDeletingId] = useState('')

  const fetchLeads = useCallback(async (quiet = false) => {
    try {
      if (quiet) setRefreshing(true)
      else setLoading(true)
      setError('')
      const response = await api.get('/leads')
      // Never fall back to demo/sample records. An empty database means an empty list.
      setLeads(Array.isArray(response.data?.leads) ? response.data.leads : [])
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load submitted records. Check the backend and Admin login.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
    // New employee submissions appear automatically without a manual refresh.
    const timer = window.setInterval(() => fetchLeads(true), 15000)
    return () => window.clearInterval(timer)
  }, [fetchLeads])

  const employees = useMemo(() => ['All employees', ...new Set(leads.map(x => x.employeeName).filter(Boolean).sort())], [leads])
  const visibleLeads = useMemo(() => {
    const term = search.trim().toLowerCase()
    return leads.filter(lead => {
      const employeeMatch = employeeFilter === 'All employees' || lead.employeeName === employeeFilter
      const text = [lead.clientName, lead.companyName, lead.companyProfile, lead.phone, lead.email, lead.employeeName, lead.address].join(' ').toLowerCase()
      return employeeMatch && (!term || text.includes(term))
    })
  }, [leads, search, employeeFilter])

  const deleteLead = async (lead) => {
    const confirmed = window.confirm(`Delete the submitted record for ${lead.clientName || lead.companyName}? This cannot be undone.`)
    if (!confirmed) return
    try {
      setDeletingId(lead._id)
      await api.delete(`/leads/${lead._id}`)
      setLeads(current => current.filter(item => item._id !== lead._id))
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not delete this record.')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className="admin-records-page">
      <PageHeading
        eyebrow="RYVIVE ROOTS / ADMIN RECORDS"
        title="Employee submissions"
        description="Only real records submitted through the employee form are shown here. New submissions refresh automatically."
        action={<button className="button primary" onClick={() => fetchLeads(true)} disabled={refreshing}><RefreshCw size={15} className={refreshing ? 'spin-icon' : ''}/> {refreshing ? 'Refreshing…' : 'Refresh records'}</button>}
      />

      <section className="records-toolbar panel">
        <div className="records-count"><span className="eyebrow">DATABASE RECORDS</span><strong>{leads.length}</strong><span>{leads.length === 1 ? 'submitted lead' : 'submitted leads'}</span></div>
        <div className="records-filters">
          <label className="records-search"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search client, company, phone…"/></label>
          <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} aria-label="Filter by employee">{employees.map(name => <option key={name}>{name}</option>)}</select>
        </div>
      </section>

      {error && <div className="error-box records-error">{error} <button className="text-link" onClick={() => fetchLeads()}>Try again</button></div>}
      {loading ? <div className="records-empty panel">Loading submitted records…</div> : !error && visibleLeads.length === 0 ? (
        <div className="records-empty panel">
          <div className="records-empty-icon"><Building2 size={23}/></div>
          <h2>{leads.length ? 'No matching records' : 'No employee submissions yet'}</h2>
          <p>{leads.length ? 'Change the search or employee filter to see other records.' : 'When an employee submits the lead form with the required location photos, the real database record will appear here automatically.'}</p>
          <button className="button secondary" onClick={() => fetchLeads(true)} disabled={refreshing}><RefreshCw size={14}/> Check for submissions</button>
        </div>
      ) : (
        <div className="submitted-records-list">
          {visibleLeads.map((lead, index) => {
            const photos = Array.isArray(lead.locationImages) ? lead.locationImages : []
            return (
              <article className="submitted-record-card panel" key={lead._id || index}>
                <header className="submitted-record-header">
                  <div className="record-index">{String(visibleLeads.length - index).padStart(2, '0')}</div>
                  <div className="record-title"><span className="eyebrow">{lead.companyProfile || 'BUSINESS LEAD'}</span><h2>{lead.clientName || 'Unnamed contact'}</h2><p>{lead.companyName || 'Company not provided'}</p></div>
                  <div className="record-submitted-date"><CalendarDays size={14}/><span>Submitted {formatDate(lead.createdAt, true)}</span></div>
                  <button className="record-delete-button" onClick={() => deleteLead(lead)} disabled={deletingId === lead._id} title="Delete record"><Trash2 size={15}/>{deletingId === lead._id ? 'Deleting…' : 'Delete'}</button>
                </header>

                <div className="record-details-grid">
                  <div className="record-detail"><span><UserRound size={14}/> SUBMITTED BY</span><strong>{lead.employeeName || 'Not provided'}</strong></div>
                  <div className="record-detail"><span><Phone size={14}/> PHONE NUMBER</span><strong>{lead.phone || '—'}</strong></div>
                  <div className="record-detail"><span><Mail size={14}/> EMAIL ADDRESS</span><strong>{lead.email || '—'}</strong></div>
                  <div className="record-detail"><span><UserRound size={14}/> CONTACT ROLE</span><strong>{lead.contactPersonRole || '—'}</strong></div>
                  <div className="record-detail"><span><MapPin size={14}/> BUSINESS ADDRESS</span><strong>{lead.address || '—'}</strong></div>
                  <div className="record-detail"><span><CalendarDays size={14}/> NEXT FOLLOW-UP</span><strong>{formatDate(lead.nextFollowUp)}</strong></div>
                  <div className="record-detail"><span><Building2 size={14}/> LEAD SOURCE</span><strong>{lead.leadSource || '—'}</strong></div>
                  <div className="record-detail"><span>STATUS</span><strong><i className="record-status-dot"/>{lead.status || 'New Lead'}</strong></div>
                </div>

                <div className="record-notes"><span className="eyebrow">DISCUSSION NOTES</span><p>{lead.description?.trim() || 'No discussion notes added.'}</p></div>

                <section className="record-photos-section">
                  <div className="record-photos-heading"><div><span className="eyebrow">LOCATION EVIDENCE</span><h3><ImageIcon size={16}/> Business location photographs</h3></div><span>{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</span></div>
                  {photos.length ? <div className="record-photo-grid">{photos.map((photo, photoIndex) => {
                    const src = imageUrl(photo)
                    return <a className="record-photo" href={src} target="_blank" rel="noreferrer" key={`${lead._id}-photo-${photoIndex}`} title="Open full-size photo"><img src={src} alt={`${lead.companyName || 'Business'} location ${photoIndex + 1}`} loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement.classList.add('record-photo-broken') }} /><span>Photo {photoIndex + 1}<ExternalLink size={12}/></span></a>
                  })}</div> : <div className="record-no-photos">No location photographs were attached to this record.</div>}
                </section>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Dashboard
