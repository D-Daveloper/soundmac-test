// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// const UserSchema = new mongoose.Schema({
//   first_name: {
//     type: String,
//     required: [true, "Provide your first name!"],
//     trim: true,
//     minlength: 3,
//     maxlength: 32,
//   },
//   last_name: {
//     type: String,
//     required: [true, "Provide your last name!"],
//     trim: true,
//     minlength: 3,
//     maxlength: 32,
//   },
//   country: {
//     type: String,
//     required: [true, "Provide country!"],
//     trim: true,
//   },
//   email: {
//     type: String,
//     required: [true, "Provide an email address"],
//     match: [
//       /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
//       "Please provide valid email address!",
//     ],
//     unique: true,
//     trim: true,
//   },

//   confirmed: {
//     type: Boolean,
//     default: false,
//   },
//   premium: {
//     type: Boolean,
//     default: false,
//   },
//   premiumExpiration: {
//     type: Date,
//     default: null,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
//   warning: {
//     type: Number,
//     default: 0,
//   },
//   banned: {
//     type: Boolean,
//     default: false,
//   },
//   type: {
//     type: String,
//     enum: {
//       values: [
//         null,
//         "BASIC_USER",
//         "BIG_LABEL",
//         "FREE_ARTISTE",
//         "INDEPENDENT_ARTISTE",
//         "MINI_LABEL",
//       ],
//       message: "{VALUE} is not a valid type",
//     },
//     default: null,
//   },
//   role: {
//     type: String,
//     enum: {
//       values: ["user", "admin", "super_admin"],
//       message: "{VALUE} is not a valid role",
//     },
//     default: "user",
//   },
//   artiste: {
//     type: Object,
//     default: {},
//   },
//   label: {
//     type: String,
//     minlength: 2,
//     maxlength: 32,
//     default: null,
//   },
//   refreshToken: {
//     type: String,
//     default: null,
//   },
//   refreshTokenExpires: {
//     type: Date,
//     default: null,
//   },
//   isrc_count: {
//     type: Number,
//     default: null,
//   },
//   password: {
//     type: String,
//     required: [true, "Provide a password"],
//     minlength: 6,
//   },
//   twoFactorAuthentication: {
//     type: String,
//     default: "true",
//     enum: {
//       values: ["true", "false"],
//       message: "{VALUE} is not a valid",
//     },
//   },
//   otp: {
//     type: String,
//     default: null,
//   },
//   otpExpires: {
//     type: Date,
//     default: null,
//   },
//   referral_code: {
//     type: String,
//   },
//   reportSkip: {
//     type: Number,
//     default: 0,
//   },
//   withdrawalEligibility: {
//     type: Boolean,
//     default: true,
//   },
//   catalog_count: {
//     type: Number,
//     default: 0,
//   },
// });
// UserSchema.pre("save", async function () {
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// UserSchema.methods.createJWT = function () {
//   return jwt.sign(
//     {
//       userId: this._id,
//       name: this.first_name,
//       email: this.email,
//     },
//     process.env.JWT_SECRET,
//     {
//       expiresIn: process.env.JWT_LIFETIME,
//     }
//   );
// };

// UserSchema.methods.comparePassword = async function (candidatePassword) {
//   const isMatch = await bcrypt.compare(candidatePassword, this.password);
//   return isMatch;
// };

// module.exports = mongoose.model("User", UserSchema);
