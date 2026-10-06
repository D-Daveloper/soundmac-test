import mongoose, { Schema, models, model } from "mongoose";

const IdempotencyKeySchema = new Schema({
     user: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User",
       required: [true, "Provide a user!"],
     }, // API client / user id
  key: { type: String, required: true },
  method: { type: String, required: true },
  path: { type: String, required: true },
  requestHash: { type: String, required: true },
  status: { type: String, enum: ["processing", "completed"], default: "processing" },
  responseStatus: { type: Number },
  responseBody: { type: Schema.Types.Mixed },
  lockedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// One record per (user, key): this is what makes it race-safe
IdempotencyKeySchema.index({ user: 1, key: 1 }, { unique: true });
// Auto-delete after 24 hours
IdempotencyKeySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

export const IdempotencyKey =
  models.IdempotencyKey || model("IdempotencyKey", IdempotencyKeySchema);