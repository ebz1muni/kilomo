import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ExportButtonsProps {
  logs: { generator: string; fuelUsed: number; runtime: number; suspicious: boolean }[];
  reportRef: React.RefObject<HTMLDivElement>;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ logs, reportRef }) => {
  // Function to export logs as CSV
  const exportLogsToCSV = () => {
    const headers = ["Generator", "Fuel Used (L)", "Runtime (hrs)", "Suspicious"];
    const rows = logs.map((log) => [
      log.generator,
      log.fuelUsed,
      log.runtime,
      log.suspicious ? "Yes" : "No",
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

  // Function to export the page as a PDF
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

  return (
    <div className="flex gap-4 mt-4 flex-wrap">
      <button
        onClick={exportLogsToCSV}
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
  );
};

export default ExportButtons;
