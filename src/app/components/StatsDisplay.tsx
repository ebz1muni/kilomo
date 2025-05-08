import React from "react";

interface Stats {
  totalFuelUsage: number;
  activeGenerators: number;
  totalGenerators: number;
  riskScore: number;
  activity: StatActivity[];
  alerts: string[];
}

interface StatActivity {
  generator: string;
  usage: number;
}

interface StatsDisplayProps {
  stats: Stats;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total Fuel Usage */}
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <h2 className="font-semibold">Total Fuel Usage</h2>
        <p className="mt-2 text-xl sm:text-2xl">{stats.totalFuelUsage}L</p>
      </div>

      {/* Generators in Operation */}
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <h2 className="font-semibold">Generators in Operation</h2>
        <p className="mt-2 text-xl sm:text-2xl">
          {stats.activeGenerators}/{stats.totalGenerators}
        </p>
      </div>

      {/* Risk Score */}
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <h2 className="font-semibold">Risk Score</h2>
        <p
          className={`mt-2 text-xl sm:text-2xl ${
            stats.riskScore > 70 ? "text-red-600" : "text-green-600"
          }`}
        >
          {stats.riskScore}%
        </p>
      </div>
    </div>
  );
};

export default StatsDisplay;
