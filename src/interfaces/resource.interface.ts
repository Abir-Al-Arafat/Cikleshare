import { Document } from "mongoose";

export interface IResource extends Document {
  title: string;
  type: string;
  country: string;
  description: string;
  image?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
