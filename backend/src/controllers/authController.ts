import { createHash, randomBytes } from "crypto";
import User from "../models/User";
import { getFrontendUrl } from "../config/env";
import { buildJwtPayload } from "../utils/jwt-payload";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/email";
import { validatePassword } from "../utils/validation";

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Helper: สร้าง username ที่ unique จาก Google display name
async function generateUniqueUsername(baseName: string): Promise<string> {
  // ลบ special chars และ spaces ออก
  const base = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 18) || "user";

  let username = base;
  let counter = 1;

  while (await User.findOne({ username })) {
    username = `${base}${counter}`;
    counter++;
  }

  return username;
}

export const authController = {
  async register(body: { username: string; email: string; password: string }) {
    try {
      const { username, email, password } = body;

      const passwordCheck = validatePassword(password);
      if (!passwordCheck.valid) {
        return { status: 400, body: { success: false, message: passwordCheck.message } };
      }
      
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
          existingUser.isVerified = false;
          await existingUser.save();
          await sendOTPEmail(email, otp);
          return { status: 200, body: { success: true, message: "OTP sent to your email. Please verify." } };
        }
        return { status: 400, body: { success: false, message: "Email already exists" } };
      }

      let existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return { status: 400, body: { success: false, message: "Username already exists" } };
      }

      const hashedPassword = await Bun.password.hash(password);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        authProvider: 'local',
        isVerified: false,
        otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
      });

      await sendOTPEmail(email, otp);

      return { 
        status: 201, 
        body: {
          success: true,
          message: "User created successfully. Please check your email for the OTP.", 
          user: { 
            id: newUser._id.toString(), 
            username: newUser.username, 
            email: newUser.email, 
          } 
        }
      };
    } catch (err: any) {
      if (err.code === 11000) {
        if (err.keyPattern?.username) {
          return { status: 400, body: { success: false, message: "Username already exists" } };
        }
        if (err.keyPattern?.email) {
          return { status: 400, body: { success: false, message: "Email already exists" } };
        }
      }
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

      // ถ้า user สมัครด้วย Google ให้แจ้งให้ login ผ่าน Google แทน
      if (user.authProvider === 'google' && !user.password) {
        return { status: 400, body: { success: false, message: "This account uses Google Sign-In. Please login with Google." } };
      }

      const isMatch = await Bun.password.verify(password, user.password!);
      if (!isMatch) {
        return { status: 401, body: { success: false, message: "Invalid email or password" } };
      }

      const token = await jwtSign(buildJwtPayload(user._id.toString(), user.role));

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
  },

  async googleCallback(code: string, jwtSign: (payload: any) => Promise<string>) {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI;

      if (!clientId || !clientSecret || !redirectUri) {
        return { status: 500, body: { success: false, message: "Google OAuth is not configured" } };
      }

      // Step 1: แลก authorization code เป็น access token
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json() as any;
      if (!tokenData.access_token) {
        return { status: 400, body: { success: false, message: "Failed to exchange Google authorization code" } };
      }

      // Step 2: ดึงข้อมูล user จาก Google
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const googleUser = await userInfoRes.json() as {
        id: string;
        email: string;
        name: string;
        picture: string;
        verified_email: boolean;
      };

      if (!googleUser.email || !googleUser.id) {
        return { status: 400, body: { success: false, message: "Failed to retrieve user info from Google" } };
      }

      // Step 3: ค้นหา user ใน DB
      let user = await User.findOne({ googleId: googleUser.id });

      if (!user) {
        // ลอง link กับ account ที่มี email เดียวกัน
        const existingByEmail = await User.findOne({ email: googleUser.email });

        if (existingByEmail) {
          // Link Google กับ account เดิม
          existingByEmail.googleId = googleUser.id;
          // อัพเดท authProvider แต่เก็บ password เดิมไว้ (user อาจใช้ทั้ง 2 วิธี)
          await existingByEmail.save();
          user = existingByEmail;
        } else {
          // สร้าง user ใหม่จาก Google account
          const uniqueUsername = await generateUniqueUsername(googleUser.name);
          user = await User.create({
            username: uniqueUsername,
            email: googleUser.email,
            googleId: googleUser.id,
            authProvider: "google",
            imgUrl: googleUser.picture,
            isVerified: true, // Google ยืนยัน email แล้ว
          });
        }
      }

      // Step 4: สร้าง JWT token
      const token = await jwtSign(buildJwtPayload(user._id.toString(), user.role));

      return {
        status: 200,
        body: {
          success: true,
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            imgUrl: user.imgUrl,
          },
        },
      };
    } catch (err: any) {
      return { status: 500, body: { success: false, message: "Google OAuth error", error: err.message } };
    }
  },

  async forgotPassword(body: { email: string }) {
    const generic = {
      status: 200 as const,
      body: {
        success: true,
        message: "If an account exists for this email, a reset link has been sent.",
      },
    };

    try {
      const email = body.email?.trim().toLowerCase();
      if (!email) {
        return generic;
      }

      const user = await User.findOne({ email });
      if (!user || !user.password) {
        return generic;
      }

      const rawToken = randomBytes(RESET_TOKEN_BYTES).toString("hex");
      user.passwordResetToken = hashResetToken(rawToken);
      user.passwordResetExpiry = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await user.save();

      const resetUrl = `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(email)}`;
      await sendPasswordResetEmail(email, resetUrl);

      return generic;
    } catch (err: any) {
      console.error("forgotPassword error:", err);
      return generic;
    }
  },

  async resetPassword(body: { email: string; token: string; password: string }) {
    try {
      const email = body.email?.trim().toLowerCase();
      const token = body.token?.trim();
      const { password } = body;

      if (!email || !token) {
        return { status: 400, body: { success: false, message: "Invalid or expired reset link" } };
      }

      const passwordCheck = validatePassword(password);
      if (!passwordCheck.valid) {
        return { status: 400, body: { success: false, message: passwordCheck.message } };
      }

      const user = await User.findOne({ email });
      if (
        !user ||
        !user.passwordResetToken ||
        !user.passwordResetExpiry ||
        user.passwordResetExpiry < new Date()
      ) {
        return { status: 400, body: { success: false, message: "Invalid or expired reset link" } };
      }

      if (user.passwordResetToken !== hashResetToken(token)) {
        return { status: 400, body: { success: false, message: "Invalid or expired reset link" } };
      }

      user.password = await Bun.password.hash(password);
      user.passwordResetToken = undefined;
      user.passwordResetExpiry = undefined;
      await user.save();

      return { status: 200, body: { success: true, message: "Password updated successfully" } };
    } catch (err: any) {
      return { status: 500, body: { success: false, message: "Error resetting password", error: err.message } };
    }
  },
};

