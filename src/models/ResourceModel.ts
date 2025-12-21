import mongoose, { Schema } from "mongoose";
import { IResource } from "../interfaces/resource.interface";

const resourceSchema: Schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Resource type is required"],
      enum: [
        "Health Article",
        "Education",
        "Job Resources",
        "Clinical Trial Information",
        "Government Support Programmes",
        "Local Treatment Centres",
        "Healthcare Charities",
        "Medication",
      ],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    images: {
      type: [String],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Resource = mongoose.model<IResource>("Resource", resourceSchema);

export default Resource;
