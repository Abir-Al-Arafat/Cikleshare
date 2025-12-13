import UserModel from "../models/UserModel";

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

  async findUserById(userId: string) {
    try {
      const user = await UserModel.findById(userId);
      return user;
    } catch (error) {
      console.error("Error finding user by ID(UserService):", error);
      return null;
    }
  }

  async updateUserProfile(
    userId: string,
    updates: {
      username?: string;
      phone?: string;
      image?: string;
    }
  ) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      );
      return user;
    } catch (error) {
      console.error("Error updating user profile(UserService):", error);
      return null;
    }
  }
}

export default new UserService();
