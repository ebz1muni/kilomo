export async function detectAnomaly(log: {
    fuelUsed: number;
    runtime: number;
    expectedRate: number;
    generatorStatus: string;
    timestamp: string;
  }) {
    try {
      const response = await fetch("http://localhost:8000/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(log)
      });
  
      if (!response.ok) {
        throw new Error("Failed to detect anomaly");
      }
  
      const data = await response.json();
      return {
        riskScore: data.riskScore,
        message: data.message
      };
    } catch (error) {
      console.error("🔴 AI detection error:", error);
      return {
        riskScore: 0,
        message: "Anomaly check failed"
      };
    }
  }
  