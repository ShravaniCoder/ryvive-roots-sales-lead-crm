require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../src/models/User')
async function run() {
  await mongoose.connect(process.env.MONGO_URI)
  const email = String(process.env.ADMIN_EMAIL || '').toLowerCase().trim()
  if (!email || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_NAME) throw new Error('Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env')
  const existing = await User.findOne({ email })
  if (existing) console.log('Admin already exists; no changes made.')
  else {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
    await User.create({ name: process.env.ADMIN_NAME, email, passwordHash, role: 'admin' })
    console.log(`Admin created: ${email}`)
  }
  await mongoose.disconnect()
}
run().catch(err => { console.error(err); process.exit(1) })
