// src/components/FuelLogList.tsx
import { FuelLog } from "@/types";  // Import the FuelLog type

type FuelLogListProps = {
  logs: FuelLog[];  // Use the FuelLog type here
};

const FuelLogList: React.FC<FuelLogListProps> = ({ logs }) => {
  return (
    <div>
      {logs.map((log) => (
        <div key={log.id}>
          <h3>{log.generator}</h3>
          <p>Fuel Added: {log.fuelAdded} liters</p>
          <p>Runtime: {log.runtimeHours} hours</p>
          {log.notes && <p>Notes: {log.notes}</p>}
        </div>
      ))}
    </div>
  );
};

export default FuelLogList;
