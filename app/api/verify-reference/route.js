import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const { docId, referenceId } = await req.json();

    if (!docId || !referenceId) throw new Error("Missing docId or referenceId");

    const now = new Date();
    const formattedDateTime = `${String(now.getDate()).padStart(2,'0')}/${
      String(now.getMonth() + 1).padStart(2,'0')
    }/${now.getFullYear()} ${
      String(now.getHours()).padStart(2,'0')
    }:${String(now.getMinutes()).padStart(2,'0')}:${
      String(now.getSeconds()).padStart(2,'0')
    }`;

    await adminDb.collection("distributors").doc(docId).update({
      referenceId,
      referenceIdAt: formattedDateTime,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Reference Update Error:", error);
    return new Response(JSON.stringify({ error: "Failed to update reference ID" }), { status: 500 });
  }
}
