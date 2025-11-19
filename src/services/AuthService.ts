import UserModel from "../models/UserModel";
import { success, failure } from "../utilities/common";
import { generateRandomCode } from "../utilities/common";
import { emailWithNodemailerGmail } from "../config/email.config";
import bcrypt from "bcryptjs";

class AuthService {
  async signUp(
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string
  ) {
    try {
      const emailCheck = await UserModel.findOne({ email });

      if (emailCheck) {
        return failure("User with email already exists");
      }

      if (password !== confirmPassword) {
        return failure("Passwords do not match");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await UserModel.create({
        fullName,
        email,
        password: hashedPassword,
      });

      if (!user) {
        return failure("User registration failed");
      }

      //   const verificationCode = generateRandomCode();
      //   user.verificationCode = verificationCode;
      //   await user.save();

      //   const emailData: IEmailData = {
      //     to: email,
      //     subject: "Email Verification",
      //     text: `Your verification code is: ${verificationCode}`,
      //   };

      //   await emailWithNodemailerGmail(emailData);

      return success("User registered successfully", user);
    } catch (error) {
      console.error("Error registering user:", error);
      return failure("Error registering user");
    }
  }
}

export default new AuthService();
