import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ArrowRight, Bell, Crosshair, Droplets, Flame, MapPin, Zap } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useLive } from "../context/LiveContext";
import { useScope } from "../context/ScopeContext";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import HudCorners from "../components/ui/HudCorners";
import WqiGauge from "../components/charts/WqiGauge";
import { PARAMS, STATUS_COLORS, getStatus } from "../utils/wqi";

const METRICS = [{ key: "wqi", label: "WQI", unit: "" }, ...PARAMS];
const tip = {
  contentStyle: { background: "rgba(6,26,43,.92)", border: "1px solid rgba(56,213,240,.3)", borderRadius: 12, color: "#fff", backdropFilter: "blur(8px)" },
  labelStyle: { color: "#7ee8fa" },
};
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
const confColor = (c) => (c >= 70 ? "#f87171" : c >= 50 ? "#fb923c" : c >= 35 ? "#facc15" : "#94a3b8");
const greet = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

function Ring({ value, color }) {
  const C = 2 * Math.PI * 22;
  const pct = Math.min(value / 150, 1);
  return (
    <div className="relative grid h-[58px] w-[58px] shrink-0 place-items-center">
      <svg width="58" height="58" viewBox="0 0 58 58" className="absolute inset-0 -rotate-90">
        <circle cx="29" cy="29" r="22" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="5" />
        <circle
          cx="29" cy="29" r="22" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
          style={{ transition: "stroke-dashoffset .9s ease", filter: `drop-shadow(0 0 5px ${color})` }}
        />
      </svg>
      <span className="text-sm font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-36" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-32" />)}</div>
      <div className="grid gap-4 lg:grid-cols-3"><div className="skeleton h-72" /><div className="skeleton h-72 lg:col-span-2" /></div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { tick, events, lastUpdate, connected } = useLive();
  const navigate = useNavigate();
  const { region, params } = useScope();

  const [summary, setSummary] = useState(null);
  const [latest, setLatest] = useState([]);
  const [alertStats, setAlertStats] = useState({ critical: 0, warning: 0, total: 0 });
  const [tracker, setTracker] = useState([]);
  const [selected, setSelected] = useState(null);
  const [metric, setMetric] = useState("wqi");
  const [series, setSeries] = useState([]);

  const load = useCallback(async () => {
    const [s, l, a, t] = await Promise.all([
      api.get("/readings/summary", { params }),
      api.get("/readings/latest", { params }),
      api.get("/alerts/stats", { params }),
      api.get("/tracker", { params }),
    ]);
    setSummary(s.data);
    setLatest(l.data);
    setAlertStats(a.data);
    setTracker(t.data);
    setSelected((prev) => (l.data.some((x) => x.station._id === prev) ? prev : l.data[0]?.station._id));
  }, [params]);

  useEffect(() => {
    load();
  }, [load, tick]);

  useEffect(() => {
    if (!selected) return;
    api.get(`/stations/${selected}/readings?days=7`).then((r) => setSeries(r.data.slice(-120)));
  }, [selected, tick]);

  const info = METRICS.find((m) => m.key === metric);
  const chartData = useMemo(
    () => series.map((r) => ({ t: new Date(r.timestamp).toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }), v: r[metric] })),
    [series, metric]
  );
  const barData = [...latest]
    .sort((a, b) => b.wqi - a.wqi)
    .slice(0, 12)
    .map((r) => ({ name: r.station.code, full: r.station.name, wqi: r.wqi, color: STATUS_COLORS[r.status] }));
  const worstSix = [...latest].sort((a, b) => b.wqi - a.wqi).slice(0, 6);
  const selectedStation = latest.find((l) => l.station._id === selected);
  const suspects = useMemo(
    () => tracker.filter((t) => t.significant && t.topSuspect).sort((a, b) => b.topSuspect.confidence - a.topSuspect.confidence).slice(0, 4),
    [tracker]
  );

  if (!summary) return <Skeleton />;
  const avgStatus = getStatus(summary.avgWqi);
  const avgColor = STATUS_COLORS[avgStatus];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Hero banner */}
      <motion.div variants={item} className="glass-strong glass-hover relative overflow-hidden p-6 sm:p-8">
        <HudCorners />
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-aqua-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-neon-violet/20 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="chip">
              <i className={`h-1.5 w-1.5 rounded-full ${connected ? "animate-pulse bg-emerald-400" : "bg-red-400"}`} />
              {connected ? "Live monitoring" : "Connecting..."}
            </span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
              {greet()}, <span className="text-gradient">{user?.name?.split(" ")[0]}</span>
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Network status: <b style={{ color: avgColor }}>{avgStatus}</b> · last update {lastUpdate ? lastUpdate.toLocaleTimeString() : "waiting for stream..."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/tracker" className="btn-neon !py-2.5 text-sm"><Crosshair size={16} /> Open tracker</Link>
            <Link to="/alerts" className="btn-ghost !py-2.5 text-sm"><Bell size={16} /> View alerts</Link>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard delay={0.1} icon={Droplets} label="Average WQI" value={summary.avgWqi} decimals={1} sub="Lower is cleaner" accent={avgColor} />
        <StatCard delay={0.18} icon={MapPin} label="Stations" value={summary.totalStations} sub={region === "all" ? "Across India" : `${region} region`} />
        <StatCard delay={0.26} icon={Bell} label="Active alerts" value={alertStats.total} sub={`${alertStats.critical} critical · ${alertStats.warning} warning`} accent="#f87171" />
        <StatCard delay={0.34} icon={Flame} label="Most polluted" value={summary.worst.name} sub={`WQI ${summary.worst.wqi}`} accent="#fb923c" />
      </div>

      {/* Gauge + trend */}
      <motion.div variants={item} className="grid gap-4 lg:grid-cols-3">
        <div className="glass glass-hover flex flex-col items-center p-6">
          <h3 className="self-start font-semibold">Overall water quality</h3>
          <div className="my-3 flex w-full justify-center"><WqiGauge value={summary.avgWqi} status={avgStatus} /></div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {Object.entries(summary.statusCounts).map(([s, n]) => (
              <span key={s} className="text-xs text-white/70"><b style={{ color: STATUS_COLORS[s] }}>{n}</b> {s}</span>
            ))}
          </div>
        </div>

        <div className="glass glass-hover p-6 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">{info.label} trend · 7 days</h3>
              <p className="text-xs text-white/50">{selectedStation?.station.name}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {METRICS.map((m) => (
                <button
                  key={m.key} onClick={() => setMetric(m.key)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${metric === m.key ? "bg-aqua-500 text-ocean-950 shadow-[0_0_16px_-2px_#38d5f0]" : "bg-white/8 text-white/70 hover:bg-white/15"}`}
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
                    <stop offset="0%" stopColor="#38d5f0" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#38d5f0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
                <XAxis dataKey="t" tick={{ fill: "rgba(255,255,255,.5)", fontSize: 11 }} minTickGap={50} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,.5)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} domain={["auto", "auto"]} />
                <Tooltip {...tip} formatter={(v) => [`${v} ${info.unit || ""}`, info.label]} />
                <Area type="monotone" dataKey="v" stroke="#38d5f0" strokeWidth={2.5} fill="url(#fillA)" animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Bar + live events */}
      <motion.div variants={item} className="grid gap-4 lg:grid-cols-3">
        <div className="glass glass-hover p-6 lg:col-span-2">
          <h3 className="mb-4 font-semibold">Highest WQI stations</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,.6)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,.5)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip {...tip} cursor={{ fill: "rgba(255,255,255,.05)" }} labelFormatter={(l, p) => p?.[0]?.payload.full || l} />
                <Bar dataKey="wqi" radius={[8, 8, 0, 0]} animationDuration={900}>
                  {barData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass glass-hover p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold"><Activity size={16} className="text-aqua-400" /> Live pollution events</h3>
          {events.length === 0 ? (
            <p className="text-sm text-white/50">No spikes detected yet. Scanning all stations...</p>
          ) : (
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {events.map((e) => (
                  <motion.li
                    key={e.id} layout initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-3 rounded-xl border border-amber-300/20 bg-amber-300/5 p-3"
                  >
                    <Zap size={16} className="mt-0.5 shrink-0 text-amber-300" />
                    <div className="text-sm">
                      <p className="font-semibold">{e.station}</p>
                      <p className="text-xs capitalize text-white/60">{e.spike} spike · WQI {e.wqi}</p>
                      <p className="font-mono text-[11px] text-white/40">{new Date(e.time).toLocaleTimeString()}</p>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </motion.div>

      {/* Suspected sources */}
      <motion.div variants={item}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold"><Crosshair size={16} className="text-neon-pink" /> Top suspected sources</h3>
          <Link to="/tracker" className="flex items-center gap-1 text-xs font-semibold text-aqua-300 hover:underline">Full tracker <ArrowRight size={13} /></Link>
        </div>
        {suspects.length === 0 ? (
          <div className="glass p-6 text-sm text-white/55">All stations show a clean signature right now.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {suspects.map((s) => {
              const c = confColor(s.topSuspect.confidence);
              return (
                <button key={s.station._id} onClick={() => navigate(`/tracker?station=${s.station._id}`)} className="glass glass-hover p-5 text-left">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-white/45">{s.station.name}</p>
                  <p className="mt-2 font-bold leading-snug">{s.topSuspect.name}</p>
                  <p className="text-xs text-white/50">{s.topSuspect.type} · {s.topSuspect.distanceKm} km</p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-white/50">confidence</span>
                    <b style={{ color: c }}>{s.topSuspect.confidence}%</b>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.topSuspect.confidence}%`, background: c, boxShadow: `0 0 10px ${c}` }} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Stations */}
      <motion.div variants={item}>
        <h3 className="mb-3 font-semibold">Most polluted stations</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {worstSix.map((r) => {
            const on = r.station._id === selected;
            const c = STATUS_COLORS[r.status];
            return (
              <button
                key={r._id} onClick={() => setSelected(r.station._id)}
                className={`glass glass-hover p-5 text-left ${on ? "ring-2 ring-aqua-400/70" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <Ring value={r.wqi} color={c} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{r.station.name}</p>
                    <p className="truncate text-xs text-white/50">{r.station.waterBody}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                  {["ph", "do", "bod", "tds"].map((k) => (
                    <div key={k} className="rounded-lg border border-white/8 bg-white/5 py-1.5">
                      <p className="font-mono text-[10px] uppercase text-white/45">{k}</p>
                      <p className="font-semibold">{r[k]}</p>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}