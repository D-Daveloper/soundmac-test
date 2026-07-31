import mongoose from "mongoose";

const AdminActivityLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Admin is required"],
    },
    adminName: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true,
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
    },
    entityType: {
      type: String,
      required: [true, "Entity type is required"],
      trim: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Entity ID is required"],
    },
    entityLabel: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for filtering/search
AdminActivityLogSchema.index({ admin: 1, createdAt: -1 });
AdminActivityLogSchema.index({ action: 1, createdAt: -1 });
AdminActivityLogSchema.index({ entityType: 1, createdAt: -1 });
AdminActivityLogSchema.index({ createdAt: -1 });

// --- Immutability guard: block updates and deletes at the schema level ---
const blockMutation = function (this: any, next: any) {
  next(new Error("Admin activity log entries are immutable and cannot be modified or deleted."));
};

AdminActivityLogSchema.pre("findOneAndUpdate", blockMutation);
AdminActivityLogSchema.pre("updateOne", blockMutation);
AdminActivityLogSchema.pre("updateMany", blockMutation);
AdminActivityLogSchema.pre("findOneAndDelete", blockMutation);
AdminActivityLogSchema.pre("deleteOne", blockMutation);
AdminActivityLogSchema.pre("deleteMany", blockMutation);

const AdminActivityLogModel =
  mongoose.models?.AdminActivityLog || mongoose.model("AdminActivityLog", AdminActivityLogSchema);

export default AdminActivityLogModel;