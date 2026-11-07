const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(process.cwd(), 'uploads', 'locations')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase()
    const safeName = `location-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`
    cb(null, safeName)
  }
})

const uploadLocation = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.mimetype)) return cb(new Error('Only JPG, PNG and WEBP location photos are allowed.'))
    cb(null, true)
  }
})

module.exports = uploadLocation
