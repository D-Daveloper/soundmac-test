import mongoose from "mongoose";

const ChartRegistrationSchema = new mongoose.Schema(
    {
        chartName: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        releaseTitle: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        releaseId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "onModel",
            trim: true,
        },
        onModel: {
            type: String,
            required: [true, "Provide the type of release!"],
            trim: true,
            enum: ['Song', 'Album'] // The actual names of your models
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
        countryCode:{
            type: String,
            required: [true, "Provide a country code!"],
            trim: true,
        },
        chartStatus: {
            type: String,
            enum: ["awaiting_payment", "pending", "approved", "payment_failed", "rejected"],
            default: "awaiting_payment",
        },
        transactionId: {
            type: String,
            required: [function (this: any) {
                return this.get("chartStatus") === "pending";
            }, "Transaction ID is required!"],
            unique: true,
            trim: true,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    },
);

// Indexes for better query performance
ChartRegistrationSchema.index(
    { user: 1, releaseTitle: 1, artist: 1, chartName: 1 },
    { unique: true }
);
ChartRegistrationSchema.index({ chartStatus: 1, createdAt: -1 }); // For admin queries by status
ChartRegistrationSchema.index({ artistName: 1, chartStatus: 1, createdAt: -1 }); // For admin queries by artist + status
ChartRegistrationSchema.index(
    { releaseTitle: 1, createdAt: -1 },
    { collation: { locale: "en", strength: 2 } }
); // For admin queries by release title
// Admin endpoint
ChartRegistrationSchema.index({ createdAt: -1 }); // no filters


const ChartRegistrationModel: any =
    mongoose.models?.ChartRegistration || mongoose.model<any>("ChartRegistration", ChartRegistrationSchema);

export default ChartRegistrationModel;


