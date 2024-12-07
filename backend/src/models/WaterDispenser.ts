import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface IReview {
  sn: number; // Review ID
  username: string; // User ID of the reviewer
  cmntImg?: string; // Comment-related image URL
  star: number; // Rating: 1.0 ~ 5.0
  content: string; // Review content
  time: Date; // Time of the review
  stolen: boolean; // Indicates if the review is stolen
}

export interface IWaterDispenser extends Document {
  sn: number;
  type: string;
  location: { type: string; coordinates: [number, number] }; // [lng, lat]
  name: string;
  addr?: string;
  iced: boolean;
  cold: boolean;
  warm: boolean;
  hot: boolean;
  openingHours?: string;
  description: string;
  rate: number;
  photos: string[];
  path: string;
  reviews: IReview[];
}

const ReviewSchema: Schema = new Schema({
  sn: { type: Number, required: true }, // Review ID
  username: { type: String, required: true }, // Reviewer name
  cmntImg: { type: String, required: false }, // Optional comment image URL
  star: { type: Number, required: true, min: 1.0, max: 5.0 }, // Rating
  content: { type: String, default: '' }, // Review content
  time: { type: Date, required: true, default: Date.now }, // Review timestamp
  stolen: { type: Boolean, required: true, default: false } // Is stolen
});

const WaterDispenserSchema: Schema = new Schema({
  sn: { type: Number, required: true, unique: true },
  type: { type: String, default: '' },
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  name: { type: String, required: true },
  addr: { type: String },
  iced: { type: Boolean, required: true },
  cold: { type: Boolean, required: true },
  warm: { type: Boolean, required: true },
  hot: { type: Boolean, required: true },
  openingHours: { type: String },
  description: { type: String },
  rate: { type: Number, default: 0 },
  photos: { type: [String], default: [] },
  path: { type: String, default: '' },
  reviews: { type: [ReviewSchema], default: [] }
});

// 2dsphere index for location
WaterDispenserSchema.index({ location: '2dsphere' });

export const WaterDispenser = mongoose.model<IWaterDispenser>(
  'WaterDispenser',
  WaterDispenserSchema
);
