import React, { useState } from "react";

interface ManualLogInputProps {
  onAddLog: (log: { generator: string; fuelUsed: number; runtime: number; suspicious: boolean }) => void;
}

const ManualLogInput: React.FC<ManualLogInputProps> = ({ onAddLog }) => {
  const [generator, setGenerator] = useState<string>("");
  const [fuel, setFuel] = useState<number>(0);
  const [runtime, setRuntime] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!generator || fuel <= 0 || runtime <= 0) return;

    const efficiency = fuel / runtime;
    const suspicious = efficiency > 2.0; // Example rule to flag suspicious log

    // Pass the new log to parent (Dashboard) via onAddLog
    onAddLog({ generator, fuelUsed: fuel, runtime, suspicious });

    // Clear form fields
    setGenerator("");
    setFuel(0);
    setRuntime(0);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded shadow">
      <h2 className="font-semibold text-lg mb-4">Log Generator Activity</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input
          type="text"
          value={generator}
          onChange={(e) => setGenerator(e.target.value)}
          placeholder="Generator ID"
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          value={fuel}
          onChange={(e) => setFuel(parseFloat(e.target.value))}
          placeholder="Fuel Used (L)"
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          value={runtime}
          onChange={(e) => setRuntime(parseFloat(e.target.value))}
          placeholder="Runtime (hrs)"
          className="border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white col-span-1 sm:col-span-3 py-2 rounded hover:bg-blue-700"
        >
          Add Log
        </button>
      </form>
    </div>
  );
};

export default ManualLogInput;
