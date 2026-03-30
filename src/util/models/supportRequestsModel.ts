import mongoose from "mongoose";

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
      enum: ["pending", "inprogress", "completed", "rejected"],
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

const supportRequestsModel = mongoose.models?.supportRequests ||
  mongoose.model("supportRequests", supportRequestsSchema);
  
export default supportRequestsModel;
