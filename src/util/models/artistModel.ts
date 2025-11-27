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
      unique: [true, "Artist name already exists"],
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
ArtistSchema.index({ user: 1, createdAt: -1 });//example 1 Optimizes queries that filter by user and sort by createdAt in descending order (newest first). It's ideal for "get the most recent artists for a specific user."
ArtistSchema.index({ user: 1, updatedAt: -1 });//example 2 Optimizes queries filtering by user and sorting by updatedAt descending (most recently updated first). Great for "get the recently edited artists for a user."
ArtistSchema.index({ user: 1, artistName: 1 },{unique:true})  // or { name: "text" } if searching text, example 3 Optimizes queries that filter by user and then by artistName (e.g., for searching or listing artists alphabetically within a user's scope).
// ArtistSchema.index({ artistName: "text" })  // or { name: "text" } if searching text
// ArtistSchema.index({ artistName: 1 },{unique:true})  // or { name: "text" } if searching text, example 3 Optimizes queries that filter by user and then by artistName (e.g., for searching or listing artists alphabetically within a user's scope).
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


//example 1
// Find the 10 most recently created artists for a specific user
// Artist.find({ user: someUserId })
//   .sort({ createdAt: -1 })  // Descending (newest first)
//   .limit(10);

//example 2
// Find artists for a user, sorted by most recent updates
// Artist.find({ user: someUserId })
//   .sort({ updatedAt: -1 })  // Descending (most recent first)
//   .limit(5);

//example 3
// Find artists for a user whose name starts with "A", sorted alphabetically
// Artist.find({ user: someUserId, artistName: { $regex: /^A/ } })
//   .sort({ artistName: 1 });  // Ascending (A-Z)