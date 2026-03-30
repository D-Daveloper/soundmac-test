import mongoose from "mongoose";

export const WithDrawalSchema = new mongoose.Schema(
  {
    amount: { type: String, required: [true, "Please Provide an amount"] },
    withdrawalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provide a user!"],
    },
    accountNumber: {
      type: String,
      required: [true, "Provide an account number"],
    },
    paidAt: {
      type: Date,
      required: [
        function (this: any) {
          return this.get("withdrawalStatus") === "approved";
        },
        "Provide a date the amount was paid",
      ],
      default: null,
    },
  },
  { timestamps: true },
);
WithDrawalSchema.index({
  user: 1,
  createdAt: -1,
});

export default mongoose.models?.withDrawalModel ||
  mongoose.model("withDrawalModel", WithDrawalSchema);
