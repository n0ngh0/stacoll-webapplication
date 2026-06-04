import { Resend } from "resend";

export const sendOTPEmail = async (to: string, otp: string) => {
  console.log("📨 Attempting to send OTP email to:", to);
  try {
    const resendApiKey = process.env.RESEND_API_KEY || process.env.SMTP_PASS;
    if (!resendApiKey) {
      console.error("❌ Missing Resend API Key");
      return false;
    }
    const resend = new Resend(resendApiKey);
    const htmlContent = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 40px 20px; color: #18181b;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <div style="background-color: #10b981; padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Stacoll Verification</h1>
          </div>
          
          <!-- Body -->
          <div style="padding: 40px 30px; text-align: center;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #52525b; line-height: 1.5;">
              Hello!<br>You requested to verify your email. Here is your one-time password (OTP):
            </p>
            
            <div style="background-color: #f4f4f5; border: 1px dashed #d4d4d8; border-radius: 12px; padding: 20px; margin: 30px 0;">
              <span style="font-size: 36px; font-weight: 800; color: #18181b; letter-spacing: 6px;">${otp}</span>
            </div>
            
            <p style="margin: 0; font-size: 14px; color: #71717a;">
              This code will expire in <strong style="color: #ef4444;">10 minutes</strong>. Please do not share it with anyone.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #f4f4f5;">
            <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
          
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.SMTP_FROM || 'onboarding@resend.dev',
      to: [to],
      subject: "Your Stacoll Verification Code",
      text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`,
      html: htmlContent,
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return false;
    }

    console.log("✅ Resend Response:", data);
    return true;
  } catch (error) {
    console.error("❌ Resend Exception:", error);
    return false;
  }
};

export const sendPasswordResetEmail = async (to: string, resetUrl: string) => {
  try {
    const resendApiKey = process.env.RESEND_API_KEY || process.env.SMTP_PASS;
    if (!resendApiKey) {
      console.error("❌ Missing Resend API Key");
      return false;
    }
    const resend = new Resend(resendApiKey);

    const htmlContent = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 40px 20px; color: #18181b;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #10b981; padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Reset your password</h1>
          </div>
          <div style="padding: 40px 30px; text-align: center;">
            <p style="margin: 0 0 24px 0; font-size: 16px; color: #52525b; line-height: 1.5;">
              Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
            </p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; font-weight: 700; padding: 14px 28px; border-radius: 12px;">Reset password</a>
            <p style="margin: 24px 0 0 0; font-size: 12px; color: #71717a; word-break: break-all;">${resetUrl}</p>
          </div>
          <div style="background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #f4f4f5;">
            <p style="margin: 0; font-size: 12px; color: #a1a1aa;">If you did not request this, you can ignore this email.</p>
          </div>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.SMTP_FROM || 'onboarding@resend.dev',
      to: [to],
      subject: "Reset your Stacoll password",
      text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
      html: htmlContent,
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return false;
    }

    console.log("✅ Password reset email sent via Resend:", data);
    return true;
  } catch (error) {
    console.error("❌ Resend Exception:", error);
    return false;
  }
};
