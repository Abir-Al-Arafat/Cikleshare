import UserModel from "../models/UserModel";

class AuthService {
  async signUp(fullName: string, email: string, password: string) {
    try {
      const user = await UserModel.create({
        fullName,
        email,
        password,
      });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      console.error("Error registering user(AuthService signUp):", error);
      return null;
    }
  }
}

export default new AuthService();
