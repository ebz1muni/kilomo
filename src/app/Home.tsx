// src/app/Home.tsx
import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import ExportButtons from './components/ExportButtons';
import WelcomeFlow from './components/WelcomeFlow';
import AddLogForm from './components/AddLogForm';
import { notifyFuelTheft } from '@/app/api/stats/notifications/whatsappService';

interface StatActivity {
  generator: string;
  usage: number;
  suspicious: boolean;
}

interface Stats {
  totalFuelUsage: number;
  activeGenerators: number;
  totalGenerators: number;
  riskScore: number;
  activity: StatActivity[];
  alerts: string[];
}

interface Log {
  timestamp: any;
  generator: string;
  fuelUsed: number;
  runtime: number;
  suspicious: boolean;
  location: string;
  generatorType?: 'small' | 'medium' | 'large';
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  const detectAnomalies = (
    fuelUsed: number,
    runtime: number,
    generatorType: 'small' | 'medium' | 'large' = 'medium'
  ) => {
    const expectedRates = {
      small: 1.2,
      medium: 2.5,
      large: 4.0,
    };

    const efficiency = fuelUsed / runtime;
    const expectedEfficiency = expectedRates[generatorType];
    let suspicious = efficiency > expectedEfficiency * 1.5;

    const threshold = 3;
    if (fuelUsed > threshold * expectedEfficiency * runtime) {
      suspicious = true;
    }

    return suspicious;
  };

  useEffect(() => {
    const seen = localStorage.getItem('seenWelcome');
    if (seen) setShowWelcome(false);
  }, []);

  const handleWelcomeComplete = () => {
    localStorage.setItem('seenWelcome', 'true');
    setShowWelcome(false);
  };

  useEffect(() => {
    const logsCollection = collection(db, 'fuelLogs');
    const logsQuery = query(logsCollection, orderBy('timestamp'));

    const unsubscribe = onSnapshot(logsQuery, async (snapshot) => {
      const logsData = snapshot.docs.map((doc) => doc.data() as Log);

      const analyzedLogs: Log[] = [];

      for (const log of logsData) {
        const generatorType = log.generatorType || 'medium';
        const isSuspicious = detectAnomalies(
          log.fuelUsed,
          log.runtime,
          generatorType
        );

        const prevLog = logs.find(
          (l) => l.generator === log.generator && l.timestamp === log.timestamp
        );
        if (!prevLog || (!prevLog.suspicious && isSuspicious)) {
          await notifyFuelTheft(
            `🚨 Suspicious fuel activity detected!\n\nGenerator: ${log.generator}\nLocation: ${log.location}\nFuel Used: ${log.fuelUsed}L\nRuntime: ${log.runtime}hrs`
          );
        }

        analyzedLogs.push({ ...log, suspicious: isSuspicious });
      }

      setLogs(analyzedLogs);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setStats({
      totalFuelUsage: logs.reduce((sum, log) => sum + log.fuelUsed, 0),
      activeGenerators: logs.filter((log) => log.suspicious).length,
      totalGenerators: logs.length,
      riskScore: logs.length
        ? Math.min(
            100,
            Math.round(
              (logs.filter((log) => log.suspicious).length / logs.length) * 100
            )
          )
        : 0,
      activity: logs.map((log) => ({
        generator: log.generator,
        usage: log.fuelUsed,
        suspicious: log.suspicious,
      })),
      alerts: logs
        .filter((log) => log.suspicious)
        .map(
          (log) =>
            `Suspicious activity detected in ${log.generator} at ${log.location}`
        ),
    });
  }, [logs]);

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <WelcomeFlow onComplete={handleWelcomeComplete} />
      </div>
    );
  }

  if (!stats)
    return <div className="p-8 text-center text-lg">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-sm sm:text-base">
      <header className="w-full bg-blue-600 text-white p-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Kilomo Dashboard</h1>
        <p className="mt-1 sm:mt-2">AI-powered Fuel Theft Detection System</p>
      </header>

      <main className="w-full max-w-4xl p-4 sm:p-8 space-y-6" ref={reportRef}>
        <AddLogForm />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 sm:p-6 rounded shadow">
            <h2 className="font-semibold">Total Fuel Usage</h2>
            <p className="mt-2 text-xl sm:text-2xl">{stats.totalFuelUsage}L</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded shadow">
            <h2 className="font-semibold">Generators in Operation</h2>
            <p className="mt-2 text-xl sm:text-2xl">
              {stats.activeGenerators}/{stats.totalGenerators}
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded shadow">
            <h2 className="font-semibold">Risk Score</h2>
            <p
              className={`mt-2 text-xl sm:text-2xl ${
                stats.riskScore > 70 ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {stats.riskScore}%
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded shadow">
          <h2 className="font-semibold text-lg">Recent Fuel Usage Activity</h2>
          <ul className="mt-3 space-y-2">
            {stats.activity.map((entry, index) => (
              <li
                key={index}
                className={`flex justify-between ${
                  entry.suspicious
                    ? 'bg-red-100 text-red-600'
                    : 'text-green-600'
                }`}
              >
                <span>{entry.generator}</span>
                <span>{`+${entry.usage}L`}</span>
              </li>
            ))}
          </ul>
        </div>

        {stats.alerts.length > 0 && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 sm:p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Alerts</h2>
            <ul className="list-disc list-inside space-y-1">
              {stats.alerts.map((alert, index) => (
                <li key={index}>{alert}</li>
              ))}
            </ul>
          </div>
        )}

        {reportRef.current && (
          <ExportButtons
            logs={logs}
            reportRef={reportRef as React.RefObject<HTMLDivElement>}
          />
        )}
      </main>

      <footer className="bg-gray-800 text-white p-4 text-center w-full mt-10">
        <p>&copy; {new Date().getFullYear()} Kilomo. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
