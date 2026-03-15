import mongoose from "mongoose";

export const featuredArtistSchema = new mongoose.Schema(
  {
    artistName: {
      type: String,
      // required: [true, "Artist name is required"],
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "artistName must be a string",
      },
    },
    spotifyId: {
      type: String,
      // // required: [true, 'Spotify ID is required']
    },
    appleId: {
      type: String,
      // // required: [true, 'Apple ID is required']
    },
  },
  { _id: false, strict: "throw" },
);

export const performerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Performer name is required"],
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "Performer name must be a string",
      },
    },
    role: {
      type: String,
      required: [true, "Performer role is required"],
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "Performer role must be a string",
      },
    },
  },
  { _id: false, strict: "throw" },
);

export const songWriterSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "Song writer first name is required"],
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "Song writer first name must be a string",
      },
    },
    last_name: {
      type: String,
      required: [true, "Song writer last name is required"],
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "Song writer last name must be a string",
      },
    },
  },
  { _id: false, strict: "throw" },
);

export const producerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Producer name is required"],
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "Producer name must be a string",
      },
    },
    // first_name: {
    //   type: String,
    //   required: [true, "Producer first name is required"],
    // },
    // last_name: {
    //   type: String,
    //   required: [true, "Producer last name is required"],
    // },
  },
  { _id: false, strict: "throw" },
);

const SongModelSchema = new mongoose.Schema(
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
      default: null,
    },
    featuredArtist: {
      type: [featuredArtistSchema],
      // required: [true, 'Featured artist is required'],
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
    preOrderCheck: {
      type: Boolean,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Pre-order check is required",
      ],
      // default: false,
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
    releaseImage: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Music image URL is required",
      ],
      trim: true,
    },
    dsp: {
      type: [String],
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "DSP (Digital Service Providers) are required",
      ],
      validate: {
        validator: function (this: any, v: any[]) {
          if (this.get("releaseStatus") === "draft") {
            return true; // Skip validation for draft songs
          }
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one DSP is required",
      },
    },
    lyrics: {
      type: String,
      // required: [true, 'Lyrics are required'],
      trim: true,
    },
    startClip: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Start clip is required",
      ],
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
      enum: ["pending", "approved", "rejected", "draft"],
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

// Uniqueness constraints
SongModelSchema.index({ artistName: 1, releaseTitle: 1 }, { unique: true });
SongModelSchema.index({ isrc: 1 }, { unique: true, sparse: true });
SongModelSchema.index({ upc: 1 }, { unique: true, sparse: true });

// Admin endpoint
SongModelSchema.index({ createdAt: -1 }); // no filters
SongModelSchema.index(
  {
    createdAt: -1,
    releaseTitle: 1,
    artistName: 1,
    catalogNumber: 1,
    upc: 1,
    releaseDate: 1,
    releaseStatus: 1,
    releaseImage: 1,
    _id: 1,
  },
  { collation: { locale: "en", strength: 2 } },
); // no filters
SongModelSchema.index({ releaseStatus: 1, createdAt: -1 }); // status only
SongModelSchema.index({ artistName: 1, releaseStatus: 1, createdAt: -1 }); // combined
SongModelSchema.index(
  { releaseTitle: 1, createdAt: -1 },
  { collation: { locale: "en", strength: 2 } },
); // title search

// User-scoped queries (keep if used elsewhere in your app)
SongModelSchema.index({ user: 1, createdAt: -1 });
SongModelSchema.index({ user: 1, artistName: 1 });
SongModelSchema.index(
  { user: 1, releaseTitle: 1, createdAt: -1 },
  { collation: { locale: "en", strength: 2 } },
);
// delete mongoose.models.Song;

const SongModel =
  mongoose.models?.Song || mongoose.model("Song", SongModelSchema);

export default SongModel;
// Pre-validation hook to enforce required fields based on releaseStatus
SongModelSchema.pre("validate", function (next) {
  if (this.releaseStatus !== "draft") {
    const requiredFields = [
      "releaseTitle",
      "releaseAudio",
      "releaseImage",
      "isrc",
      "upc",
    ];

    for (const field of requiredFields) {
      if (!(this as any)[field]) {
        this.invalidate(field, `${field} is required before publishing`);
      }
    }
  }
  next();
});

// const SongSchema = new mongoose.Schema(
//   {
//     songTitle: { type: String, required: true, trim: true },
//     artist: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Artist",
//       required: true,
//     },
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who uploaded
//     durationSec: { type: Number, required: [true, "Provide song duration."] },
//     releaseDate: { type: Date, required: [true, "Provide release date."] },
//     DSPs: [
//       { type: Array, required: [true, "Provide distribution platforms"] },
//     ], // e.g. ['spotify','apple','youtube']
//     producerBy: [
//       { type: [String], required: [true, "Provide at least one producer"] },
//     ],
//     performedBy: [
//       { type: [String], required: [true, "Provide at least one performer"] },
//     ],
//     image: { type: String, required: [true, "Provide Image"] },
//     // audio: String,
//     isrc: { type: String, index: true, unique:true, required:[true, "Provide a isrc"] },
//     upc: { type: String, index: true, unique:true, required:[true, "Provide a upc"] },
//     status: { type: String, default: "draft" }, // draft, published, archived
//     // denormalized snapshot for fast read:
//     artistName: { type: String, index: true, unique:true, required:[true, "Provide a artist name"] },
//     copyRightHolder: String,
//     copyRightYear: String,
//     language:{type:String,required: [true,"Provide language"]},
//     genre:{type:String,required: [true,"Provide genre"]},
//     explicit:{type:String,required:[true,"Explicit is required"]},
//     featuredArtist:[String],
//     otherArtist:String,
//     writtenBy:{type:String,required:[true,"Provide who wrote the song"]},
//     lyrics:{type:String,required:[true,"Provide lyrics"]},
//     pitchEditorialPlaylist:{type:String,required:[true,"Select whether or not to pitch to editorial playist"]},
//     selectedPlatforms:[{type:String,required:[true,"Provide platforms to publish"]}],
//     selectTimeZone:{type:String,required:[true,"Provide timeZone"]},
//     hasOnlineBeats:{type:String,required:[true,"Provide whether or not the song has an online beat"]},
//     previouslyReleased:{type:String,required:[true,"Provide whether or not the song has been released"]},
//     billboardPayment:{type:Boolean,required:[true,"Select whether or not to pay for bill board"]},
//     catalogNumber:{type:String,required:[true,"Provide catalog number"]},
//     s3KeyAudio:{type:String,required:[true,"Provide s3 audio key"]},
//   },
//   { timestamps: true }
// );

// // Indexes
// SongSchema.index({ artist: 1, releaseDate: -1 }); // list songs by artist newest first
// SongSchema.index({ user: 1, createdAt: -1 }); // user uploads list
// SongSchema.index({ songTitle: "text", artistName: "text",upc:"text" }); // search songs by title/artist
// SongSchema.index({upc:"text"});
// SongSchema.index({ isrc: 1 }, { unique: false, sparse: true });//what sparse does here is, it helps when the field is an optional field, meaning it skips docs that dont have that field you want to index, this helps to save disk space and other things
// ✅ Fix Next.js hot reload issue by deleting existing model

// // Model creation
// const SongModel: Model<Document> =
//   mongoose.models.SongModel || mongoose.model<Document>("SongModel", SongSchema);

// // Model creation
// export default SongModel;
