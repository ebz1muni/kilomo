// notify.js
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { firebaseConfig } from "@/lib/firebase";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import fetch from "node-fetch"; // in case it's not global in your Node runtime

// Firebase init
if (!getApps().length) initializeApp(firebaseConfig);
const db = getFirestore();

// Chart.js setup
const width = 600;
const height = 400;
const chartCanvas = new ChartJSNodeCanvas({ width, height });

function formatLogTime(timestamp) {
  return new Date(timestamp?.seconds * 1000).toLocaleTimeString();
}

async function generateChartImage(logs) {
  const labels = logs.map((l) => formatLogTime(l.timestamp));
  const data = logs.map((l) => l.fuelUsed || 0);

  const image = await chartCanvas.renderToBuffer({
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Fuel Used (L)",
          data,
          backgroundColor: logs.map((l) =>
            l.riskScore > 70 ? "rgba(255, 99, 132, 0.7)" : "rgba(75, 192, 192, 0.7)"
          ),
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Fuel Usage Snapshot",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  return image.toString("base64");
}

// Main handler
export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const isWeekly = req.query.type === "weekly";
  const results = [];

  // Fetch all users with WhatsApp alerts enabled
  const userSnapshot = await getDocs(
    query(collection(db, "users"), where("whatsappAlerts", "==", true))
  );

  for (const userDoc of userSnapshot.docs) {
    const userId = userDoc.id;
    const { phoneNumber } = userDoc.data();
    if (!phoneNumber) continue;

    // Fetch logs for this user
    const q = query(collection(db, "fuelLogs"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map((doc) => doc.data());

    const totalFuel = logs.reduce((sum, l) => sum + (l.fuelUsed || 0), 0);
    const totalGens = new Set(logs.map((l) => l.generatorId)).size;
    const activeGens = new Set(
      logs.filter((l) => l.generatorStatus === "on").map((l) => l.generatorId)
    ).size;

    let message = "";
    let riskyLogs = [];

    if (isWeekly) {
      message = `📊 *Weekly Fuel Report*\n\nFuel Used: ${totalFuel}L\nActive Gens: ${activeGens}/${totalGens}`;
    } else {
      riskyLogs = logs.filter((l) => l.riskScore && l.riskScore > 70);
      if (riskyLogs.length > 0) {
        message = `🚨 *ALERT: ${riskyLogs.length} suspicious fuel logs for ${userId} today.* Please review.`;
      } else {
        message = `✅ No major anomalies for ${userId} today.`;
      }
    }

    try {
      // 1. Send the message
      const textBody = new URLSearchParams({
        token: process.env.ULTRA_MSG_TOKEN,
        to: phoneNumber,
        body: message,
      });

      const msgResponse = await fetch(
        `https://api.ultramsg.com/instance${process.env.ULTRA_MSG_INSTANCE}/messages/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: textBody,
        }
      );

      const msgData = await msgResponse.text();
      console.log(`✅ Message sent to ${phoneNumber}: ${msgData}`);

      // 2. Send the chart (only if risky logs exist or if it's weekly)
      const logsToChart = isWeekly ? logs : riskyLogs;
      if (logsToChart.length > 0) {
        const base64Chart = await generateChartImage(logsToChart);

        const imageBody = new URLSearchParams({
          token: process.env.ULTRA_MSG_TOKEN,
          to: phoneNumber,
          image: `data:image/png;base64,${base64Chart}`,
          caption: "📈 Fuel usage snapshot",
        });

        const chartResponse = await fetch(
          `https://api.ultramsg.com/instance${process.env.ULTRA_MSG_INSTANCE}/messages/image`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: imageBody,
          }
        );

        const chartData = await chartResponse.text();
        console.log(`📤 Chart sent to ${phoneNumber}: ${chartData}`);
      }

      results.push({ userId, phoneNumber, status: "success" });
    } catch (error) {
      console.error(`❌ Failed for ${phoneNumber}:`, error.message);
      results.push({ userId, phoneNumber, status: "error", error: error.message });
    }
  }

  res.status(200).json({ success: true, results });
}
