import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  nickname: string;
  admin: boolean;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, required: true },
  admin: { type: Boolean, default: false }
});

export const User = mongoose.model<IUser>('User', UserSchema);
