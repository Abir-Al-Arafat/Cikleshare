import { Model, ObjectId } from "mongoose";
import { Request } from "express";

export interface IUser {
  _id?: ObjectId; // Optional for new users
  firstName?: string;
  lastName?: string;
  phone?: string;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  dob?: Date; //optional
  role?: string;
  roles?: string[];
  gender?: "male" | "female" | "other";
  status?: "active" | "banned";
  emailVerified?: boolean;
  emailVerifyCode?: number;
  [key: string]: any;
}

export interface UserRequest extends Request {
  user?: IUser;
}
