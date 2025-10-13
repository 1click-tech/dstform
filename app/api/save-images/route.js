import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const { docId, images } = await req.json();

    if (!docId || !images || !images.length) {
      return new Response(JSON.stringify({ error: "Invalid data" }), { status: 400 });
    }

    await adminDb.collection("distributors").doc(docId).update({
      images,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to save images" }), { status: 500 });
  }
}
