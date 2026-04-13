// models/Report.ts
import mongoose from "mongoose";

const salesReportDownloadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  
  // 🔑 unique identity of report
  reportKey: { type: String, required: true, index: true },

  filters: Object,

  status: {
    type: String,
    enum: ["pending", "processing", "ready", "failed"],
    default: "pending",
  },

  fileKey: String, // S3 key
  fileUrl: String,

  expiresAt: Date, // for regeneration logic

}, { timestamps: true });

const salesReportDownload = mongoose.models.salesReportUserDownload || mongoose.model("salesReportUserDownload", salesReportDownloadSchema);

export default salesReportDownload