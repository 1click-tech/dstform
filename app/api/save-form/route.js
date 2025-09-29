import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const formData = await req.json();

    // 🔹 Get last distributor number
    const counterDoc = adminDb.collection("counters").doc("distributor");
    const counterSnap = await counterDoc.get();
    let lastNumber = 0;
    if (counterSnap.exists) {
      lastNumber = counterSnap.data().lastNumber || 0;
    }

    // 🔹 Increment
    const newNumber = lastNumber + 1;
    const newId = `DP${String(newNumber).padStart(5, "0")}`; // DP00001

    // 🔹 Current date & time
    const now = new Date();
    const formattedDateTime = `${String(now.getDate()).padStart(2,'0')}/${
      String(now.getMonth() + 1).padStart(2,'0')
    }/${now.getFullYear()} ${
      String(now.getHours()).padStart(2,'0')
    }:${String(now.getMinutes()).padStart(2,'0')}:${
      String(now.getSeconds()).padStart(2,'0')
    }`;

    // 🔹 Save distributor with custom ID
    await adminDb.collection("distributors").doc(newId).set({
      ...formData,
      docId: newId,
      createdAt: formattedDateTime,
      referenceId: null,
      referenceIdAt: null,
    });

    // 🔹 Update counter
    await counterDoc.set({ lastNumber: newNumber }, { merge: true });

    return new Response(JSON.stringify({ success: true, docId: newId }), { status: 200 });

  } catch (error) {
    console.error("Form Save Error:", error);
    return new Response(JSON.stringify({ error: "Failed to save form" }), { status: 500 });
  }
}
