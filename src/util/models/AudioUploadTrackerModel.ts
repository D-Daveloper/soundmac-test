// models/AudioUploadTracker.ts
import mongoose from "mongoose";

const AudioUploadTrackerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
  artistName: { type: String,required:true },
  s3Key: { type: String, required: true },
  upc: { type: String, required: true },

  status: {
    type: String,
    enum: ["PENDING", "ACTIVE", "FAILED"],
    default: "PENDING",
  },

  errorReason: { type: String },
},  {
    timestamps: true, // Adds createdAt and updatedAt fields
  });

export default mongoose.models?.AudioUploadTracker ||
  mongoose.model("AudioUploadTracker", AudioUploadTrackerSchema);
