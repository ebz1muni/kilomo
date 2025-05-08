// src/components/ExportButtons.tsx

import React from 'react';
import { convertToCSV } from '../utils/csvUtils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Log {
  generator: string;
  fuelUsed: number;
  runtime: number;
  suspicious: boolean;
}

interface ExportButtonsProps {
  logs: Log[];
  reportRef: React.RefObject<HTMLDivElement>;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ logs, reportRef }) => {
  const exportLogsToCSV = () => {
    const csvData = convertToCSV(logs);

    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvData}`);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kilomo_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
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
