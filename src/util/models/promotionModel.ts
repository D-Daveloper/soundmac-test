import {
  genderList,
  priorityList,
  promotionCategory,
  timeList,
  typeOfRelease,
} from "@/app/constant";
import mongoose, { Schema, Document, Model } from "mongoose";
import { featuredArtistSchema } from "./songModel";
import { Artist } from "@/app/type";
import { IUser } from "./userModel";

const pitchPlaylistDetails = new mongoose.Schema(
  {
    label: { type: String, required: [true, "label is required"], trim: true },
    upc: { type: String, required: [true, "UPC is required"], trim: true },
    featuredArtist: {
      type: [featuredArtistSchema],
      required: [false, "featuring artists is optional"],
      trim: true,
    },
    artistGender: {
      type: String,
      required: [false, "artist gender is optional"],
      trim: true,
      enum: [...genderList, ""],
    },
    trackLanguage: {
      type: String,
      required: [false, "track language is optional"],
      trim: true,
    },
    country: {
      type: String,
      required: [false, "country is optional"],
      trim: true,
      default: "",
    },
    location: {
      type: String,
      required: [false, "location is optional"],
      trim: true,
      default: "",
    },
    releaseDate: {
      type: Date,
      required: [true, "release date is required"],
      trim: true,
    },
    releaseTime: {
      type: String,
      required: [false, "release time is optional"],
      trim: true,
      enum: [...timeList, ""],
    },
    priority: {
      type: String,
      required: [true, "priority is required"],
      enum: priorityList,
      trim: true,
    },
    configuration: {
      type: String,
      required: [true, "configuration is required"],
      enum: ["single", "album", "ep", "compilation"],
      trim: true,
    },
    typeOfRelease: {
      type: String,
      required: [true, "type of release is required"],
      enum: typeOfRelease,
      trim: true,
    },
    focusTrack: {
      type: String,
      required: [
        function (this: any) {
          return this.get("configuration") === "album";
        },
        "focus track is required",
      ],
      trim: true,
    },
    focusTrackIsrc: {
      type: String,
      required: [false, "focus track ISRC is required"],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, "genres is required"],
      trim: true,
    },
    subgenres: {
      type: [String],
      required: [false, "subgenres is optional"],
      trim: true,
      default: [],
    },
    mood: {
      type: String,
      required: [false, "mood is optional"],
      trim: true,
      default: "",
    },
    editorialTeams: {
      type: String,
      required: [true, "editorial teams is required"],
      trim: true,
    },
    facebookProfileLink: {
      type: String,
      required: [false, "facebook profile link is optional"],
      trim: true,
      default: "",
    },
    instagramProfileLink: {
      type: String,
      required: [false, "instagram profile link is optional"],
      trim: true,
      default: "",
    },
    twitterProfileLink: {
      type: String,
      required: [false, "twitter profile link is optional"],
      trim: true,
      default: "",
    },
    youtubeProfileLink: {
      type: String,
      required: [false, "youtube profile link is optional"],
      trim: true,
      default: "",
    },
    tiktokProfileLink: {
      type: String,
      required: [false, "tiktok profile link is optional"],
      trim: true,
      default: "",
    },
    marketingDetail: {
      type: String,
      required: [true, "marketing detail is required"],
      maxlength: [1000, "marketing detail cannot exceed 500 characters"],
      trim: true,
    },
    comment: {
      type: String,
      required: [false, "comment is optional"],
      trim: true,
      default: "",
    },
  },
  { _id: false, strict: "throw" },
);
// Define Promotion interface
export interface IPromotion extends Document {
  _id: string;
  packageName: string;
  transactionReference: string;
  category: promotionCategory;
  promotionImage: string;
  releaseTitle: string;
  releaseDescription: string;
  artist: Artist;
  artistName: string;
  user: IUser;
  createdAt: Date;
  updatedAt: Date;
  startDate: Date;
  endDate: Date;
  promotionStatus: "pending" | "approved" | "completed";
  amount: number;
  pitchPlayListDetails: typeof pitchPlaylistDetails;
}

// Schema definition
const PromotionSchema = new Schema<IPromotion>(
  {
    packageName: {
      type: String,
      required: [true, "Provide the package name!"],
      trim: true,
    },
    transactionReference: {
      type: String,
      required: [true, "Provide the transaction reference!"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Provide the category!"],
      trim: true,
    },
    promotionImage: {
      type: String,
      required: [
        function (this: any) {
          return this.get("category") === "Online-press";
        },
        "Provide the promotion image!",
      ],
      trim: true,
    },
    releaseTitle: {
      type: String,
      required: [true, "Provide the release title!"],
      trim: true,
    },
    releaseDescription: {
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
    artistName: {
      type: String,
      required: [true, "Provide an artist name!"],
    },
    startDate: {
      type: Date,
      required: [true, "Please provide a start date for the promotion!"],
    },
    endDate: {
      type: Date,
      required: [true, "Please provide an end date for the promotion!"],
    },
    promotionStatus: {
      type: String,
      enum: {
        values: ["pending", "approved", "completed"],
        message: "{VALUE} is not a valid type",
      },
      default: "pending",
    },
    amount: {
      type: Number,
      required: [true, "Please provide an amount for the promotion!"],
      trim: true,
    },
    pitchPlayListDetails: {
      type: pitchPlaylistDetails,
      required: [
        function (this: any) {
          return this.get("category") === promotionCategory.playlistPitch;
        },
        "please provide playlist details is required",
      ],
    },
  },
  {
    timestamps: true, // ✅ automatically adds createdAt & updatedAt
  },
);
PromotionSchema.index({ user: 1, createdAt: -1 }); //example 1 Optimizes queries that filter by user and sort by createdAt in descending order (newest first). It's ideal for "get the most recent promotions for a specific user."
PromotionSchema.index({ user: 1, updatedAt: -1 }); //example 2 Optimizes queries filtering by user and sorting by updatedAt descending (most recently updated first). Great for "get the recently edited promotions for a user."
PromotionSchema.index({ user: 1, artistName: 1 }); // or { name: "text" } if searching text, example 3 Optimizes queries that filter by user and then by artistName (e.g., for searching or listing promotions alphabetically within a user's scope).
PromotionSchema.index({ transactionReference: 1 }, { unique: true }); // or { name: "text" } if searching text, example 3 Optimizes queries that filter by user and then by artistName (e.g., for searching or listing promotions alphabetically within a user's scope).
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
  mongoose.models?.Promotion ||
  mongoose.model<IPromotion>("Promotion", PromotionSchema);
export default Promotion;
