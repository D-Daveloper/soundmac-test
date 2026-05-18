import mongoose from "mongoose";

const ReportBatchSchema = new mongoose.Schema({
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fileName: { type: String, unique: [true, "File name already exists."] },
  fileSource: { type: String, required: [true, " Please provide the source of the sales report"] },
  totalRows: Number,
  processedRows: Number,
  unProcessedRows: Number,

  totalAmountUsd: mongoose.Schema.Types.Decimal128,

  status: {
    type: String,
    enum: ["processing", "completed", "failed"],
  },

  uploadDate: Date,
}, { timestamps: true });


const salesReportBatch =
  mongoose.models?.salesReportBatch || mongoose.model("salesReportBatch", ReportBatchSchema);

export default salesReportBatch;