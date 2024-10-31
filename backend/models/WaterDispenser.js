// models/WaterDispenser.js
const mongoose = require('mongoose');

const WaterDispenserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [經度, 緯度]
  },
  hasHotWater: { type: Boolean, default: false },
  hasColdWater: { type: Boolean, default: false },
  status: { type: String, default: '正常' }, // 例如：'正常', '維護中'
  model: String,
  serviceTime: String,
  publicAccess: { type: Boolean, default: true },
  images: [String],
  maintenanceStatus: { type: String, default: '正常' },
  lastMaintenanceDate: Date,
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
});

WaterDispenserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('WaterDispenser', WaterDispenserSchema);
