// app/utils/fuelAnalysis.ts

interface Log {
    generator: string;
    fuelUsed: number;
    runtime: number;
    efficiency: number;
  }
  
  export function runAnomalyCheck(logs: Log[]) {
    const mean = calculateMean(logs);
    const stdDev = calculateStdDev(logs, mean);
    return logs.map((log) => {
      const zScore = (log.efficiency - mean) / stdDev;
      const suspicious = zScore > 2; // Flag as suspicious if Z-score is greater than 2
      return { ...log, suspicious };
    });
  }
  
  function calculateMean(logs: Log[]): number {
    const total = logs.reduce((sum, log) => sum + log.efficiency, 0);
    return total / logs.length;
  }
  
  function calculateStdDev(logs: Log[], mean: number): number {
    const variance = logs.reduce((sum, log) => sum + Math.pow(log.efficiency - mean, 2), 0) / logs.length;
    return Math.sqrt(variance);
  }
  