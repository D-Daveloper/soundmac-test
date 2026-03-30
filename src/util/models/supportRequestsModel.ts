import mongoose from "mongoose";
export interface ISupportRequest {
  _id:string;
  issueCategory: string;
  issueDetail: string;
  issueStatus: "pending"| "in-progress"| "completed"| "rejected";
  screenshot: string | null;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePic: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const supportRequestsSchema = new mongoose.Schema(
  {
    issueCategory: {
      type: String,
      required: [true, "Please Provide an Issue Category"],
    },
    issueDetail: {
      type: String,
      required: [true, "Provide more details about the issue you are facing"],
    },
    issueStatus: {
      type: String,
      enum: ["pending", "in-progress", "completed", "rejected"],
    },
    screenshot: {
      type: String,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provide a user!"],
    },
  },
  { timestamps: true },
);
supportRequestsSchema.index({
  user: 1,
  createdAt: -1,
});

const supportRequestsModel =
  mongoose.models?.supportRequests ||
  mongoose.model("supportRequests", supportRequestsSchema);

export default supportRequestsModel;
