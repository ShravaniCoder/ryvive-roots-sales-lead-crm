import { useEffect, useState } from 'react'
import { Download, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { PageHeading, LeadTable, demoLeads, statuses } from '../components/Shared'
import api from '../api'

function Leads({user}) {
  const [leads,setLeads]=useState(demoLeads),[search,setSearch]=useState(''),[status,setStatus]=useState('All statuses')
  useEffect(()=>{api.get('/leads').then(r=>setLeads(r.data.leads||[])).catch(()=>{})},[])
  const filtered=leads.filter(l=>(`${l.clientName} ${l.companyName} ${l.phone} ${l.assignedName||''}`).toLowerCase().includes(search.toLowerCase())&&(status==='All statuses'||l.status===status))
  return <><PageHeading eyebrow="CUSTOMER RELATIONSHIPS" title="Lead directory." description="Every potential partnership, thoughtfully organised." action={<a className="button primary" href="/leads/new"><Plus size={16}/> Add new lead</a>}/><div className="toolbar"><div className="searchbox"><Search size={17}/><input placeholder="Search name, company or phone…" value={search} onChange={e=>setSearch(e.target.value)}/></div><select value={status} onChange={e=>setStatus(e.target.value)}><option>All statuses</option>{statuses.map(s=><option key={s}>{s}</option>)}</select><button className="button outline"><SlidersHorizontal size={15}/> Filters</button></div><section className="panel table-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR PIPELINE</span><h3>{filtered.length} customer records</h3></div><button className="button ghost" onClick={()=>window.print()}><Download size={15}/> Export / Print</button></div><LeadTable leads={filtered} admin={user.role==='admin'}/></section></>
}
export default Leads
