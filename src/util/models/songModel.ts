import mongoose, { Schema, Document, Model } from "mongoose";

const featuredArtistSchema = new mongoose.Schema(
  {
    artistName: {
      type: String,
      // required: [true, 'Artist name is required']
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
  { _id: false }
);

const performerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Performer name is required"],
    },
    role: {
      type: String,
      required: [true, "Performer role is required"],
    },
  },
  { _id: false }
);

const songWriterSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "Song writer first name is required"],
    },
    last_name: {
      type: String,
      required: [true, "Song writer last name is required"],
    },
  },
  { _id: false }
);

const producerSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "Producer first name is required"],
    },
    last_name: {
      type: String,
      required: [true, "Producer last name is required"],
    },
  },
  { _id: false }
);

const SongModelSchema = new mongoose.Schema(
  {
    songTitle: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, "Genre is required"],
      trim: true,
    },
    songLanguage: {
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
    release_date: {
      type: Date,
      required: [true, "Release date is required"],
    },
    preOrderDate: {
      type: Date,
      // required: [true, 'Pre-order date is required']
      default: null,
    },
    featured_artist: {
      type: [featuredArtistSchema],
      // required: [true, 'Featured artist is required'],
      // validate: {
      //   validator: function(v: any[]) {
      //     return v && v.length > 0;
      //   },
      //   message: 'At least one featured artist is required'
      // },
      default: [{ artistName: "", spotifyId: "", appleId: "" }],
    },
    performer: {
      type: [performerSchema],
      required: [true, "Performer is required"],
      validate: {
        validator: function (v: any[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one performer is required",
      },
    },
    song_writer: {
      type: [songWriterSchema],
      required: [true, "Song writer is required"],
      validate: {
        validator: function (v: any[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one song writer is required",
      },
    },
    producer: {
      type: [producerSchema],
      required: [true, "Producer is required"],
      validate: {
        validator: function (v: any[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one producer is required",
      },
    },
    pre_order_check: {
      type: Boolean,
      required: [true, "Pre-order check is required"],
      default: false,
    },
    another_distribution_check: {
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
    song_audio: {
      type: String,
      required: [true, "Song audio URL is required"],
      trim: true,
    },
    song_image: {
      type: String,
      required: [true, "Music image URL is required"],
      trim: true,
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
    lyrics: {
      type: String,
      // required: [true, 'Lyrics are required'],
      trim: true,
    },
    start_clip: {
      type: String,
      required: [true, "Start clip is required"],
      trim: true,
    },
    isrc: {
      type: String,
      required: [true, "ISRC is required"],
      trim: true,
      uppercase: true,
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
    explicit_content: {
      type: Boolean,
      required: [true, "Explicit content flag is required"],
      default: false,
    },
    songStatus:{
      type:String,
      enum:["pending","approved","rejected"],
      default:"pending"
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Indexes for better query performance
SongModelSchema.index({ artistName: 1, release_date: -1 });
// SongModelSchema.index({ genre: 1 });
SongModelSchema.index({ isrc: 1 }, { unique: true });
SongModelSchema.index({ upc: 1 }, { unique: true });
delete mongoose.models.Song;

const SongModel =
  mongoose.models.Song || mongoose.model("Song", SongModelSchema);

export default SongModel;

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
