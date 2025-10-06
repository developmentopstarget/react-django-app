import { useEffect, useState } from "react";

export default function App() {
  const [status, setStatus] = useState("Checking...");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/health/`)
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">React + Django</h1>
      <div className="p-6 rounded-2xl border shadow-sm bg-white">
        <p className="text-gray-700">Health: {status}</p>
        {error && <p className="text-red-500 mt-2">Error: {error}</p>}
      </div>
    </div>
  );
}
