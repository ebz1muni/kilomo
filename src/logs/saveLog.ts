import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function saveFuelLog(
  userId: string,
  log: {
    generator: string;
    fuelAdded: number;
    runtimeHours: number;
    notes?: string;
  }
) {
  try {
    // Step 1: Call the AI anomaly detection API
    const aiResponse = await fetch("/api/ai/analyze-log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, ...log }),
    });

    const { anomaly, confidence, message } = await aiResponse.json();

    // Step 2: Attach AI result to the log data
    const ref = collection(db, "users", userId, "fuelLogs");
    await addDoc(ref, {
      ...log,
      anomaly,
      confidence,
      aiMessage: message,
      createdAt: serverTimestamp(),
    });

    console.log("Fuel log saved successfully.");
  } catch (err) {
    console.error("Error saving fuel log:", err);
    throw err;
  }
}
