import { Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  purpose: string;
  verified: boolean;
  createdAt: Date;
}
