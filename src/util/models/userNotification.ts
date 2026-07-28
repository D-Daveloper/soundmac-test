import mongoose, { Schema, Document, Model } from 'mongoose';

interface IUserNotification extends Document {
  userId: string;
  adminId: string;
  reason: string;
  message: string;
  status: string;
  statusWeight: number;
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
      required: false,
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
      default: 'delivered',
      enum: ['sent', 'delivered', 'read', 'failed']
    },
    statusWeight: Number//1 delivered, 2 read,
  },
  {
    timestamps: true // Automatically handles createdAt
  }
);

// Indexes for performance
userNotificationSchema.index({ userId: 1 });
userNotificationSchema.index({ adminId: 1 });
userNotificationSchema.index({ statusWeight: 1 });
userNotificationSchema.index({ userId: 1, statusWeight: 1 });

// Compound index for unread notifications
userNotificationSchema.index({ userId: 1, statusWeight: 1, createdAt: -1 });

const autoWeight = function(this: any, next: any) {
  // const update = this.getUpdate();
  const weights:Record<string,number> = { 'delivered': 1, 'read': 2, 'pending': 3 };

  if(typeof this.getUpdate === 'function'){
    const update =  this.getUpdate()
    if (update && update.status) {
      update.statusWeight = weights[update.status as string] || 99;
    }

  } else {
     if (this.status) {
      this.statusWeight = weights[this.status as string] || 99;
    }
  }
  
  next();
};

// The "pre-save" hook
userNotificationSchema.pre('save', autoWeight);
userNotificationSchema.pre('findOneAndUpdate', autoWeight);
userNotificationSchema.pre('updateMany', autoWeight);

const UserNotification: Model<IUserNotification> = mongoose.models?.UserNotification || mongoose.model<IUserNotification>(
  'UserNotification',
  userNotificationSchema
);

export default UserNotification;