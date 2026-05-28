import nodemailer from "nodemailer";

// Reuse the transporter instance
let transporter: nodemailer.Transporter | null = null;

export const setupTransporter = async () => {
  if (transporter) return transporter;

  // Use Ethereal for testing
  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  return transporter;
};

export const sendOTPEmail = async (to: string, otp: string) => {
  try {
    const t = await setupTransporter();
    const info = await t.sendMail({
      from: '"Stacoll Admin" <admin@stacoll.com>',
      to,
      subject: "Your OTP Verification Code",
      text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`,
      html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`,
    });

    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
