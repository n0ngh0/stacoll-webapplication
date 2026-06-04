import User from "../models/User";
import { validatePassword } from "../utils/validation";
import {
  buildSkillWalletSummaries,
  enrichVerifiedSkillEntry,
} from "../utils/verified-skills";

const MAX_PROFILE_PROJECTS = 4;

export const profileController = {
  async getProfile(userId: string) {
    try {
      const user = await User.findById(userId).select("-password").lean();
      
      if (!user) {
        return { status: 404, body: { success: false, message: "User not found" } };
      }

      const now = new Date();
      const enrichedSkills = (user.verifiedSkills ?? []).map((entry) =>
        enrichVerifiedSkillEntry(entry as any, now)
      );
      const skillWallet = buildSkillWalletSummaries(user.verifiedSkills as any, now);

      return {
        status: 200,
        body: {
          success: true,
          message: "Profile fetched successfully",
          user: {
            ...user,
            verifiedSkills: enrichedSkills,
            skillWallet,
          },
        },
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
      const { email, password, role, isVerified, otp, otpExpiry, createdAt, updatedAt, verifiedSkills, skillWallet, ...updateData } = body;

      if (Array.isArray(updateData.projects) && updateData.projects.length > MAX_PROFILE_PROJECTS) {
        return {
          status: 400,
          body: { success: false, message: `Maximum ${MAX_PROFILE_PROJECTS} projects allowed` },
        };
      }

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
  },

  async changePassword(userId: string, body: any) {
    try {
      const { currentPassword, newPassword } = body;
      
      if (!currentPassword || !newPassword) {
        return { status: 400, body: { success: false, message: "Current and new passwords are required" } };
      }

      const user = await User.findById(userId);
      if (!user) {
        return { status: 404, body: { success: false, message: "User not found" } };
      }

      if (user.authProvider === 'google' || !user.password) {
        return { status: 400, body: { success: false, message: "Google accounts cannot change password directly" } };
      }

      const isMatch = await Bun.password.verify(currentPassword, user.password);
      if (!isMatch) {
        return { status: 401, body: { success: false, message: "Incorrect current password" } };
      }

      const passwordCheck = validatePassword(newPassword);
      if (!passwordCheck.valid) {
        return { status: 400, body: { success: false, message: passwordCheck.message } };
      }

      user.password = await Bun.password.hash(newPassword);
      await user.save();

      return { status: 200, body: { success: true, message: "Password updated successfully" } };
    } catch (err: any) {
      console.error("Change Password Error:", err);
      return { status: 500, body: { success: false, message: "Error changing password", error: err.message } };
    }
  },

  async deleteProfile(userId: string) {
    try {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        return { status: 404, body: { success: false, message: "User not found" } };
      }

      return { status: 200, body: { success: true, message: "Account deleted successfully" } };
    } catch (err: any) {
      console.error("Delete Profile Error:", err);
      return { status: 500, body: { success: false, message: "Error deleting account", error: err.message } };
    }
  }
};
