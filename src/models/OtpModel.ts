import mongoose, { Schema } from "mongoose";
import { IOtp } from "../interfaces/otp.interface";

const otpSchema: Schema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
      enum: ["passwordRecovery", "emailVerification", "twoFactorAuth"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 180, // Document will be automatically deleted after 3 minutes
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for faster lookups
otpSchema.index({ email: 1, purpose: 1 });

const Otp = mongoose.model<IOtp>("Otp", otpSchema);

export default Otp;
