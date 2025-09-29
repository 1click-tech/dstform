import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    const docRef = adminDb.collection("otps").doc(email);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return new Response(JSON.stringify({ error: "OTP not found" }), { status: 400 });
    }

    const data = docSnap.data();

    if (Date.now() > data.expiresAt) {
      return new Response(JSON.stringify({ error: "OTP expired" }), { status: 400 });
    }

    if (otp !== data.otp) {
      return new Response(JSON.stringify({ error: "Invalid OTP" }), { status: 400 });
    }

    // Delete OTP after successful verification
    await docRef.delete();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to verify OTP" }), { status: 500 });
  }
}
