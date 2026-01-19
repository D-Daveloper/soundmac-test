import mongoose, { Schema, Document, Model } from "mongoose";

const AlbumSchema = new mongoose.Schema(
  {
    releaseTitle: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, "Genre is required"],
      trim: true,
    },
    releaseLanguage: {
      type: String,
      required: [true, "Language is required"],
      trim: true,
    },
    releaseImage: {
      type: String,
      required: [true, "Language is required"],
      trim: true,
    },
    artistName: {
      type: String,
      required: [true, "Artist is required"],
      trim: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: [true, "Provide an Artist!"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provide a user!"],
    },
    releaseDate: {
      type: Date,
      required: [true, "Release date is required"],
    },
    preOrderDate: {
      type: Date,
      // required: [true, 'Pre-order date is required']
      default: null,
    },
    preOrderCheck: {
      type: Boolean,
      required: [true, "Pre-order check is required"],
      default: false,
    },
    anotherDistributionCheck: {
      type: Boolean,
      required: [true, "Another distribution check is required"],
      default: false,
    },
    territories: {
      type: [String],
      required: [true, "Territories are required"],
      validate: {
        validator: function (v: any[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one territory is required",
      },
    },
    dsp: {
      type: [String],
      required: [true, "DSP (Digital Service Providers) are required"],
      validate: {
        validator: function (v: any[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one DSP is required",
      },
    },
    upc: {
      type: String,
      required: [true, "UPC is required"],
      trim: true,
    },
    copyRightHolder: {
      type: String,
      required: [true, "Copyright holder is required"],
      trim: true,
    },
    copyRightYear: {
      type: String,
      required: [true, "Copyright year is required"],
      trim: true,
    },
    numberOfTracks: {
      type: String,
      required: [true, "Add the number of tracks"],
    },
    unassignedNumbers: {
      type: [String],
      required: [true, "Add the array of unassigned numbers"],
    },
    releaseStatus:{
      type:String,
      enum:["pending","approved","rejected"],
      default:"pending"
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
delete mongoose.models.Album;

const AlbumModel =
  mongoose.models.Album || mongoose.model("Album", AlbumSchema);

export default AlbumModel;
