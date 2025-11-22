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
}

export default new UserService();
