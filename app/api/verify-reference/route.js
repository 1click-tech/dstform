import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const { docId, referenceId } = await req.json();

    if (!docId || !referenceId) throw new Error("Missing docId or referenceId");

   const now = new Date();
const istDate = new Date(
  now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
);

const formattedDateTime = `${String(istDate.getDate()).padStart(2, '0')}/${
  String(istDate.getMonth() + 1).padStart(2, '0')
}/${istDate.getFullYear()} ${
  String(istDate.getHours()).padStart(2, '0')
}:${String(istDate.getMinutes()).padStart(2, '0')}:${
  String(istDate.getSeconds()).padStart(2, '0')
}`;

console.log(formattedDateTime);

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
