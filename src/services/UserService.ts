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

  async findUserByEmail(
    email: string,
    options: { includePassword?: boolean } = {}
  ) {
    try {
      const query = UserModel.findOne({ email });

      const user = options.includePassword
        ? await query.select("+password")
        : await query;

      return user;
    } catch (error) {
      console.error("Error finding user by email(UserService):", error);

      return null;
    }
  }
}

export default new UserService();
