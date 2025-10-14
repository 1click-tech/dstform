import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const formData = await req.json();

    // Get last distributor number
    const counterDoc = adminDb.collection("counters").doc("distributor");
    const counterSnap = await counterDoc.get();
    let lastNumber = 0;
    if (counterSnap.exists) {
      lastNumber = counterSnap.data().lastNumber || 0;
    }

    // Increment
    const newNumber = lastNumber + 1;
    const newId = `DP${String(newNumber).padStart(5, "0")}`;

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

    // Save distributor with custom ID
    await adminDb.collection("distributors").doc(newId).set({
      ...formData,
      docId: newId,
      createdAt: formattedDateTime,
      referenceId: null,
      referenceIdAt: null,
    });

    // Update counter
    await counterDoc.set({ lastNumber: newNumber }, { merge: true });

    return new Response(JSON.stringify({ success: true, docId: newId }), { status: 200 });

  } catch (error) {
    console.error("Form Save Error:", error);
    return new Response(JSON.stringify({ error: "Failed to save form" }), { status: 500 });
  }
}
