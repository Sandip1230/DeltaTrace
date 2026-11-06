import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import useLiveStream from "../hooks/useLiveStream";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [ticks, setTicks] = useState(0);

  const load = useCallback(() => api.get("/readings/summary").then((r) => setSummary(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const connected = useLiveStream(() => {
    setTicks((t) => t + 1);
    load();
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hello, {user?.name}</h1>
        <button onClick={logout} className="glass px-4 py-2 text-sm">Logout</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass glass-hover p-5"><p className="text-sm opacity-70">Avg WQI</p><p className="text-3xl font-bold">{summary?.avgWqi ?? "-"}</p></div>
        <div className="glass glass-hover p-5"><p className="text-sm opacity-70">Stations</p><p className="text-3xl font-bold">{summary?.totalStations ?? "-"}</p></div>
        <div className="glass glass-hover p-5">
          <p className="text-sm opacity-70">Live stream</p>
          <p className="text-3xl font-bold">{connected ? "On" : "Off"}</p>
          <p className="text-xs opacity-60">{ticks} updates received</p>
        </div>
      </div>
    </div>
  );
}