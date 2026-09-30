import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICounter extends Document<string> {
  _id: string;
  value: number;
  year?: number;
  recycled?: number[];
}

const CounterSchema = new Schema<ICounter>(
  {
    _id: { type: String, required: true },
    value: { type: Number, required: true },
    // year: { type: Number },
    // recycled: { type: [Number], default: [] },
  },
  { _id: false }, // disable auto-generated ObjectId since we're using string _id
);

export const Counter: Model<ICounter> =
  mongoose.models?.Counter || mongoose.model<ICounter>("Counter", CounterSchema);
