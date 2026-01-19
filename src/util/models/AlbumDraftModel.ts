import mongoose, { Schema, Document, Model } from "mongoose";

const AlbumSchema = new mongoose.Schema(
  {
    albumTitle: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    genre: {
      type: String,
      
      trim: true,
    },
    songLanguage: {
      type: String,
      
      trim: true,
    },
    artistName: {
      type: String,
      
      trim: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provide a user!"],
    },
    release_date: {
      type: Date,
      
    },
    preOrderDate: {
      type: Date,
      // 
      default: null,
    },
    pre_order_check: {
      type: Boolean,
      
      default: false,
    },
    another_distribution_check: {
      type: Boolean,
      
      default: false,
    },
    territories: {
      type: [String],
      
      validate: {
        validator: function (v: any[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one territory is required",
      },
    },
    dsp: {
      type: [String],
      
      validate: {
        validator: function (v: any[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one DSP is required",
      },
    },
    upc: {
      type: String,
      
      trim: true,
    },
    copyRightHolder: {
      type: String,
      
      trim: true,
    },
    copyRightYear: {
      type: String,
      
      trim: true,
    },
    NumberOfTracks: {
      type: String,
      
    },
    UnassignedNumbers: {
      type: [String],
      
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Indexes for better query performance
AlbumSchema.index({ artistName: 1, release_date: -1 });
// AlbumSchema.index({ genre: 1 });
// AlbumSchema.index({ isrc: 1 }, { unique: true });
AlbumSchema.index({ upc: 1 }, { unique: true });
delete mongoose.models.AlbumDraft;

const AlbumDraftModel =
  mongoose.models.AlbumDraft || mongoose.model("AlbumDraft", AlbumSchema);

export default AlbumDraftModel;
