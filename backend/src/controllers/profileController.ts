import User from "../models/User";

export const profileController = {
  async getProfile(userId: string) {
    try {
      const user = await User.findById(userId).select("-password").lean();
      
      if (!user) {
        return { status: 404, body: { success: false, message: "User not found" } };
      }

      return {
        status: 200,
        body: {
          success: true,
          message: "Profile fetched successfully",
          user
        }
      };
    } catch (err: any) {
      return { status: 500, body: { success: false, message: "Error fetching profile", error: err.message } };
    }
  },

  async updateProfile(userId: string, body: any) {
    try {
      if (!body) {
        return { status: 400, body: { success: false, message: "Request body is empty" } };
      }

      // Disallow updating sensitive fields
      const { email, password, role, isVerified, otp, otpExpiry, createdAt, updatedAt, ...updateData } = body;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-password").lean();

      if (!user) {
        return { status: 404, body: { success: false, message: "User not found" } };
      }

      return {
        status: 200,
        body: {
          success: true,
          message: "Profile updated successfully",
          user
        }
      };
    } catch (err: any) {
      console.error("Profile Update Error:", err);
      
      // Handle MongoDB duplicate key error for username or email
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return { status: 400, body: { success: false, message: `The ${field} '${err.keyValue[field]}' is already taken. Please choose another.` } };
      }

      return { status: 500, body: { success: false, message: `Error updating profile: ${err.message}`, error: err.message } };
    }
  }
};
