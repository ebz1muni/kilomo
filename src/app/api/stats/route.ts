import { NextResponse } from 'next/server';

type GeneratorActivity = {
  generator: string;
  usage: number;
};

const activity: GeneratorActivity[] = [
  { generator: "Generator #1", usage: 200 },
  { generator: "Generator #2", usage: 300 },
  { generator: "Generator #3", usage: 500 },
];

const SAFE_USAGE_LIMIT = 4500;

function calculateTotalFuelUsage(logs: GeneratorActivity[]): number {
  return logs.reduce((sum, g) => sum + g.usage, 0);
}

function calculateAlerts(logs: GeneratorActivity[], totalUsage: number): string[] {
  const alerts: string[] = [];

  for (const g of logs) {
    if (g.usage > 400) {
      alerts.push(`🚨 High usage detected on ${g.generator} (${g.usage}L)`);
    }
  }

  if (totalUsage > SAFE_USAGE_LIMIT) {
    alerts.push(`⚠️ Total fuel usage exceeds safe limit (${SAFE_USAGE_LIMIT}L)`);
  }

  return alerts;
}

function calculateRiskScore(totalUsage: number): number {
  const percent = (totalUsage / SAFE_USAGE_LIMIT) * 100;
  return Math.min(Math.round(percent), 100);
}

export async function GET() {
  const totalFuelUsage = calculateTotalFuelUsage(activity);
  const alerts = calculateAlerts(activity, totalFuelUsage);
  const riskScore = calculateRiskScore(totalFuelUsage);

  const response = {
    totalFuelUsage,
    activeGenerators: activity.length,
    totalGenerators: 5, // Replace with DB later
    riskScore,
    activity,
    alerts,
  };

  return NextResponse.json(response);
}
