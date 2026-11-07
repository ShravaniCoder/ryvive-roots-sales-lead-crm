const mongoose = require('mongoose')
const leadSchema = new mongoose.Schema({
  employeeName: { type: String, required: true, trim: true },
  clientName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  companyName: { type: String, required: true, trim: true },
  companyProfile: { type: String, required: true },
  contactPersonRole: String,
  address: String,
  locationImages: { type: [String], default: [] },
  description: String,
  leadSource: { type: String, default: 'Other' },
  status: { type: String, enum: ['New Lead','Contacted','Interested','Follow-up Required','Proposal Sent','Converted','Not Interested'], default: 'New Lead' },
  nextFollowUp: Date,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })
leadSchema.index({ phone: 1, companyName: 1 })
module.exports = mongoose.model('Lead', leadSchema)
