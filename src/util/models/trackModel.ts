import mongoose from "mongoose";
import {
  featuredArtistSchema,
  performerSchema,
  producerSchema,
  songWriterSchema,
} from "./songModel";

const TrackSchema = new mongoose.Schema(
  {
    releaseTitle: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    genre: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Genre is required",
      ],
      trim: true,
    },
    releaseLanguage: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Language is required",
      ],
      trim: true,
    },
    albumName: {
      type: String,
      required: [true, "Album Name is required"],
      trim: true,
    },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Album ID is required"],
      trim: true,
      ref: "Album",
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
    featuredArtist: {
      type: [featuredArtistSchema],
      validate: {
        validator: function (this: any, v: any[]) {
          if (this.get("releaseStatus") === "draft") {
            return true; // Skip validation for draft songs
          }
          return Array.isArray(v);
        },
        message: "At least one featured artist is required",
      },
      default: undefined,
    },
    performer: {
      type: [performerSchema],
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Performer is required",
      ],
      validate: {
        validator: function (this: any, v: any[]) {
          if (this.get("releaseStatus") === "draft") {
            return true; // Skip validation for draft songs
          }
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one performer is required",
      },
    },
    songWriter: {
      type: [songWriterSchema],
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Song writer is required",
      ],
      validate: {
        validator: function (this: any, v: any[]) {
          if (this.get("releaseStatus") === "draft") {
            return true; // Skip validation for draft songs
          }
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one song writer is required",
      },
    },
    producer: {
      type: [producerSchema],
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Producer is required",
      ],
      validate: {
        validator: function (this: any, v: any[]) {
          if (this.get("releaseStatus") === "draft") {
            return true; // Skip validation for draft songs
          }
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one producer is required",
      },
    },
    anotherDistributionCheck: {
      type: Boolean,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Another distribution check is required",
      ],
      // default: false,
    },
    releaseAudio: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Song audio URL is required",
      ],
      trim: true,
    },
    lyrics: {
      type: String,
      // required: [true, 'Lyrics are required'],
      trim: true,
    },
    startClip: {
      type: String,
      trim: true,
    },
    isrc: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "ISRC is required",
      ],
      trim: true,
      uppercase: true,
      // unique:true
    },
    upc: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "UPC is required",
      ],
      trim: true,
    },
    trackNumber: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Track number is required",
      ],
      trim: true,
    },
    explicitContent: {
      type: Boolean,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Explicit content flag is required",
      ],
    },
    releaseStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "draft", "deleted"],
      default: "pending",
    },
    catalogNumber: {
      type: String,
      required: [true, "catalog number is required"],
      unique: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
);

// Indexes for better query performance
TrackSchema.index({ artistName: 1, releaseDate: -1 });
TrackSchema.index({ releaseTitle: 1, user: 1 });
TrackSchema.index({ upc: 1, user: 1 });
// enforce uniqueness
TrackSchema.index({ upc: 1, releaseTitle: 1 }, { unique: true });
// TrackSchema.index({ genre: 1 });
TrackSchema.index({ isrc: 1 }, { unique: true, sparse: true });


const TrackModel =
  mongoose.models?.Track || mongoose.model("Track", TrackSchema);

export default TrackModel;
// Pre-validation hook to enforce required fields based on releaseStatus
TrackSchema.pre("validate", function (next) {
  if (this.releaseStatus !== "draft") {
    const requiredFields = ["releaseTitle", "releaseAudio", "isrc", "upc"];

    for (const field of requiredFields) {
      if (!(this as any)[field]) {
        this.invalidate(field, `${field} is required before publishing`);
      }
    }
  }
  next();
});
