require('dotenv').config()
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const authRoutes = require('./src/routes/auth')
const leadRoutes = require('./src/routes/leads')
const employeeRoutes = require('./src/routes/employees')
const app = express()

app.use(helmet({
  // Uploaded photos are served by the API and displayed by the separate frontend.
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  fallthrough: false,
  setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=86400')
}))
app.use(cookieParser())
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false }))
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'Ryvive CRM API is running' }))
app.use('/api/auth', authRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/employees', employeeRoutes)
app.use((err, _req, res, _next) => {
  console.error(err)
  const status = err.name === 'MulterError' ? 400 : (err.status || 500)
  const message = err.code === 'LIMIT_FILE_SIZE'
    ? 'Each location photo must be 5 MB or smaller.'
    : err.code === 'LIMIT_FILE_COUNT'
      ? 'You can upload a maximum of 3 location photos.'
      : (err.message || 'Server error')
  res.status(status).json({ message })
})
const PORT = process.env.PORT || 5000
mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`CRM API listening on ${PORT}`))
}).catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1) })
