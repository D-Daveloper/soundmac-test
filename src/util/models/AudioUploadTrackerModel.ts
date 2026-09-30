// models/AudioUploadTracker.ts
import mongoose, { InferSchemaType } from "mongoose";

export type AudioTrackType = InferSchemaType<typeof AudioUploadTrackerSchema>;

const UploadedPartSchema = new mongoose.Schema(
  {
    partNumber: { type: Number, required: true },
    etag: { type: String, required: true },
  },
  { _id: false }, // no need for an id on each subdocument
);

const AudioUploadTrackerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
  s3Key: { type: String, required: true },
  upc: { type: String, required: true },
  trackNumber: { type: String },
  fileType: { type: String },
  fileSize: { type: Number },

  s3UploadId: { type: String }, // S3's multipart upload id, needed to sign/complete/abort parts
  totalParts: { type: Number },
  uploadedParts: { type: [UploadedPartSchema], default: [] },
  status: {
    type: String,
    enum: ["PENDING", "ACTIVE", "UPLOADING", "COMPLETED", "FAILED", "ABORTED"],
    default: "PENDING",
  },

  errorReason: { type: String },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

AudioUploadTrackerSchema.index({ user: 1, upc: 1, trackNumber: 1, status: 1 });

export default mongoose.models?.AudioUploadTracker ||
  mongoose.model("AudioUploadTracker", AudioUploadTrackerSchema);
