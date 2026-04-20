import User from "../models/User";

export const userController = {
  async getAllUsers() {
    try {
      const users = await User.find().select("-password");
      return { 
        status: 200,
        body: {
          success: true,
          message: "Users fetched successfully",
          users 
        }
      };
    } catch (err: any) {
      return { 
        status: 500, 
        body: { 
          success: false, 
          message: "Error fetching users", 
          error: err.message 
        } 
      };
    }
  }
};
