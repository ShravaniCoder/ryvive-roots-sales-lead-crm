import { useState } from 'react'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { Brand } from '../components/Shared'
import api from '../api'

function Login({onLogin}) {
  const [email,setEmail]=useState(''), [password,setPassword]=useState(''), [error,setError]=useState(''), [loading,setLoading]=useState(false)
  const submit=async e=>{e.preventDefault();setLoading(true);setError('');try{const r=await api.post('/auth/login',{email,password});onLogin(r.data.user)}catch(err){setError(err.response?.data?.message||'Unable to sign in. Check your details and try again.')}finally{setLoading(false)}}
  return <div className="login-page"><div className="login-intro"><span className="eyebrow light">FOOD ENGINEERED FOR YOUR BEST SELF.</span><h1>Build better<br/><em>connections.</em></h1><p>Every conversation is an opportunity to bring mindful nourishment to more people.</p><span className="login-intro-foot">RYVIVE ROOTS · SALES & MARKETING</span></div><div className="login-panel"><Brand/><div className="login-form-wrap"><span className="eyebrow">TEAM PORTAL</span><h2>Welcome<br/><em>back.</em></h2><p className="muted">Sign in to continue to your workspace.</p><form onSubmit={submit}><label>Work email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@ryviveroots.com" required/><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required/><div className="login-meta"><span>Authorised team access only</span><ShieldCheck size={15}/></div>{error&&<div className="error-box">{error}</div>}<button className="button primary full" disabled={loading}>{loading?'Signing in…':'Sign in to CRM'} <ArrowUpRight size={16}/></button></form></div><p className="login-bottom">© 2026 RYVIVE ROOTS. ALL RIGHTS RESERVED.</p></div></div>
}
export default Login
