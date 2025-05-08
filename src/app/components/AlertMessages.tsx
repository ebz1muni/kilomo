import React from "react";

interface AlertMessagesProps {
  alerts: string[];
}

const AlertMessages: React.FC<AlertMessagesProps> = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 sm:p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Alerts</h2>
      <ul className="list-disc list-inside space-y-1">
        {alerts.map((alert, index) => (
          <li key={index}>{alert}</li>
        ))}
      </ul>
    </div>
  );
};

export default AlertMessages;
