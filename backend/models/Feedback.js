// models/Feedback.js
const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  waterDispenser: { type: mongoose.Schema.Types.ObjectId, ref: 'WaterDispenser', required: true },
  feedbackType: { type: String, required: true }, // 例如：'維修需求', '狀況不良'
  description: String,
  images: [String],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
