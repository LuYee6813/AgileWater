// models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  waterDispenser: { type: mongoose.Schema.Types.ObjectId, ref: 'WaterDispenser', required: true },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  images: [String],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Review', ReviewSchema);
