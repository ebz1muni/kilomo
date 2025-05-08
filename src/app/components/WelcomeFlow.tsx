import { useState } from "react";

export default function WelcomeFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);

  const next = () => setStep((s) => s + 1);
  const skip = () => onComplete();

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-6 space-y-4 text-gray-800">
      {step === 1 && (
        <>
          <h2 className="text-2xl font-bold">👋 Welcome to Kilomo</h2>
          <p>This dashboard helps you detect and prevent generator fuel theft with AI.</p>
          <button onClick={next} className="bg-blue-600 text-white px-4 py-2 rounded-xl w-full">Next</button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-xl font-bold">🛠 Step 1: Add a Generator</h2>
          <p>Name it and tell us where it's located. This helps track usage by site.</p>
          <button onClick={next} className="bg-blue-600 text-white px-4 py-2 rounded-xl w-full mt-2">Next</button>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-xl font-bold">⛽ Step 2: Log Fuel Usage</h2>
          <p>Start adding fuel usage and runtime logs. AI will flag anything suspicious.</p>
          <button onClick={next} className="bg-blue-600 text-white px-4 py-2 rounded-xl w-full mt-2">Next</button>
        </>
      )}

      {step === 4 && (
        <>
          <h2 className="text-xl font-bold">📱 Step 3: Get WhatsApp Alerts</h2>
          <p>Enable notifications so you're alerted the moment suspicious activity happens.</p>
          <div className="flex gap-2 mt-4">
            <button onClick={onComplete} className="bg-green-600 text-white px-4 py-2 rounded-xl w-full">Done</button>
            <button onClick={skip} className="text-gray-500 w-full">Skip</button>
          </div>
        </>
      )}
    </div>
  );
}
