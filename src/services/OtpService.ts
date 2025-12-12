import Otp from "../models/OtpModel";
import { IOtp } from "../interfaces/otp.interface";

class OtpService {
  /**
   * Create a new OTP entry
   * @param email - User's email
   * @param otp - Generated OTP code
   * @param purpose - Purpose of the OTP (passwordRecovery, emailVerification, twoFactorAuth)
   * @returns Created OTP document or null
   */
  async createOtp(
    email: string,
    otp: string,
    purpose: string,
    userId: string
  ): Promise<IOtp | null> {
    try {
      // Delete any existing OTPs for this email and purpose before creating a new one
      await Otp.deleteMany({ email, purpose });

      const otpDoc = await Otp.create({
        email,
        otp,
        purpose,
        user: userId,
      });

      return otpDoc;
    } catch (error) {
      console.error("Error creating OTP (OtpService createOtp):", error);
      return null;
    }
  }

  /**
   * Verify an OTP
   * @param email - User's email
   * @param otp - OTP code to verify
   * @param purpose - Purpose of the OTP
   * @returns true if OTP is valid, false otherwise
   */
  async verifyOtp(
    email: string,
    otp: string,
    purpose: string
  ): Promise<boolean> {
    try {
      const otpDoc = await Otp.findOneAndUpdate(
        {
          email,
          otp,
          purpose,
          verified: false,
        },
        {
          verified: true,
        }
      );

      if (!otpDoc) {
        return false;
      }

      // Delete the OTP after successful verification (one-time use)
      //   await Otp.deleteOne({ _id: otpDoc._id });

      return true;
    } catch (error) {
      console.error("Error verifying OTP (OtpService verifyOtp):", error);
      return false;
    }
  }

  /**
   * Check if user has a verified OTP
   * @param email - User's email
   * @param purpose - Purpose of the OTP
   * @returns true if user has verified OTP, false otherwise
   */
  async hasVerifiedOtp(email: string, purpose: string): Promise<boolean> {
    try {
      const otpDoc = await Otp.findOne({
        email,
        purpose,
        verified: true,
      });

      return !!otpDoc;
    } catch (error) {
      console.error(
        "Error checking verified OTP (OtpService hasVerifiedOtp):",
        error
      );
      return false;
    }
  }

  /**
   * Delete OTPs for a specific email and purpose
   * @param email - User's email
   * @param purpose - Purpose of the OTP
   */
  async deleteOtps(email: string, purpose: string): Promise<void> {
    try {
      await Otp.deleteMany({ email, purpose });
    } catch (error) {
      console.error("Error deleting OTPs (OtpService deleteOtps):", error);
    }
  }
}

export default new OtpService();
