import mongoose, { Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const subscriptionDetails = new mongoose.Schema(
  {
    authorizationCode: {
      type: String,
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "authorization code must be a string",
      },
      select: false,
    },
    subscriptionCode: {
      type: String,
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "subscription code must be a string",
      },
      select: false,
    },
    customerCode: {
      type: String,
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "customer code must be a string",
      },
      select: false,
    },
    lastFourDigits: {
      type: String,
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "last four digits code must be a string",
      },
    },
    cardType: {
      type: String,
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "card type must be a string",
      },
    },
    subscriptionStatus: {
      type: String,
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "subscription Status  must be a string",
      },
    },
    emailToken: {
      type: String,
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "email token  must be a string",
      },
      select: false,
    },
  },
  { _id: false, strict: "throw" },
);

export const accountDetails = new mongoose.Schema(
  {
    accountHolderName: {
      type: String,
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "account holder name must be a string",
      },
    },
    accountNumber: {
      type: String,
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "account Number must be a string",
      },
    },
    bankName: {
      type: String,
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "bank name must be a string",
      },
    },
    bankCode: {
      type: String,
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "bank code must be a string",
      },
    },
    currency: {
      type: String,
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "currency must be a string",
      },
    },
    verified: {
      type: Boolean,
      validate: {
        validator: (v: any) => typeof v === "boolean",
        message: "verified must be a boolean",
      },
    },
  },
  { _id: false, strict: "throw" },
);

export const verificationDetails = new mongoose.Schema(
  {
    middleName: {
      type: String,
      required: [false, "middle name is optional"],
    },
    dob: {
      type: Date,
      required: [true, "date of birth is required"],
      validate: {
        validator: function (value: Date) {
          const age = Math.floor(
            (Date.now() - value.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
          );
          return age >= 18;
        },
        message: "you must be at least 18 years old",
      },
    },
    idType: {
      type: String,
      required: [true, "id type is required"],
      enum: ["passport", "driver_license", "NIN", "other"],
    },
    idNumber: {
      type: String,
      required: [true, "id number is required"],
    },
    idImage: {
      type: String,
      required: [true, "id image is required"],
    },
    addressImage: {
      type: String,
      required: [true, "address image is required"],
    },
    verified: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "{VALUE} is not a valid entry",
      },
      default: "pending",
    },
  },
  { _id: false, strict: "throw", timestamps: true },
);

export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  country: string;
  email: string;
  userStatus: "active" | "inactive";
  profilePic: string | null;
  confirmed: boolean;
  premium: boolean;
  premiumExpiration: Date | null;
  warning: number;
  banned: boolean;
  type:
  | "EMERGING_ARTIST"
  | "MAJOR_LABEL"
  | "FREE_ARTIST"
  | "INDEPENDENT_ARTIST"
  | "INDIE_LABEL";
  role: "user" | "admin" | "super_admin";
  label: string;
  labelId: string | null;
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
  subscriptionDetails: {
    lastFourDigits?: string;
    emailToken?: string;
    subscriptionStatus?: string;
    customerCode?: string;
    authorizationCode?: string;
    subscriptionCode?: string;
    cardType?: string;
  };
  accountDetails: {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
    currency: string;
    verified: boolean;
  };
  verificationDetails: {
    middleName: string;
    idType: string;
    idNumber: string;
    idImage: string;
    addressImage: string;
    dob: Date | undefined;
    createdAt: Date;
    updatedAt: Date;
    verified: "pending" | "approved" | "rejected";
  } | null;
}

const UserSchema = new mongoose.Schema(
  {
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
      lowercase: true,
      index: true,
    },
    userStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    profilePic: {
      type: String,
      trim: true,
      default: null,
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
    subscriptionDetails: {
      type: subscriptionDetails,
      required: [
        function (this: any) {
          return this.premium === true;
        },
        "Subscription details required for premium users",
      ],
      default: undefined,
    },
    accountDetails: {
      type: accountDetails,
      // required: [
      //   function (this: any) {
      //     return this.premium === true;
      //   },
      //   "account details required for premium users",
      // ],
      default: {
        accountHolderName: "",
        accountNumber: "",
        bankName: "",
        bankCode: "",
        currency: "",
        verified: false,
      },
    },
    verificationDetails: {
      type: verificationDetails,
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
          "EMERGING_ARTIST",
          "MAJOR_LABEL",
          "FREE_ARTIST",
          "INDEPENDENT_ARTIST",
          "INDIE_LABEL",
        ],
        message: "{VALUE} is not a valid type",
      },
      default: "FREE_ARTIST",
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
      default: "Independent Artist",
    },
    labelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Label",
      required: [
        function (this: any) {
          return this.get("label") !== "Independent Artist";
        },
        "Label ID is required",
      ],
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
  },
  { timestamps: true },
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.pre("validate", function (next) {
  if (this.premium === true && !this.subscriptionDetails) {
    this.invalidate(
      "subscriptionDetails",
      "Subscription details required for premium users",
    );
  }
  next();
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
      expiresIn: process.env.JWT_LIFETIME || "2h",
    } as jwt.SignOptions,
  );
};

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

const User: Model<IUser> =
  mongoose.models?.User || mongoose.model<IUser>("User", UserSchema);
export default User;
