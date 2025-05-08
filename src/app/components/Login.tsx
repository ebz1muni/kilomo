// src/components/Login.tsx
"use client";

import { useState } from "react";
import { auth } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = isLogin
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      // Store UID (optional)
      localStorage.setItem("kilomo-uid", res.user.uid);

      // Redirect to home or dashboard
      router.push("/home");
    } catch (err: any) {
      const message = err?.message || "Authentication failed. Try again.";
      setError(message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 bg-white p-6 rounded-xl shadow-md border space-y-4">
      <h2 className="text-2xl font-bold text-center">
        {isLogin ? "Login to Kilomo" : "Create Your Kilomo Account"}
      </h2>

      <input
        type="email"
        placeholder="Email"
        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full py-3 rounded text-white font-semibold ${
          loading ? "bg-gray-600" : "bg-black hover:bg-gray-800"
        }`}
      >
        {loading
          ? isLogin
            ? "Logging in..."
            : "Creating account..."
          : isLogin
          ? "Login"
          : "Register"}
      </button>

      <p
        className="text-blue-600 text-sm text-center cursor-pointer hover:underline"
        onClick={() => {
          setIsLogin(!isLogin);
          setError("");
        }}
      >
        {isLogin
          ? "Need an account? Register here"
          : "Already have an account? Login"}
      </p>
    </div>
  );
}

