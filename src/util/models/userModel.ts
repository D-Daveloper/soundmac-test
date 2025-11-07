import mongoose, { Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  first_name: string;
  last_name: string;
  country: string;
  email: string;
  confirmed: boolean;
  premium: boolean;
  premiumExpiration: Date | null;
  warning: number;
  banned: boolean;
  type: "BASIC_USER" | "BIG_LABEL" | "FREE_ARTISTE" | "INDEPENDENT_ARTISTE" | "MINI_LABEL" | null;
  role: "user" | "admin" | "super_admin";
  label: string | null;
  refreshToken: string | null;
  refreshTokenExpires: Date | null;
  isrc_count: number | null;
  password: string;
  twoFactorAuthentication: "true" | "false";
  otp: string | null;
  otpExpires: Date | null;
  referral_code?: string; // Optional field
  reportSkip: number;
  withdrawalEligibility: boolean;
  catalog_count: number;
  createdAt: Date;
  updatedAt: Date;
  createJWT: () => string;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}


const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Provide your first name!"],
    trim: true,
    minlength: 3,
    maxlength: 32,
  },
  lastName: {
    type: String,
    required: [true, "Provide your last name!"],
    trim: true,
    minlength: 3,
    maxlength: 32,
  },
  country: {
    type: String,
    required: [true, "Provide country!"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Provide an email address"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide valid email address!",
    ],
    unique: true,
    trim: true,
    lowercase: true, index: true
  },

  confirmed: {
    type: Boolean,
    default: false,
  },
  premium: {
    type: Boolean,
    default: false,
  },
  premiumExpiration: {
    type: Date,
    default: null,
  },
  warning: {
    type: Number,
    default: 0,
  },
  banned: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: {
      values: [
        null,
        "BASIC_USER",
        "BIG_LABEL",
        "FREE_ARTISTE",
        "INDEPENDENT_ARTISTE",
        "MINI_LABEL",
      ],
      message: "{VALUE} is not a valid type",
    },
    default: null,
  },
  role: {
    type: String,
    enum: {
      values: ["user", "admin", "super_admin"],
      message: "{VALUE} is not a valid role",
    },
    default: "user",
  },
  label: {
    type: String,
    minlength: 2,
    maxlength: 32,
    default: null,
  },
  refreshToken: {
    type: String,
    default: null,
  },
  refreshTokenExpires: {
    type: Date,
    default: null,
  },
  isrcCount: {
    type: Number,
    default: null,
  },
  password: {
    type: String,
    required: [true, "Provide a password"],
    minlength: [6, "Password must be at least 6 characters"],
    trim: true,
  },
  twoFactorAuthentication: {
    type: String,
    default: "true",
    enum: {
      values: ["true", "false"],
      message: "{VALUE} is not a valid",
    },
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
  referralCode: {
    type: String,
  },
  reportSkip: {
    type: Number,
    default: 0,
  },
  withdrawalEligibility: {
    type: Boolean,
    default: true,
  },
  catalogCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });



UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);  
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign(
    {
      userId: this._id,
      name: this.first_name,
      email: this.email,
    },
    jwtSecret,
    {
      expiresIn: process.env.JWT_LIFETIME || '30d',
    } as jwt.SignOptions
  );
};

UserSchema.methods.comparePassword = async function (candidatePassword:string) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

const User:Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;