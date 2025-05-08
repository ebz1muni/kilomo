// kilomo/pages/test-ai.tsx
import { useState } from "react";

export default function TestAIPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/analyze-logs");
      const jsonData = await response.json();  // Directly parse JSON

      if (response.ok) {
        setResult(JSON.stringify(jsonData, null, 2));
      } else {
        setError(jsonData?.error || "Something went wrong");
      }
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🧠 AI Detection Test</h1>
      <button
        onClick={runTest}
        disabled={loading}
        style={{
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          background: "#000",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {loading ? "Running..." : "Run AI Test"}
      </button>

      {result && (
        <pre
          style={{
            background: "#f4f4f4",
            padding: "1rem",
            marginTop: "1rem",
            borderRadius: "8px",
            overflowX: "auto",
          }}
        >
          {result}
        </pre>
      )}

      {error && (
        <p style={{ color: "red", marginTop: "1rem" }}>❌ {error}</p>
      )}
    </div>
  );
}
