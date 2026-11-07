import { ArrowUpRight } from 'lucide-react'

export const demoLeads = [
  { _id:'1', clientName:'Aarav Mehta', companyName:'Core Fitness Studio', companyProfile:'Gym / Fitness Centre', phone:'+91 98201 44821', email:'aarav@corefitness.in', status:'Interested', assignedName:'Priya Shah', createdAt:'2026-11-03', nextFollowUp:'2026-11-06', leadSource:'Cold Call' },
  { _id:'2', clientName:'Neha Kapoor', companyName:'The Yoga Room', companyProfile:'Yoga Studio', phone:'+91 98190 22814', email:'neha@theyogaroom.in', status:'Follow-up Required', assignedName:'Rohan Patil', createdAt:'2026-11-03', nextFollowUp:'2026-11-05', leadSource:'Reference' },
  { _id:'3', clientName:'Karan Desai', companyName:'Northstar Technologies', companyProfile:'Corporate Office', phone:'+91 98920 11570', email:'karan@northstar.in', status:'Proposal Sent', assignedName:'Priya Shah', createdAt:'2026-11-02', nextFollowUp:'2026-11-07', leadSource:'LinkedIn' },
  { _id:'4', clientName:'Mira Joshi', companyName:'Balance Wellness', companyProfile:'Wellness Centre', phone:'+91 98198 30771', email:'mira@balancewellness.in', status:'New Lead', assignedName:'Rohan Patil', createdAt:'2026-11-01', nextFollowUp:'2026-11-08', leadSource:'Walk-in' },
  { _id:'5', clientName:'Siddharth Rao', companyName:'Pulse Sports Club', companyProfile:'Sports Club', phone:'+91 98204 91328', email:'siddharth@pulse.in', status:'Converted', assignedName:'Priya Shah', createdAt:'2026-10-30', nextFollowUp:'—', leadSource:'Website' },
]
export const chartData = [{name:'Mon',leads:8},{name:'Tue',leads:12},{name:'Wed',leads:7},{name:'Thu',leads:15},{name:'Fri',leads:11},{name:'Sat',leads:18},{name:'Sun',leads:9}]
export const statuses = ['New Lead','Contacted','Interested','Follow-up Required','Proposal Sent','Converted','Not Interested']

export function Brand({small=false}) { return <div className={`brand ${small?'brand-small':''}`}><div className="brand-symbol">✳</div><div><div className="brand-name">RYVIVE<br/>ROOTS</div><div className="brand-tag">LIVE · RELIVE · BELIEVE</div></div></div> }

export function initials(n='Team Member'){return n.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}

export function PageHeading({eyebrow,title,description,action}){return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>}

export function Stat({label,value,delta,icon:Icon,sub}){return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={17}/></div></div><div className="stat-value">{value}</div><div className="stat-bottom"><span className="positive"><ArrowUpRight size={13}/>{delta}</span><span>{sub}</span></div></div>}

export function LeadTable({leads,admin=true}) {
  return <div className="table-scroll"><table><thead><tr><th>CONTACT / COMPANY</th><th>BUSINESS TYPE</th>{admin&&<th>ADDED BY</th>}<th>STATUS</th><th>FOLLOW-UP</th></tr></thead><tbody>{leads.map(l=><tr key={l._id}><td><strong>{l.clientName}</strong><span className="cell-sub">{l.companyName}</span></td><td>{l.companyProfile||'—'}</td>{admin&&<td><div className="owner-cell"><span className="tiny-avatar">{initials(l.employeeName||l.createdByName||l.assignedName||'Team')}</span>{l.employeeName||l.createdByName||l.assignedName||'Unknown'}</div></td>}<td><Status value={l.status}/></td><td>{l.nextFollowUp||'—'}</td></tr>)}</tbody></table></div>
}

export function Status({value}){let cls=value==='Converted'?'green':value==='Interested'?'sage':value==='Not Interested'?'red':value==='Follow-up Required'?'amber':'neutral';return <span className={`status ${cls}`}><i/>{value||'New Lead'}</span>}

export function Field({label,name,value,onChange,required,placeholder,type='text'}){return <div className="field"><label>{label}{required&&<b> *</b>}</label><input name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} type={type}/></div>}
