import mongoose, { Schema, Document, Model } from "mongoose";

// Define Artist interface
export interface IArtist extends Document {
  artistName: string;
  artistImage: string;
  appleId?: string;
  spotifyId?: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}


// Schema definition
const ArtistSchema = new Schema<IArtist>(
  {
    artistName: {
      type: String,
      required: [true, "Provide the artist name!"],
      trim: true,
      minlength: 3,
      maxlength: 32,
      unique: true,
    },
    artistImage: {
      type: String,
      required: [true, "Provide the artist image!"],
      trim: true,
    },
    appleId: {
      type: String,
      default: "",
      trim: true,
    },
    spotifyId: {
      type: String,
      default: "",
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provide a user!"],
    },
  },
  {
    timestamps: true, // ✅ automatically adds createdAt & updatedAt
  }
);
ArtistSchema.index({ user: 1, createdAt: -1 });
ArtistSchema.index({ user: 1, updatedAt: -1 });
ArtistSchema.index({ user: 1, artistName: 1 })  // or { name: "text" } if searching text
// ArtistSchema.index({ artistName: "text" })  // or { name: "text" } if searching text


// Middleware to ensure updatedAt updates correctly on findOneAndUpdate
ArtistSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

// ✅ Fix Next.js hot reload issue by deleting existing model
delete mongoose.models.Artist;

// Model creation
const Artist: Model<IArtist> =
  mongoose.models.Artist || mongoose.model<IArtist>("Artist", ArtistSchema);

export default Artist;
