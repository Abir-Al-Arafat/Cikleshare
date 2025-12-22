import { Document } from "mongoose";

export interface IResource extends Document {
  title: string;
  type: string;
  country: string;
  description: string;
  department: string;
  images?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
