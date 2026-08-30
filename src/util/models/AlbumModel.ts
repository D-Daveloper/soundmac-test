import mongoose, { ObjectId } from "mongoose";
import DpmMetaData from "./DpmCallBackModel";
import { albumFromApi, CheckboxOption, TrackFromApi } from "@/app/type";
import TrackModel from "./trackModel";

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
      type: [{ label: String, value: String }],
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "DSP (Digital Service Providers) are required",
      ],
      validate: {
        validator: function (this: any, v: CheckboxOption[]) {
          if (this.get("releaseStatus") === "draft") {
            return true; // Skip validation for draft songs
          }
          return Array.isArray(v) && v.length > 0 && v.every((d) => typeof d.label === "string" && typeof d.value === "string");
        },
        message: "At least one DSP is required",
      },
      _id: false
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
      enum: ["pending", "completed", "approved", "rejected", "draft", "deleted"],
      default: "pending",
    },
    catalogNumber: {
      type: String,
      required: [function (this: any) {
        return this.get("releaseStatus") !== "draft";
      }, "catalog number is required"],
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
    approvedAt: { type: Date, default: null },
     platformDelivery: [
      {
        platform: { type: String, enum: ["spotify", "apple_music"] },
        status: { type: String, enum: ["pending", "live"], default: "pending" },
        lastCheckedAt: Date,
      }
    ]
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
AlbumSchema.index({ user: 1, artistName: 1, releaseTitle: 1 }, { unique: true });
AlbumSchema.index({ catalogNumber: 1 }, { unique: true, sparse: true });
AlbumSchema.index({ upc: 1 }, { unique: true, sparse: true });

AlbumSchema.statics.approveAndCreateMetadata = async function (songId: ObjectId, label: string) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // 1. Update the song status
    const song: albumFromApi = await this.findByIdAndUpdate(
      songId,
      { releaseStatus: 'approved' , approvedAt:new Date()},
      { session, new: true } // Crucial: pass the session here
    );

    if (!song) {
      throw new Error('Album not found');
    }

    const tracks = await TrackModel.find<TrackFromApi>({ upc: song.upc });

    if (tracks.length < 2) {
      throw new Error('Tracks not found or less than 2.');
    } else if (tracks.some(item => item.releaseStatus != "completed")) {
      throw new Error("Only completed Tracks can be distributed.")
    }
    
    await TrackModel.updateMany(
      { upc: song.upc },
      { $set: { releaseStatus: 'approved' } }, { session }
    );
    console.log("approve album", song);

    // 2. Create the metadata object in the other collection
    const metadata = await DpmMetaData.create(
      [{
        label: label,
        "release-type": "Album",
        upc: song.upc,
        "catalog-number": song.catalogNumber,
        "album-release-id": song.catalogNumber,
        "album-main-artist": song.artistName,
        "album-title": song.releaseTitle,
        "track-title": "",
        genre: song.genre,
        "release-date": song.releaseDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
        "release-date-time": "00:00:00",
        "release-date-timezone": song.timeZone.value,
        "c-line": `© ${song.copyRightYear} ${song.copyRightHolder}`,
        "disc-number": 1,
        "track-number": 1,
        "language-of-performance": song.releaseLanguage,
        "isrc-code": "",
        "track-release-id": "",
        "p-line": `℗ ${song.copyRightYear} ${song.copyRightHolder}`,
        composer: "",
        lyricist: "",
        "effective-date": song.releaseDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
        "parental-advisory": "",
        "track-length": "",
        "album-featured-artist": "",
        "track-featured-artist": "",
        "music-producer": "",
      },
      ...tracks.map((item, index) => (
        {
          label: label,
          "release-type": "Album",
          upc: song.upc,
          "catalog-number": item.catalogNumber,
          "album-release-id": song.catalogNumber,
          "album-main-artist": song.artistName,
          "album-title": song.releaseTitle,
          "track-title": item.releaseTitle,
          genre: item.genre,
          "release-date": song.releaseDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
          "release-date-time": "00:00:00",
          "release-date-timezone": song.timeZone.value,
          "c-line": `© ${song.copyRightYear} ${song.copyRightHolder}`,
          "disc-number": item.trackNumber,
          "track-number": item.trackNumber,
          "language-of-performance": item.releaseLanguage,
          "isrc-code": item.isrc,
          "track-release-id": item.catalogNumber,
          "p-line": `℗ ${song.copyRightYear} ${song.copyRightHolder}`,
          composer: item.songWriter.length > 0 ? item.songWriter.map((writer) => writer.first_name + " " + writer.last_name).join("|") : "",
          lyricist: item.songWriter.length > 0 ? item.songWriter.map((writer) => writer.first_name + " " + writer.last_name).join("|") : "",
          "effective-date": song.releaseDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
          "parental-advisory": item.explicitContent ? "Explicit" : "Not Explicit",
          "track-length": "",
          "album-featured-artist": item.featuredArtist.length > 0 ? item.featuredArtist.map((artist) => artist.artistName).join("|") : "",
          "track-featured-artist": item.featuredArtist.length > 0 ? item.featuredArtist.map((artist) => artist.artistName).join("|") : "",
          "music-producer": item.producer.length > 0 ? item.producer.map((producer) => producer.name).join("|") : "",
        }
      ))],
      { session: session, ordered: true } // Note: .create() expects an array when using sessions
    );

    // return { song, metadata: metadata[0] };
    await session.commitTransaction();
    return { error: false, msg: "Release Approved" }
  } catch (error:any) {
    console.error("failed to approve album ", error);
    // ✅ Only abort if a transaction is actually open
    if (session.inTransaction()) {
      console.log("in transmission");
      
      await session.abortTransaction();
    }
    return { error: true, msg: error?.message || "Failed to approve Album" }
  } finally {
    await session.endSession();
  }
};

const AlbumModel =
  mongoose.models?.Album || mongoose.model("Album", AlbumSchema);

export default AlbumModel;
