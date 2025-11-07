import mongoose, { Schema, Document, Model } from "mongoose";

const SongSchema = new mongoose.Schema(
  {
    songTitle: { type: String, required: true, trim: true },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who uploaded
    durationSec: { type: Number, required: [true, "Provide song duration."] },
    releaseDate: { type: Date, required: [true, "Provide release date."] }, // optional
    platforms: [
      { type: String, required: [true, "Provide distribution platforms"] },
    ], // e.g. ['spotify','apple','youtube']
    producerBy: [
      { type: String, required: [true, "Provide at least one producer"] },
    ],
    performedBy: [
      { type: String, required: [true, "Provide at least one performer"] },
    ],
    image: String,
    audio: String,
    isrc: String,
    upc: { type: String, index: true, unique:true, required:[true, "Provide a upc"] },
    status: { type: String, default: "draft" }, // draft, published, archived
    // denormalized snapshot for fast read:
    artistName: String,
    copyRightHolder: String,
    copyRightYear: String,
    language:{type:String,required: [true,"Provide language"]},
    genre:{type:String,required: [true,"Provide genre"]},
    explicit:{type:String,required:[true,"Explicit is required"]},  
    featuredArtist:[String],
    otherArtist:String,
    writtenBy:{type:String,required:[true,"Provide who wrote the song"]},
    lyrics:{type:String,required:[true,"Provide lyrics"]},
    pitchEditorialPlaylist:{type:String,required:[true,"Select whether or not to pitch to editorial playist"]},
    selectedPlatforms:[{type:String,required:[true,"Provide platforms to publish"]}],
    selectTimeZone:{type:String,required:[true,"Provide timeZone"]},
    hasOnlineBeats:{type:String,required:[true,"Provide whether or not the song has an online beat"]},
    previouslyReleased:{type:String,required:[true,"Provide whether or not the song has been released"]},
    billboardPayment:{type:Boolean,required:[true,"Select whether or not to pay for bill board"]},
    catalogNumber:{type:String,required:[true,"Provide catalog number"]},
  },
  { timestamps: true }
);

// Indexes
SongSchema.index({ artist: 1, releaseDate: -1 }); // list songs by artist newest first
SongSchema.index({ user: 1, createdAt: -1 }); // user uploads list
SongSchema.index({ songTitle: "text", artistName: "text",upc:"text" }); // search songs by title/artist
// SongSchema.index({upc:"text"});
// SongSchema.index({ isrc: 1 }, { unique: false, sparse: true });//what sparse does here is, it helps when the field is an optional field, meaning it skips docs that dont have that field you want to index, this helps to save disk space and other things
