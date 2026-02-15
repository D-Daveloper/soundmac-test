import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  reference: { type: String, unique: true },
  userEmail: String,
  amount: Number,
  status: String,
  planName: String,
  planCode: String,
  paidAt: Date
});

export default mongoose.models?.TransactionModel ||
  mongoose.model("TransactionModel", TransactionSchema);
