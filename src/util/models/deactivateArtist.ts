import mongoose, { Schema, Document, Model } from "mongoose";

interface IArtistDeactivation extends Document {
  artistId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  deactivationType: string;
  deactivationReason: string;
  additionalNotes?: string;
  deactivatedBy: mongoose.Schema.Types.ObjectId;
  deactivatedAt?: Date;
  dataRetentionDate?: Date;
  status: string;
  reactivatedAt?: Date;
  reactivatedBy?: string;
  reactivationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const artistDeactivationSchema: Schema = new Schema<IArtistDeactivation>(
  {
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Artist ID is required"],
      maxlength: [100, "Artist ID cannot exceed 100 characters"],
      ref: "Artist",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "User Id is required"],
      maxlength: [100, "User Id cannot exceed 100 characters"],
      ref: "User",
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
    status: {
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
artistDeactivationSchema.index({ artistId: 1 });
artistDeactivationSchema.index({ referenceId: 1 });
artistDeactivationSchema.index({ status: 1 });
artistDeactivationSchema.index({ deactivatedAt: -1 });

// Pre-save middleware for updatedAt
artistDeactivationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const ArtistDeactivation: Model<IArtistDeactivation> =
  mongoose.models.ArtistDeactivation ||
  mongoose.model<IArtistDeactivation>(
    "ArtistDeactivation",
    artistDeactivationSchema,
  );

export default ArtistDeactivation;
