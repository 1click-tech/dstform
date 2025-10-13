import { adminDb } from "@/lib/firebaseAdmin";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) return new Response(JSON.stringify({ error: "Email required" }), { status: 400 });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in Firestore with expiry (5 min)
    await adminDb.collection("otps").doc(email).set({
      otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
  from: `"1Click Distributors" <${process.env.EMAIL_USER}>`,
to: email,
subject: "Your One-Time Password (OTP) - Distributor Verification",
html: `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #1E40AF 0%, #1e3a8a 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 16px; color: #1f2937; margin-bottom: 20px; }
        .message { font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
        .otp-container { background-color: #f3f4f6; border-left: 4px solid #1E40AF; padding: 25px; margin: 30px 0; text-align: center; border-radius: 6px; }
        .otp-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 12px; font-weight: 600; }
        .otp-code { font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1E40AF; font-family: 'Courier New', monospace; }
        .otp-expiry { font-size: 12px; color: #ef4444; margin-top: 12px; font-weight: 500; }
        .security-note { background-color: #fef3c7; border-radius: 6px; padding: 15px; margin: 25px 0; font-size: 13px; color: #78350f; border-left: 4px solid #f59e0b; }
        .security-note strong { color: #92400e; }
        .footer { padding: 30px; border-top: 1px solid #e5e7eb; text-align: center; }
        .footer p { font-size: 12px; color: #9ca3af; margin: 8px 0; line-height: 1.6; }
        .footer-brand { font-weight: 600; color: #1f2937; }
        a { color: #1E40AF; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification Required</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hello,</p>
          
          <p class="message">
            Thank you for registering with 1Click Distributors. To complete your account verification and access the onboarding portal, please use the One-Time Password (OTP) below.
          </p>
          
          <div class="otp-container">
            <div class="otp-label">Your Verification Code</div>
            <div class="otp-code">${otp}</div>
            <div class="otp-expiry">⏱️ Expires in 5 minutes</div>
          </div>
          
          <div class="security-note">
            <strong>🔒 Security Notice:</strong> Never share this code with anyone. Our team will never ask for your OTP via email, phone, or other means. If you did not request this code, please disregard this email or contact our support team immediately.
          </div>
          
          <p class="message" style="margin-top: 25px;">
            If you're having trouble accessing the onboarding portal or have any questions, our support team is here to help. Please reach out to us at <a href="mailto:contact@1clickdistributors.com">support@1clickdistributors.com</a>.
          </p>
        </div>
        
        <div class="footer">
          <p style="margin-top: 0;"><span class="footer-brand">1Click Distributors</span></p>
          <p>Streamlining Distribution Excellence</p>
          <p style="margin-bottom: 0; color: #d1d5db;">© 2025 1Click Distributors. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
`,
});

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to send OTP" }), { status: 500 });
  }
}
