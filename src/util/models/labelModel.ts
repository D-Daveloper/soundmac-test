import mongoose, { Model } from "mongoose";

export interface ILabel extends mongoose.Document {
  _id:string
  labelName: string;
  firstName: string;
  lastName: string;
  instagramProfileLink: string;
  twitterProfileLink: string;
  linkedinProfileLink: string;
  tiktokProfileLink: string;
  labelLogo: string;
  user: string;
}

export const labelSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            required: [true, "Provide a user"],
            ref: "User"
        },
        labelName: {
            type: String,
            validate: {
                validator: (v: any) => typeof v === "string",
                message: "label name must be a string",
            },
            required: [true, "Provide a label name!"],
        },
        firstName: {
            type: String,
            validate: {
                validator: (v: any) => typeof v === "string",
                message: "first name must be a string",
            },
            required: [true, "Provide label owner first name!"],
        },
        lastName: {
            type: String,
            validate: {
                validator: (v: any) => typeof v === "string",
                message: "last name must be a string",
            },
            required: [true, "Provide a label owner last name!"],
        },
        labelLogo: {
            type: String,
            validate: {
                validator: (v: any) => typeof v === "string",
                message: "label logo must be a string",
            },
            required: [true, "Provide a label logo!"],
        },
        labelStatus: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
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
        linkedinProfileLink: {
            type: String,
            required: [false, "linkedin profile link is optional"],
            trim: true,
            default: "",
        },
        tiktokProfileLink: {
            type: String,
            required: [false, "tiktok profile link is optional"],
            trim: true,
            default: "",
        },
    },
    { timestamps: true },
);

const Label:Model<ILabel> = mongoose.models?.Label || mongoose.model<ILabel>("Label", labelSchema);
export default Label