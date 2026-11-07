const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { requireAuth } = require('../middleware/auth')
const cookieOptions = () => ({
  httpOnly: true, secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax', path: '/', maxAge: 8 * 60 * 60 * 1000
})
router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim()
  const user = await User.findOne({ email })
  if (!user || !user.active || !(await bcrypt.compare(req.body.password || '', user.passwordHash)))
    return res.status(401).json({ message: 'Invalid email or password.' })
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' })
  res.cookie('rrcrm', token, cookieOptions())
  res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
})
router.post('/logout', (_req, res) => { res.clearCookie('rrcrm', cookieOptions()); res.json({ success: true }) })
router.get('/me', requireAuth, (req, res) => res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } }))
module.exports = router
