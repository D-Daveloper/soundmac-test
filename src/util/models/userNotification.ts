import mongoose, { Schema, Document, Model } from 'mongoose';

interface IUserNotification extends Document {
  userId: string;
  adminId: string;
  reason: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const userNotificationSchema: Schema = new Schema<IUserNotification>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      maxlength: [100, 'User ID cannot exceed 100 characters']
    },
    adminId: {
      type: String,
      required: [true, 'Admin ID is required'],
      maxlength: [100, 'Admin ID cannot exceed 100 characters']
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      maxlength: [255, 'Reason cannot exceed 255 characters']
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    status: {
      type: String,
      default: 'sent',
      enum: ['sent', 'delivered', 'read', 'failed']
    }
  },
  {
    timestamps: true // Automatically handles createdAt
  }
);

// Indexes for performance
userNotificationSchema.index({ userId: 1 });
userNotificationSchema.index({ adminId: 1 });
userNotificationSchema.index({ status: 1 });
userNotificationSchema.index({ userId: 1, status: 1 });

// Compound index for unread notifications
userNotificationSchema.index({ userId: 1, status: 1, createdAt: -1 });

const UserNotification: Model<IUserNotification> = mongoose.models?.UserNotification || mongoose.model<IUserNotification>(
  'UserNotification',
  userNotificationSchema
);

export default UserNotification;