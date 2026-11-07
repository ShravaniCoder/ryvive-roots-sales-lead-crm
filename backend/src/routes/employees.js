const router = require('express').Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Lead = require('../models/Lead')
const { requireAuth, requireAdmin } = require('../middleware/auth')
router.use(requireAuth, requireAdmin)
router.get('/', async (_req, res) => {
  const employees = await User.find().select('-passwordHash').sort({ createdAt: -1 })
  res.json({ employees })
})
router.post('/', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password || password.length < 10)
    return res.status(400).json({ message: 'Name, email and a password of at least 10 characters are required.' })
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with this email already exists.' })
  const passwordHash = await bcrypt.hash(password, 12)
  const employee = await User.create({ name, email, passwordHash, role: 'employee' })
  res.status(201).json({ employee: { id: employee._id, name: employee.name, email: employee.email, role: employee.role } })
})
router.put('/:id/status', async (req, res) => {
  const employee = await User.findOneAndUpdate({ _id: req.params.id, role: 'employee' }, { active: Boolean(req.body.active) }, { new: true }).select('-passwordHash')
  if (!employee) return res.status(404).json({ message: 'Employee not found.' })
  res.json({ employee })
})
router.get('/performance', async (_req, res) => {
  const employees = await User.find({ role: 'employee' }).select('name email active')
  const results = await Promise.all(employees.map(async employee => ({
    employee,
    totalLeads: await Lead.countDocuments({ $or: [{ createdBy: employee._id }, { assignedTo: employee._id }] }),
    converted: await Lead.countDocuments({ $or: [{ createdBy: employee._id }, { assignedTo: employee._id }], status: 'Converted' })
  })))
  res.json({ performance: results })
})
module.exports = router
