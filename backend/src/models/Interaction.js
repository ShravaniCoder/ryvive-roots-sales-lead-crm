const mongoose = require('mongoose')
const interactionSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Call','Meeting','Email','WhatsApp','Note'], default: 'Note' },
  notes: { type: String, required: true, trim: true }
}, { timestamps: true })
module.exports = mongoose.model('Interaction', interactionSchema)
