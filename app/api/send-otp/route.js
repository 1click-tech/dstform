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
  from: `"Distributors Onboarding Form" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Your OTP Code for Distributor Onboarding",
  html: `
    <div style="font-family: Arial, sans-serif; color: #333; line-height:1.5;">
      <h2 style="color: #1E40AF;">Welcome to Distributor Onboarding!</h2>
      <p>Hi there,</p>
      <p>Use the following <strong>OTP code</strong> to verify your email. This code is valid for <strong>5 minutes</strong>.</p>
      <div style="margin: 20px 0; padding: 15px; background-color: #E0F2FE; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 8px;">
        ${otp}
      </div>
      <p>If you did not request this OTP, please ignore this email.</p>
      <p style="margin-top:20px; font-size:12px; color: #555;">Distributors Onboarding Team</p>
    </div>
  `,
});

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to send OTP" }), { status: 500 });
  }
}
