import mongoose from "mongoose";
export interface ISalesReport extends mongoose.Document {
  _id: string
  saleMonth: string,
  reportperiod: string,

  // identifiers
  upc: string,
  onModel: "song" | "album" | null,
  isrc: string,
  productType: string,
  revenueReceivedByDsp: string,
  contentType: string,
  catalogNumber: string,
  label: string,
  sourceCurrency: string,
  year: string,

  // metadata from DSP
  trackTitle: string,
  trackArtistsRaw: string, // keep original for audit

  quantity: string,

  // MONEY (important)
  rawAmountUsd: mongoose.Schema.Types.Decimal128,
  netAmountUsd: mongoose.Schema.Types.Decimal128,

  dsp: string,
  territory: string,

  // Matching
  artist: string,
  user: string,

  // Upload tracking
  reportBatch: { type: mongoose.Schema.Types.ObjectId, ref: "salesReportBatch" },
  uploadDate: Date,

  // status
  matchStatus: string,
}



const salesReportSchema = new mongoose.Schema({
  saleMonth: { type: Date, required: true },
  reportperiod: { type: Date, required: true },

  // identifiers
  upc: {
    type: String, index: true, refPath: 'onModel'
  },
  onModel: {
    type: String,
    required: [
      function (this: any) {
        return this.get("user") !== null;
      },
      "onModel is required when a user is matched",
    ],
    enum: ['song', 'album'] // The actual names of your models
  },
  isrc: { type: String, index: true },
  productType: { type: String },
  revenueReceivedByDsp: { type: String },
  contentType: { type: String },
  catalogNumber: { type: String },
  label: { type: String },
  sourceCurrency: { type: String },
  year: { type: String },

  // metadata from DSP
  trackTitle: String,
  trackArtistsRaw: String, // keep original for audit

  quantity: { type: Number, default: 0 },

  // MONEY (important)
  rawAmountUsd: mongoose.Schema.Types.Decimal128,
  netAmountUsd: mongoose.Schema.Types.Decimal128,

  dsp: String,
  territory: String,

  // Matching
  artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },

  // Upload tracking
  reportBatch: { type: mongoose.Schema.Types.ObjectId, ref: "ReportBatch" },
  uploadDate: Date,

  // status
  matchStatus: {
    type: String,
    enum: ["matched", "unmatched"],
    default: "unmatched",
  },
}, { timestamps: true });

const salesReport =
  mongoose.models?.salesReport || mongoose.model("salesReport", salesReportSchema);

export default salesReport;