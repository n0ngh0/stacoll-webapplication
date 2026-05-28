import User from "../models/User";
import { sendOTPEmail } from "../utils/email";

export const authController = {
  async register(body: { username: string; email: string; password: string }) {
    try {
      const { username, email, password } = body;
      
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        if (!existingUser.isVerified) {
          // If exists but not verified, update password and mark as verified
          const hashedPassword = await Bun.password.hash(password);
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          existingUser.password = hashedPassword;
          existingUser.username = username;
          existingUser.otp = otp;
          existingUser.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
          existingUser.isVerified = true; // Automatically verify for testing
          await existingUser.save();
          // await sendOTPEmail(email, otp); // Bypassed for testing
          return { status: 200, body: { success: true, message: "User updated and verified successfully (OTP Bypassed for testing)" } };
        }
        return { status: 400, body: { success: false, message: "User already exists" } };
      }

      const hashedPassword = await Bun.password.hash(password);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        isVerified: true, // Automatically verify for testing
        otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
      });

      // await sendOTPEmail(email, otp); // Bypassed for testing

      return { 
        status: 201, 
        body: {
          success: true,
          message: "User created successfully. (OTP Bypassed for testing)", 
          user: { 
            id: newUser._id.toString(), 
            username: newUser.username, 
            email: newUser.email, 
          } 
        }
      };
    } catch (err: any) {
      return { status: 500, body: { success: false, message: "Error registering user", error: err.message } };
    }
  },

  async verifyOTP(body: { email: string; otp: string }) {
    try {
      const { email, otp } = body;
      const user = await User.findOne({ email });

      if (!user) {
        return { status: 404, body: { success: false, message: "User not found" } };
      }

      if (user.isVerified) {
        return { status: 400, body: { success: false, message: "User already verified" } };
      }

      if (user.otp !== otp) {
        return { status: 400, body: { success: false, message: "Invalid OTP" } };
      }

      if (user.otpExpiry && user.otpExpiry < new Date()) {
        return { status: 400, body: { success: false, message: "OTP expired" } };
      }

      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();

      return { status: 200, body: { success: true, message: "Email verified successfully" } };
    } catch (err: any) {
      return { status: 500, body: { success: false, message: "Error verifying OTP", error: err.message } };
    }
  },

  async login(body: { email: string; password: string }, jwtSign: (payload: any) => Promise<string>) {
    try {
      const { email, password } = body;

      const user = await User.findOne({ email });
      if (!user) {
        return { status: 401, body: { success: false, message: "Invalid email or password" } };
      }

      if (!user.isVerified) {
        return { status: 403, body: { success: false, message: "Please verify your email first" } };
      }

      const isMatch = await Bun.password.verify(password, user.password);
      if (!isMatch) {
        return { status: 401, body: { success: false, message: "Invalid email or password" } };
      }

      const token = await jwtSign({ 
        id: user._id.toString(), 
        role: user.role 
      });

      return {
        status: 200,
        body: {
          success: true,
          message: "Login successful",
          token,
          user: { 
            id: user._id, 
            username: user.username, 
            email: user.email, 
            role: user.role,
            imgUrl: user.imgUrl 
          }
        }
      };
    } catch (err: any) {
      return { status: 500, body: { success: false, message: "Error logging in", error: err.message } };
    }
  }
};
