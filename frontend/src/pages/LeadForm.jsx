import { useState } from 'react'
import { ArrowUpRight, ShieldCheck, ImagePlus, X, MapPin } from 'lucide-react'
import { PageHeading, Field } from '../components/Shared'
import api from '../api'

const EMPLOYEES = ['Employee 1', 'Employee 2', 'Employee 3', 'Employee 4', 'Employee 5']
const emptyForm = {employeeName:'',clientName:'',phone:'',companyName:'',companyProfile:'',contactPersonRole:'',email:'',address:'',description:'',leadSource:'Cold Call',nextFollowUp:''}
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGES = 3
const MIN_IMAGES = 2
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

function LeadForm() {
 const [form,setForm]=useState(emptyForm)
 const [locationImages,setLocationImages]=useState([])
 const [saving,setSaving]=useState(false),[message,setMessage]=useState('')
 const update=e=>setForm({...form,[e.target.name]:e.target.value})


 const handleImageChange=e=>{
   const selected=Array.from(e.target.files || [])
   if(!selected.length) return
   const remaining=MAX_IMAGES-locationImages.length
   if(selected.length>remaining){
     setMessage(`You can upload a maximum of ${MAX_IMAGES} location photos.`)
     e.target.value=''
     return
   }
   const invalid=selected.find(file=>!allowedImageTypes.includes(file.type))
   if(invalid){setMessage('Please upload JPG, PNG or WEBP images only.');e.target.value='';return}
   const tooLarge=selected.find(file=>file.size>MAX_IMAGE_SIZE)
   if(tooLarge){setMessage('Each location photo must be 5 MB or smaller.');e.target.value='';return}
   setLocationImages(current=>[...current,...selected.map(file=>({file,preview:URL.createObjectURL(file)}))])
   setMessage('')
   e.target.value=''
 }

 const removeImage=index=>{
   setLocationImages(current=>{
     const item=current[index]
     if(item) URL.revokeObjectURL(item.preview)
     return current.filter((_,i)=>i!==index)
   })
 }

 const submit=async e=>{
   e.preventDefault()
   if(locationImages.length<MIN_IMAGES){
     setMessage(`Please upload at least ${MIN_IMAGES} business location photos. This field is required.`)
     return
   }
   setSaving(true)
   setMessage('')
   try{
     const formData=new FormData()
     Object.entries(form).forEach(([key,value])=>formData.append(key,value))
     locationImages.forEach(item=>formData.append('locationImages',item.file))
     await api.post('/leads/public',formData)
     setMessage('Lead submitted successfully. Admin can now view all business location photos.')
     setForm({...emptyForm})
     locationImages.forEach(item=>URL.revokeObjectURL(item.preview))
     setLocationImages([])
   }catch(err){
     setMessage(err.response?.data?.message||'Could not save lead. Please check your API connection.')
   }finally{setSaving(false)}
 }

 return <div className="public-submit-wrap"><PageHeading eyebrow="EMPLOYEE LEAD SUBMISSION" title={<>A new connection.<br/><em>Starts here.</em></>} description="Select your name, enter the customer details and submit the lead for Admin review."/><form className="lead-form panel" onSubmit={submit}>
   <div className="form-section-head"><span className="number">00</span><div><span className="eyebrow">EMPLOYEE DETAILS</span><h3>Who is submitting this lead?</h3><p>Select your name before entering customer details.</p></div></div>
   <div className="form-grid"><div className="field"><label>Employee name <b>*</b></label><select name="employeeName" value={form.employeeName} onChange={update} required><option value="">Select your name</option>{EMPLOYEES.map(name=><option key={name} value={name}>{name}</option>)}</select></div></div>
   <div className="form-divider"/><div className="form-section-head"><span className="number">01</span><div><span className="eyebrow">THE PERSON</span><h3>Contact information</h3><p>Who did you connect with?</p></div></div>
   <div className="form-grid"><Field label="Client / contact name" name="clientName" value={form.clientName} onChange={update} required placeholder="Full name"/><Field label="Phone number" name="phone" value={form.phone} onChange={update} required placeholder="+91 00000 00000"/><Field label="Email address" name="email" type="email" value={form.email} onChange={update} placeholder="name@company.com"/><Field label="Contact person's role" name="contactPersonRole" value={form.contactPersonRole} onChange={update} placeholder="Owner, HR, Manager, Director…"/></div>
   <div className="form-divider"/><div className="form-section-head"><span className="number">02</span><div><span className="eyebrow">THE BUSINESS</span><h3>Company profile</h3><p>Tell us about the organisation and where it is located.</p></div></div>
   <div className="form-grid"><Field label="Company / business name" name="companyName" value={form.companyName} onChange={update} required placeholder="Business name"/><div className="field"><label>Company profile <b>*</b></label><select name="companyProfile" value={form.companyProfile} onChange={update} required><option value="">Select business type</option>{['Gym / Fitness Centre','Yoga Studio','Corporate Office','Healthcare / Hospital','Wellness Centre','Sports Club','Hotel / Hospitality','Educational Institution','Other'].map(x=><option key={x}>{x}</option>)}</select></div>
     <div className="field full-field"><label>Business address</label><textarea name="address" value={form.address} onChange={update} rows="2" placeholder="Street, area, city, state and PIN code"/></div>
     <div className="field full-field"><label>Business location photos <b>*</b></label><p className="location-upload-help">Upload 2 or 3 clear photos of the business location. At least 2 photos are required. JPG, PNG or WEBP · Maximum 5 MB each.</p><div className="location-upload-multi">
       <div className="location-preview-grid">{locationImages.map((item,index)=><div className="location-preview-card" key={`${item.file.name}-${index}`}><img src={item.preview} alt={`Business location photo ${index+1}`}/><div className="location-preview-meta"><span><MapPin size={13}/> Photo {index+1}</span><button type="button" className="remove-location-image" onClick={()=>removeImage(index)} aria-label={`Remove photo ${index+1}`}><X size={14}/> Remove</button></div></div>)}
       {locationImages.length<MAX_IMAGES&&<label htmlFor="locationImages" className="location-upload-trigger"><ImagePlus size={25}/><strong>{locationImages.length===0?'Upload business location photos':'Add another photo'}</strong><span>{locationImages.length} of {MAX_IMAGES} selected · Minimum {MIN_IMAGES}</span><input id="locationImages" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageChange} aria-required="true" hidden/></label>}</div>
       <div className={`location-image-count ${locationImages.length>=MIN_IMAGES?'is-valid':''}`}>{locationImages.length} / {MAX_IMAGES} photos selected {locationImages.length<MIN_IMAGES?'— '+(MIN_IMAGES-locationImages.length)+' more required':'— required photos added'}</div>
     </div></div>
   </div>
   <div className="form-divider"/><div className="form-section-head"><span className="number">03</span><div><span className="eyebrow">THE CONVERSATION</span><h3>Sales context</h3><p>Keep a useful record of how the relationship began.</p></div></div>
   <div className="form-grid"><div className="field"><label>Lead source</label><select name="leadSource" value={form.leadSource} onChange={update}>{['Cold Call','Reference','Website','Walk-in','LinkedIn','Event','Other'].map(x=><option key={x}>{x}</option>)}</select></div><div className="field"><label>Next follow-up date</label><input type="date" name="nextFollowUp" value={form.nextFollowUp} onChange={update}/></div><div className="field full-field"><label>Discussion notes / description</label><textarea name="description" value={form.description} onChange={update} rows="4" placeholder="What did you discuss? What does the customer need? What should happen next?"/></div></div>
   {message&&<div className={message.startsWith('Lead submitted')?'success-box':'error-box'}>{message}</div>}
   <div className="form-actions"><span><ShieldCheck size={15}/> Employee name, submission time and 2–3 required location photos will be saved.</span><button className={`button primary save-lead-button ${saving ? 'is-saving' : ''}`} disabled={saving} type="submit"><span>{saving ? 'Saving your lead…' : 'Save customer lead'}</span>{saving ? <span className="save-lead-spinner" aria-hidden="true"/> : <ArrowUpRight size={16} className="save-lead-arrow"/>}</button></div>
 </form></div>
}
export default LeadForm
