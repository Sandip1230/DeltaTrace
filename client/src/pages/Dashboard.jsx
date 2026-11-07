import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Activity, Bell, Droplets, Flame, MapPin, Zap } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useLive } from "../context/LiveContext";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import WqiGauge from "../components/charts/WqiGauge";
import { PARAMS, STATUS_COLORS } from "../utils/wqi";

const METRICS = [{ key: "wqi", label: "WQI", unit: "" }, ...PARAMS];
const tip = {
  contentStyle: { background: "rgba(6,34,53,.92)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 12, color: "#fff" },
  labelStyle: { color: "#7ee8fa" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { tick, events, lastUpdate } = useLive();

  const [summary, setSummary] = useState(null);
  const [latest, setLatest] = useState([]);
  const [alertStats, setAlertStats] = useState({ critical: 0, warning: 0, total: 0 });
  const [selected, setSelected] = useState(null);
  const [metric, setMetric] = useState("wqi");
  const [series, setSeries] = useState([]);

  const load = useCallback(async () => {
    const [s, l, a] = await Promise.all([
      api.get("/readings/summary"),
      api.get("/readings/latest"),
      api.get("/alerts/stats"),
    ]);
    setSummary(s.data);
    setLatest(l.data);
    setAlertStats(a.data);
    setSelected((prev) => prev || l.data[0]?.station._id);
  }, []);

  useEffect(() => {
    load();
  }, [load, tick]);

  useEffect(() => {
    if (!selected) return;
    api.get(`/stations/${selected}/readings?days=7`).then((r) => setSeries(r.data.slice(-120)));
  }, [selected, tick]);

  const info = METRICS.find((m) => m.key === metric);
  const chartData = useMemo(
    () =>
      series.map((r) => ({
        t: new Date(r.timestamp).toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }),
        v: r[metric],
      })),
    [series, metric]
  );
  const barData = latest.map((r) => ({ name: r.station.code, full: r.station.name, wqi: r.wqi, color: STATUS_COLORS[r.status] }));
  const selectedStation = latest.find((l) => l.station._id === selected);
  const avgStatus = summary
    ? summary.avgWqi <= 25 ? "Excellent" : summary.avgWqi <= 50 ? "Good" : summary.avgWqi <= 75 ? "Poor" : summary.avgWqi <= 100 ? "Very Poor" : "Unfit"
    : "Good";

  if (!summary) return <p className="p-10 text-center text-white/60">Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hello, {user?.name}</h1>
        <p className="text-sm text-white/55">
          Last live update: {lastUpdate ? lastUpdate.toLocaleTimeString() : "waiting for first update..."}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Droplets} label="Average WQI" value={summary.avgWqi} sub="Lower is cleaner" accent={STATUS_COLORS[avgStatus]} />
        <StatCard icon={MapPin} label="Monitoring stations" value={summary.totalStations} sub="Hooghly, Adi Ganga, canals" />
        <StatCard icon={Bell} label="Active alerts" value={alertStats.total} sub={`${alertStats.critical} critical, ${alertStats.warning} warning`} accent="#f87171" />
        <StatCard icon={Flame} label="Most polluted" value={summary.worst.name} sub={`WQI ${summary.worst.wqi}`} accent="#fb923c" />
      </div>

      {/* Gauge + trend */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass flex flex-col items-center p-6">
          <h3 className="self-start font-semibold">Overall water quality</h3>
          <div className="my-3 flex w-full justify-center">
            <WqiGauge value={summary.avgWqi} status={avgStatus} />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(summary.statusCounts).map(([s, n]) => (
              <span key={s} className="text-xs text-white/70">
                <b style={{ color: STATUS_COLORS[s] }}>{n}</b> {s}
              </span>
            ))}
          </div>
        </div>

        <div className="glass p-6 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">{info.label} trend, last 7 days</h3>
              <p className="text-xs text-white/50">{selectedStation?.station.name}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMetric(m.key)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    metric === m.key ? "bg-aqua-500 text-ocean-950" : "bg-white/8 text-white/70 hover:bg-white/15"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fillA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38d5f0" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#38d5f0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
                <XAxis dataKey="t" tick={{ fill: "rgba(255,255,255,.5)", fontSize: 11 }} minTickGap={50} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,.5)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} domain={["auto", "auto"]} />
                <Tooltip {...tip} formatter={(v) => [`${v} ${info.unit || ""}`, info.label]} />
                <Area type="monotone" dataKey="v" stroke="#38d5f0" strokeWidth={2.5} fill="url(#fillA)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bar + live events */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass p-6 lg:col-span-2">
          <h3 className="mb-4 font-semibold">WQI by station (latest)</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,.6)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,.5)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip {...tip} cursor={{ fill: "rgba(255,255,255,.05)" }} labelFormatter={(l, p) => p?.[0]?.payload.full || l} />
                <Bar dataKey="wqi" radius={[8, 8, 0, 0]}>
                  {barData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Activity size={16} className="text-aqua-400" /> Live pollution events
          </h3>
          {events.length === 0 ? (
            <p className="text-sm text-white/50">No spikes detected yet. Monitoring all stations...</p>
          ) : (
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.id} className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
                  <Zap size={16} className="mt-0.5 shrink-0 text-amber-300" />
                  <div className="text-sm">
                    <p className="font-semibold">{e.station}</p>
                    <p className="text-xs capitalize text-white/60">
                      {e.spike} spike, WQI {e.wqi}
                    </p>
                    <p className="text-[11px] text-white/40">{new Date(e.time).toLocaleTimeString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Station cards */}
      <div>
        <h3 className="mb-3 font-semibold">Stations</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((r) => {
            const on = r.station._id === selected;
            return (
              <button
                key={r._id}
                onClick={() => setSelected(r.station._id)}
                className={`glass glass-hover p-5 text-left ${on ? "ring-2 ring-aqua-400/70" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{r.station.name}</p>
                    <p className="text-xs text-white/50">{r.station.waterBody}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-3 text-3xl font-bold" style={{ color: STATUS_COLORS[r.status] }}>{r.wqi}</p>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                  {["ph", "do", "bod", "tds"].map((k) => (
                    <div key={k} className="rounded-lg bg-white/5 py-1.5">
                      <p className="text-white/45 uppercase">{k}</p>
                      <p className="font-semibold">{r[k]}</p>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}