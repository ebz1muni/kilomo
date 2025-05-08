// src/app/components/AddLogForm.tsx
'use client';

import { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default function AddLogForm() {
  const [generator, setGenerator] = useState('');
  const [fuelUsed, setFuelUsed] = useState('');
  const [runtime, setRuntime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await addDoc(collection(db, 'fuelLogs'), {
        generator,
        fuelUsed: parseFloat(fuelUsed),
        runtime: parseFloat(runtime),
        timestamp: Timestamp.now(),
      });

      setGenerator('');
      setFuelUsed('');
      setRuntime('');
      setSuccess(true);
    } catch (err) {
      console.error('Error adding log:', err);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4">
      <h2 className="text-lg font-semibold">➕ Add New Fuel Log</h2>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Generator name"
          value={generator}
          onChange={(e) => setGenerator(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="number"
          placeholder="Fuel used (litres)"
          value={fuelUsed}
          onChange={(e) => setFuelUsed(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="number"
          placeholder="Runtime (hours)"
          value={runtime}
          onChange={(e) => setRuntime(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl w-full"
      >
        {loading ? 'Saving...' : 'Submit Log'}
      </button>

      {success && <p className="text-green-600 text-sm">Log added successfully!</p>}
    </form>
  );
}
