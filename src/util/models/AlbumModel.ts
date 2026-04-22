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
    releaseImage: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Image is required",
      ],
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
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Release date is required",
      ],
    },
    preOrderDate: {
      type: Date,
      required: [
        function (this: any) {
          return this.get("preOrderCheck") === true;
        },
        "Pre-order date is required",
      ],
    },
    preOrderCheck: {
      type: Boolean,
      required: [true, "Pre-order check is required"],
    },
    anotherDistributionCheck: {
      type: Boolean,
      required: [true, "Another distribution check is required"],
    },
    territories: {
      type: [String],
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Territories are required",
      ],
      validate: {
        validator: function (this: any, v: any[]) {
          if (this.get("releaseStatus") === "draft") {
            return true; // Skip validation for draft songs
          }
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one territory is required",
      },
    },
    dsp: {
      type: [{ label: String, value: Number }],
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "DSP (Digital Service Providers) are required",
      ],
      validate: {
        validator: function (this: any, v: { label: string; value: number }[]) {
          if (this.get("releaseStatus") === "draft") {
            return true; // Skip validation for draft songs
          }
          return Array.isArray(v) && v.length > 0 && v.every((d) => typeof d.label === "string" && typeof d.value === "number");
        },
        message: "At least one DSP is required",
      },
      _id:false
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
    copyRightHolder: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Copyright holder is required",
      ],
      trim: true,
    },
    copyRightYear: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Copyright year is required",
      ],
      trim: true,
    },
    numberOfTracks: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Add the number of tracks",
      ],
    },
    unassignedNumbers: {
      type: [String],
      required: [true, "Add the array of unassigned numbers"],
    },
    releaseStatus: {
      type: String,
      enum: ["pending","completed", "approved", "rejected", "draft"],
      default: "pending",
    },
    catalogNumber: {
      type: String,
      required: [true, "catalog number is required"],
      unique:true
    },    
    timeZone: {
      type: {
        label: String,
        value: String,
        name: String,
      },
      required: [function (this: any) {
        return this.get("releaseStatus") !== "draft";
      }, "Time Zone is required"],
      validate: {
        validator: (v: any) => typeof v === "object" && v !== null && "value" in v && typeof v.value === "string",
        message: "Time Zone must be an object",
      }
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
);

// Admin endpoint
AlbumSchema.index({ createdAt: -1 });                              // no filters
AlbumSchema.index({ releaseStatus: 1, createdAt: -1 });            // status only
AlbumSchema.index({ artistName: 1, releaseStatus: 1, createdAt: -1 }); // combined
AlbumSchema.index(
  { releaseTitle: 1, createdAt: -1 },
  { collation: { locale: "en", strength: 2 } }
);

// User-scoped queries (keep if used elsewhere in your app)
AlbumSchema.index({ user: 1, createdAt: -1 });
AlbumSchema.index(
  { user: 1, releaseTitle: 1, createdAt: -1 },
  { collation: { locale: "en", strength: 2 } }
);
AlbumSchema.index({ user: 1, artistName: 1 });
AlbumSchema.index({ upc: 1 }, { unique: true, sparse: true });
AlbumSchema.index(
  { artistName: 1, releaseTitle: 1 },
  { unique: true }
);

const AlbumModel =
  mongoose.models?.Album || mongoose.model("Album", AlbumSchema);

export default AlbumModel;
