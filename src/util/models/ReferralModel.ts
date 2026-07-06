import mongoose, { Model } from "mongoose";

export interface IReferral extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  referrer: mongoose.Types.ObjectId;
  referred: mongoose.Types.ObjectId;
  referralCode: string;
  status: 'pending' | "completed" | "expired";
  conversionType: "signup" | "subscription" | null;
  planName: string | null;
  commissionAmount: number;
  commissionPaid: boolean;
  completedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
      index: true
    },

    referred: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    referralCode: {
      type: String,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum:["pending", "completed", "expired"],
      default: "pending",

    },

    conversionType: {
      type: String,
      enum: ['signup', 'subscription', null],
      default: null,
    },

    planName: {
      type: String,
      default: null,
    },

    commissionAmount: {
      type:Number,
      default: 0,
    },

    commissionPaid: {
      type: Boolean,
      default: false
    },

    completedAt: {
      type: Date,
      default: null,

    },

    expiresAt: {
      type: Date,
      default: null,

    },
    


  },
  {timestamps: true},

);

ReferralSchema.index(
  { referrer: 1, referred: 1 },
  { unique: true }
);


const Referral: Model<IReferral> =
  mongoose.models?.Referral ||
  mongoose.model<IReferral>("Referral", ReferralSchema);

export default Referral;