// src/logs/getFuelLogs.ts
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FuelLog } from "@/types";  // Import the FuelLog type

export async function getFuelLogs(userId: string): Promise<FuelLog[]> {
  const logsRef = collection(db, "fuelLogs");
  const q = query(logsRef, where("userId", "==", userId));

  const querySnapshot = await getDocs(q);
  const logs: FuelLog[] = [];

  querySnapshot.forEach((doc) => {
    logs.push({
      id: doc.id,
      ...(doc.data() as Omit<FuelLog, "id">),  // Typecast the data without the `id`
    });
  });

  return logs;
}
