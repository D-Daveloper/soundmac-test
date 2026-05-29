import mongoose, { Schema, Document, Model } from "mongoose";

// Define ApiKey interface
export interface IApiKey extends Document {
  name: string;
  hashedKey: string;
  lastUsedAt: Date;
  isActive: boolean;
  userId: mongoose.Types.ObjectId;
  expiresAt:Date
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const ApiKeySchema = new Schema<IApiKey>(
  {
    name: {
      type: String,
      required: [true, "Provide the name!"],
      trim: true,
    },
    hashedKey: {
      type: String,
      required: [true, "Provide the hashed Key!"],
      trim: true,
      unique:true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Provide a user!"],
        index:true
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
      default: new Date(),
    },
    expiresAt:{
        type: Date,
        required:[true, "Provide api key expiry!"]
    }
  },
  {
    timestamps: true, // ✅ automatically adds createdAt & updatedAt
  },
);
ApiKeySchema.index({ user: 1, lastUsedAt: 1,isActive:1 }, { unique: true });
// Middleware to ensure updatedAt updates correctly on findOneAndUpdate
ApiKeySchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});


// Model creation
const ApiKeyModel: Model<IApiKey> =
  mongoose.models?.ApiKey || mongoose.model<IApiKey>("ApiKey", ApiKeySchema);

export default ApiKeyModel;


