import mongoose, { Schema, Document, Model } from "mongoose";

// Define Promotion interface
export interface IPromotion extends Document {
  packageName: string;
  category: string;
  musicDescription: string;
  artist: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  startDate: Date;
  endDate: Date;
  isActive:boolean;
  amount:number;
}

// Schema definition
const PromotionSchema = new Schema<IPromotion>(
  {
    packageName: {
      type: String,
      required: [true, "Provide the package name!"],
      trim: true,
      minlength: 3,
      maxlength: 32,
    },
    category: {
      type: String,
      required: [true, "Provide the category!"],
      trim: true,
    },
    musicDescription: {
      type: String,
      required: [true, "Provide the music description!"],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provide a user!"],
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: [true, "Provide an artist!"],
    },
  },
  {
    timestamps: true, // ✅ automatically adds createdAt & updatedAt
  }
);
PromotionSchema.index({ user: 1, createdAt: -1 });//example 1 Optimizes queries that filter by user and sort by createdAt in descending order (newest first). It's ideal for "get the most recent promotions for a specific user."
PromotionSchema.index({ user: 1, updatedAt: -1 });//example 2 Optimizes queries filtering by user and sorting by updatedAt descending (most recently updated first). Great for "get the recently edited promotions for a user."
PromotionSchema.index({ user: 1, artistName: 1 },{unique:true})  // or { name: "text" } if searching text, example 3 Optimizes queries that filter by user and then by artistName (e.g., for searching or listing promotions alphabetically within a user's scope).
// PromotionSchema.index({ artistName: "text" })  // or { name: "text" } if searching text
// PromotionSchema.index({ artistName: 1 },{unique:true})  // or { name: "text" } if searching text, example 3 Optimizes queries that filter by user and then by artistName (e.g., for searching or listing promotions alphabetically within a user's scope).
// PromotionSchema.index({ artistName: "text" })  // or { name: "text" } if searching text


// Middleware to ensure updatedAt updates correctly on findOneAndUpdate
PromotionSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

// ✅ Fix Next.js hot reload issue by deleting existing model

// Model creation
const Promotion: Model<IPromotion> =
  mongoose.models?.Promotion || mongoose.model<IPromotion>("Promotion", PromotionSchema);
export default Promotion;


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