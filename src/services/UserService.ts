import UserModel from "../models/UserModel";
import { success, failure } from "../utilities/common";
import { generateRandomCode } from "../utilities/common";
import { emailWithNodemailerGmail } from "../config/email.config";
import bcrypt from "bcryptjs";

class UserService {
  async isEmailTaken(email: string): Promise<boolean> {
    const user = await UserModel.findOne({ email });
    return !!user;
  }
}

export default new UserService();
