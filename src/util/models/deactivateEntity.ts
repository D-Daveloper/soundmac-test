import mongoose, { Schema, Document, Model } from "mongoose";

interface IEntityDeactivation extends Document {
  entityType: "user" | "artist",
  entityId: mongoose.Schema.Types.ObjectId;
  deactivationType: string;
  deactivationReason: string;
  additionalNotes?: string;
  deactivatedBy: mongoose.Schema.Types.ObjectId;
  deactivatedAt?: Date;
  dataRetentionDate?: Date;
  entityStatus: string;
  reactivatedAt?: Date;
  reactivatedBy?: string;
  reactivationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const entityDeactivationSchema: Schema = new Schema<IEntityDeactivation>(
  {
    entityType: {
      type: String,
      enum: {
        values: ["user", "artist"],
        message: "{VALUE} is not a valid entry",
      },
      required: [true, "add the entity type is required"],
      maxlength: [50, "the entity type cannot exceed 50 characters"],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "add the entity Id is required"],
      maxlength: [100, "add the entity Id cannot exceed 100 characters"],
    },
    deactivationType: {
      type: String,
      required: [true, "Deactivation type is required"],
      maxlength: [100, "Deactivation type cannot exceed 100 characters"],
    },
    deactivationReason: {
      type: String,
      required: [true, "Deactivation reason is required"],
      maxlength: [255, "Deactivation reason cannot exceed 255 characters"],
    },
    additionalNotes: {
      type: String,
      maxlength: [1000, "Additional notes cannot exceed 1000 characters"],
    },
    deactivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Deactivated by is required"],
      maxlength: [100, "Deactivated by cannot exceed 100 characters"],
    },
    deactivatedAt: {
      type: Date,
      default: Date.now,
    },
    dataRetentionDate: {
      type: Date,
    },
    entityStatus: {
      type: String,
      default: "deactivated",
      enum: ["deactivated", "reactivated", "pending"],
    },
    reactivatedAt: {
      type: Date,
    },
    reactivatedBy: {
      type: String,
      maxlength: [100, "Reactivated by cannot exceed 100 characters"],
    },
    reactivationNotes: {
      type: String,
      maxlength: [1000, "Reactivation notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true, // Automatically handles createdAt and updatedAt
  },
);

// Indexes for performance
entityDeactivationSchema.index({ entityId: 1 });
entityDeactivationSchema.index({ entityStatus: 1 });
entityDeactivationSchema.index({ deactivatedAt: -1 });

// Pre-save middleware for updatedAt
entityDeactivationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const EntityDeactivation: Model<IEntityDeactivation> =
  mongoose.models.EntityDeactivation ||
  mongoose.model<IEntityDeactivation>(
    "EntityDeactivation",
    entityDeactivationSchema,
  );

export default EntityDeactivation;
