"use client";

import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface StatActivity {
  generator: string;
  usage: number;
}

interface Stats {
  totalFuelUsage: number;
  activeGenerators: number;
  totalGenerators: number;
  riskScore: number;
  activity: StatActivity[];
  alerts: string[];
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [generator, setGenerator] = useState("");
  const [fuel, setFuel] = useState(0);
  const [runtime, setRuntime] = useState(0);
  const [logs, setLogs] = useState<
    { generator: string; fuelUsed: number; runtime: number; suspicious: boolean; anomaly?: boolean }[]
  >([]);
  const [email, setEmail] = useState("");

  const reportRef = useRef<HTMLDivElement>(null);

  const handleAddLog = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!generator || fuel <= 0 || runtime <= 0) return;

    const efficiency = fuel / runtime;
    const suspicious = efficiency > 2.0;

    const newLog = { generator, fuelUsed: fuel, runtime, suspicious };
    setLogs((prev) => [...prev, newLog]);

    setGenerator("");
    setFuel(0);
    setRuntime(0);
  };

  const exportLogsToCSV = (
    logs: { generator: string; fuelUsed: number; runtime: number; suspicious: boolean; anomaly?: boolean }[]
  ) => {
    const headers = ["Generator", "Fuel Used (L)", "Runtime (hrs)", "Suspicious", "Anomaly"];
    const rows = logs.map((log) => [
      log.generator,
      log.fuelUsed,
      log.runtime,
      log.suspicious ? "Yes" : "No",
      log.anomaly ? "Yes" : "No",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kilomo_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`kilomo_report_${Date.now()}.pdf`);
  };

  const sendEmailReport = async () => {
    if (!email || logs.length === 0) return alert("Enter email and add logs.");

    const logTextLines = logs.map(
      (log, i) =>
        `#${i + 1}: Generator ${log.generator} - ${log.fuelUsed}L / ${log.runtime}hrs ${
          log.suspicious ? "⚠ Suspicious" : ""
        } ${log.anomaly ? "🚨 Anomaly" : ""}`
    );

    const logText = logTextLines.join("\n");

    try {
      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, logText }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Email sent successfully!");
      } else {
        alert("Error: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      if (error instanceof Error) {
        alert("Error sending email: " + error.message);
      } else {
        alert("An unexpected error occurred.");
      }
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    };

    const fetchAnomalies = async () => {
      const res = await fetch("/api/analyze-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs }),
      });
      const data = await res.json();
      const updatedLogs = logs.map((log, i) => ({
        ...log,
        anomaly: data.anomalies.includes(i),
      }));
      setLogs(updatedLogs);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const analyze = async () => {
      if (logs.length === 0) return;
      const res = await fetch("/api/analyze-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs }),
      });
      const data = await res.json();
      const updatedLogs = logs.map((log, i) => ({
        ...log,
        anomaly: data.anomalies.includes(i),
      }));
      setLogs(updatedLogs);
    };

    analyze();
  }, [logs.length]);

  if (!stats) return <div className="p-8 text-center text-lg">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-sm sm:text-base">
      {/* ... header and main unchanged until Manual Logs section ... */}

      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <h2 className="font-semibold text-lg mb-4">Manual Logs</h2>
        <ul className="space-y-2">
          {logs.map((log, index) => (
            <li key={index} className="flex justify-between border-b py-2">
              <span>{log.generator}</span>
              <span>
                {log.fuelUsed}L / {log.runtime}hrs{" "}
                {log.suspicious && <span className="text-red-600">⚠ Suspicious</span>}{" "}
                {log.anomaly && <span className="text-red-800 font-bold">🚨 Anomaly</span>}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex gap-4 mt-4 flex-wrap">
          <button
            onClick={() => exportLogsToCSV(logs)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Export as CSV
          </button>
          <button
            onClick={exportToPDF}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            Export as PDF
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <input
            type="email"
            placeholder="you@example.com"
            className="border p-2 rounded"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <button
            onClick={sendEmailReport}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Email Report
          </button>
        </div>
      </div>

      <footer className="bg-gray-800 text-white p-4 text-center w-full mt-10">
        <p>&copy; {new Date().getFullYear()} Kilomo. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
