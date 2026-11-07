const jwt = require('jsonwebtoken')
const User = require('../models/User')
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.rrcrm || (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
    if (!token) return res.status(401).json({ message: 'Please sign in.' })
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.id).select('-passwordHash')
    if (!user || !user.active) return res.status(401).json({ message: 'Account unavailable.' })
    req.user = user
    next()
  } catch { return res.status(401).json({ message: 'Session expired. Please sign in again.' }) }
}
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Administrator access required.' })
  next()
}
module.exports = { requireAuth, requireAdmin }
