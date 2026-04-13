import mongoose from "mongoose";

const LedgerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },

  type: {
    type: String,
    enum: ["sale", "withdrawal", "adjustment"],
    required: true,
  },

  amountUsd: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
  },

  direction: {
    type: String,
    enum: ["credit", "debit"], // credit = money in, debit = money out
  },

  reference: {
    type: mongoose.Schema.Types.ObjectId,
    // can point to Sales or Withdrawal
    ref: "salesReport"
  },

  description: String,

}, { timestamps: true });


const salesReportLedger =
  mongoose.models?.salesReportLedger || mongoose.model("salesReportLedger", LedgerSchema);

export default salesReportLedger;