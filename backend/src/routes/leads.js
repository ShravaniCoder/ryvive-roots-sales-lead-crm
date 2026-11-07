const router = require('express').Router()
const Lead = require('../models/Lead')
const Interaction = require('../models/Interaction')
const uploadLocation = require('../middleware/uploadLocation')
const fs = require('fs')
const path = require('path')
const { requireAuth, requireAdmin } = require('../middleware/auth')

// Public employee intake: employees select their name instead of creating individual accounts.
const removeUploadedFiles = files => (files || []).forEach(file => fs.unlink(path.join(process.cwd(), 'uploads', 'locations', file.filename), () => {}))
const removeStoredImages = images => (images || []).forEach(image => {
  const filename = path.basename(String(image))
  fs.unlink(path.join(process.cwd(), 'uploads', 'locations', filename), () => {})
})

router.post('/public', (req, res, next) => {
  uploadLocation.array('locationImages', 3)(req, res, err => {
    if (err) return next(err)
    next()
  })
}, async (req, res, next) => {
  try {
    const { employeeName, clientName, phone, companyName, companyProfile } = req.body
    if (!employeeName?.trim() || !clientName?.trim() || !phone?.trim() || !companyName?.trim() || !companyProfile?.trim()) {
      removeUploadedFiles(req.files)
      return res.status(400).json({ message: 'Employee name, client name, phone, company name and company profile are required.' })
    }
    if (!req.files || req.files.length < 2 || req.files.length > 3) {
      removeUploadedFiles(req.files)
      return res.status(400).json({ message: 'Please upload 2 or 3 business location photos. At least 2 photos are required.' })
    }
    const duplicate = await Lead.findOne({ phone: String(phone).trim(), companyName: String(companyName).trim() })
    if (duplicate) {
      removeUploadedFiles(req.files)
      return res.status(409).json({ message: 'A lead with this phone number and company already exists.' })
    }
    const lead = await Lead.create({
      employeeName: employeeName.trim(),
      clientName: clientName.trim(),
      phone: String(phone).trim(),
      companyName: companyName.trim(),
      companyProfile: companyProfile.trim(),
      contactPersonRole: req.body.contactPersonRole || '',
      email: req.body.email || '',
      address: req.body.address || '',
      locationImages: req.files.map(file => `/uploads/locations/${file.filename}`),
      description: req.body.description || '',
      leadSource: req.body.leadSource || 'Other',
      status: 'New Lead',
      nextFollowUp: req.body.nextFollowUp || undefined
    })
    return res.status(201).json({ lead, message: 'Lead submitted successfully.' })
  } catch (err) {
    removeUploadedFiles(req.files)
    next(err)
  }
})

router.use(requireAuth)
const canSee = (user) => user.role === 'admin' ? {} : { $or: [{ createdBy: user._id }, { assignedTo: user._id }] }
router.get('/', async (req, res) => {
  const leads = await Lead.find(canSee(req.user))
    .populate('createdBy', 'name email').populate('assignedTo', 'name email')
    .sort({ createdAt: -1 }).limit(1000)
  res.json({ leads: leads.map(l => ({ ...l.toObject(), assignedName: l.assignedTo?.name || 'Unassigned', createdByName: l.createdBy?.name || 'Unknown' })) })
})
router.post('/', async (req, res) => {
  const { employeeName, clientName, phone, companyName, companyProfile } = req.body
  if (!employeeName || !clientName || !phone || !companyName || !companyProfile)
    return res.status(400).json({ message: 'Employee name, client name, phone, company name and company profile are required.' })
  const duplicate = await Lead.findOne({ phone: String(phone).trim(), companyName: String(companyName).trim() })
  if (duplicate) return res.status(409).json({ message: 'A lead with this phone number and company already exists.' })
  const lead = await Lead.create({
    ...req.body, employeeName: String(employeeName).trim(), createdBy: req.user._id,
    assignedTo: req.user.role === 'admin' && req.body.assignedTo ? req.body.assignedTo : req.user._id,
    nextFollowUp: req.body.nextFollowUp || undefined
  })
  await lead.populate('createdBy', 'name')
  res.status(201).json({ lead })
})
router.get('/:id', async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, ...canSee(req.user) }).populate('createdBy assignedTo', 'name email')
  if (!lead) return res.status(404).json({ message: 'Lead not found.' })
  const interactions = await Interaction.find({ lead: lead._id }).populate('employee', 'name').sort({ createdAt: -1 })
  res.json({ lead, interactions })
})
router.put('/:id', async (req, res) => {
  const allowed = ['clientName','phone','email','companyName','companyProfile','contactPersonRole','address','description','leadSource','status','nextFollowUp']
  const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)))
  const lead = await Lead.findOneAndUpdate({ _id: req.params.id, ...canSee(req.user) }, update, { new: true, runValidators: true })
  if (!lead) return res.status(404).json({ message: 'Lead not found.' })
  res.json({ lead })
})
router.put('/:id/assign', requireAdmin, async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, { assignedTo: req.body.employeeId }, { new: true }).populate('assignedTo', 'name')
  if (!lead) return res.status(404).json({ message: 'Lead not found.' })
  res.json({ lead })
})
router.post('/:id/interactions', async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, ...canSee(req.user) })
  if (!lead) return res.status(404).json({ message: 'Lead not found.' })
  if (!req.body.notes?.trim()) return res.status(400).json({ message: 'Interaction notes are required.' })
  const interaction = await Interaction.create({ lead: lead._id, employee: req.user._id, type: req.body.type || 'Note', notes: req.body.notes })
  res.status(201).json({ interaction })
})
router.delete('/:id', requireAdmin, async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id)
  if (!lead) return res.status(404).json({ message: 'Lead not found.' })
  await Interaction.deleteMany({ lead: lead._id })
  removeStoredImages(lead.locationImages)
  res.json({ success: true })
})
module.exports = router
