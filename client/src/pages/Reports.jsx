import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChevronLeft, ChevronRight, Download, FileText, Printer } from "lucide-react";
import api from "../api/axios";
import { useLive } from "../context/LiveContext";
import { useScope } from "../context/ScopeContext";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import { STATUS_COLORS, getStatus } from "../utils/wqi";
import { fmtTime } from "../utils/format";

const PAGE = 15;
const RANGES = [
  { v: 1, l: "Last 24 hours" },
  { v: 3, l: "Last 3 days" },
  { v: 7, l: "Last 7 days" },
];
const STATUSES = ["all", "Excellent", "Good", "Poor", "Very Poor", "Unfit"];
const tip = {
  contentStyle: { background: "rgba(6,34,53,.92)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 12, color: "#fff" },
  labelStyle: { color: "#7ee8fa" },
};
const selectCls = "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-aqua-400/60";

export default function Reports() {
  const { tick } = useLive();
  const { params } = useScope();
  const [stations, setStations] = useState([]);
  const [station, setStation] = useState("all");
  const [range, setRange] = useState(7);
  const [status, setStatus] = useState("all");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    api.get("/stations", { params }).then((r) => setStations(r.data));
    setStation("all");
  }, [params]);

  useEffect(() => {
    const from = new Date(Date.now() - range * 864e5).toISOString();
    const qs = new URLSearchParams({ from, limit: 3000 });
    if (station !== "all") qs.set("station", station);
    else if (params.region) qs.set("region", params.region);
    api.get(`/readings?${qs}`).then((r) => setRows(r.data));
  }, [station, range, tick, params]);

  useEffect(() => setPage(0), [station, range, status]);

  const filtered = useMemo(() => rows.filter((r) => status === "all" || r.status === status), [rows, status]);

  const stats = useMemo(() => {
    if (!filtered.length) return null;
    const avg = filtered.reduce((s, r) => s + r.wqi, 0) / filtered.length;
    const worst = filtered.reduce((a, b) => (b.wqi > a.wqi ? b : a));
    return {
      count: filtered.length,
      avg: Number(avg.toFixed(1)),
      worst,
      bad: filtered.filter((r) => r.wqi > 75).length,
    };
  }, [filtered]);

  const chart = useMemo(() => {
    if (station === "all") {
      const m = {};
      filtered.forEach((r) => {
        const k = r.station?.code;
        (m[k] ||= { name: k, full: r.station?.name, sum: 0, n: 0 });
        m[k].sum += r.wqi;
        m[k].n++;
      });
      return Object.values(m).map((x) => {
        const avg = Number((x.sum / x.n).toFixed(1));
        return { name: x.name, full: x.full, wqi: avg, color: STATUS_COLORS[getStatus(avg)] };
      });
    }
    return [...filtered]
      .reverse()
      .slice(-200)
      .map((r) => ({ t: fmtTime(r.timestamp), wqi: r.wqi }));
  }, [filtered, station]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const slice = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const stationName = station === "all" ? "All stations" : stations.find((s) => s._id === station)?.name;

  const exportCsv = () => {
    const head = ["Timestamp", "Station", "Code", "WQI", "Status", "pH", "DO (mg/L)", "BOD (mg/L)", "Turbidity (NTU)", "TDS (mg/L)", "Temperature (C)", "Nitrate (mg/L)"];
    const lines = filtered.map((r) =>
      [new Date(r.timestamp).toISOString(), r.station?.name, r.station?.code, r.wqi, r.status, r.ph, r.do, r.bod, r.turbidity, r.tds, r.temperature, r.nitrate]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob(["\uFEFF" + [head.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `deltatrace-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <div className="print-only">
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>DeltaTrace Water Quality Report</h1>
        <p>{stationName} · last {range} day(s) · generated {new Date().toLocaleString()}</p>
      </div>

      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-white/55">Reading history with filters, CSV export and print</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="glass glass-hover flex items-center gap-2 px-4 py-2 text-sm font-semibold">
            <Printer size={15} /> Print
          </button>
          <button
            onClick={exportCsv}
            disabled={!filtered.length}
            className="flex items-center gap-2 rounded-2xl bg-aqua-500 px-4 py-2 text-sm font-bold text-ocean-950 transition hover:brightness-110 disabled:opacity-40"
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="no-print glass flex flex-wrap items-center gap-3 p-4">
        <select value={station} onChange={(e) => setStation(e.target.value)} className={selectCls}>
          <option value="all" className="bg-ocean-900">All stations</option>
          {stations.map((s) => (
            <option key={s._id} value={s._id} className="bg-ocean-900">{s.name}</option>
          ))}
        </select>
        <select value={range} onChange={(e) => setRange(Number(e.target.value))} className={selectCls}>
          {RANGES.map((r) => (
            <option key={r.v} value={r.v} className="bg-ocean-900">{r.l}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
          {STATUSES.map((s) => (
            <option key={s} value={s} className="bg-ocean-900">{s === "all" ? "All statuses" : s}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-white/45">{filtered.length} records</span>
      </div>

      {stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={FileText} label="Records" value={stats.count} sub={stationName} />
            <StatCard icon={FileText} label="Average WQI" value={stats.avg} sub={getStatus(stats.avg)} accent={STATUS_COLORS[getStatus(stats.avg)]} />
            <StatCard icon={FileText} label="Peak WQI" value={stats.worst.wqi} sub={`${stats.worst.station?.name}, ${fmtTime(stats.worst.timestamp)}`} accent="#fb923c" />
            <StatCard icon={FileText} label="Very Poor / Unfit" value={stats.bad} sub="readings above WQI 75" accent="#f87171" />
          </div>

          <div className="glass p-6">
            <h3 className="mb-4 font-semibold">{station === "all" ? "Average WQI by station" : `WQI over time, ${stationName}`}</h3>
            <div className="h-60">
              <ResponsiveContainer>
                {station === "all" ? (
                  <BarChart data={chart}>
                    <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,.6)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,.5)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip {...tip} cursor={{ fill: "rgba(255,255,255,.05)" }} labelFormatter={(l, p) => p?.[0]?.payload.full || l} />
                    <Bar dataKey="wqi" radius={[8, 8, 0, 0]}>
                      {chart.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <AreaChart data={chart}>
                    <defs>
                      <linearGradient id="rep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38d5f0" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#38d5f0" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
                    <XAxis dataKey="t" tick={{ fill: "rgba(255,255,255,.5)", fontSize: 11 }} minTickGap={60} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,.5)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} domain={["auto", "auto"]} />
                    <Tooltip {...tip} />
                    <Area type="monotone" dataKey="wqi" stroke="#38d5f0" strokeWidth={2.5} fill="url(#rep)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass p-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="text-xs uppercase text-white/45">
                  <tr>
                    {["Time", "Station", "WQI", "Status", "pH", "DO", "BOD", "Turb.", "TDS", "Temp", "NO3"].map((h) => (
                      <th key={h} className="pb-3 pr-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slice.map((r) => (
                    <tr key={r._id} className="border-t border-white/8">
                      <td className="py-2.5 pr-3 text-white/60">{fmtTime(r.timestamp)}</td>
                      <td className="py-2.5 pr-3 font-semibold">{r.station?.name}</td>
                      <td className="py-2.5 pr-3 font-bold" style={{ color: STATUS_COLORS[r.status] }}>{r.wqi}</td>
                      <td className="py-2.5 pr-3"><StatusBadge status={r.status} /></td>
                      <td className="py-2.5 pr-3">{r.ph}</td>
                      <td className="py-2.5 pr-3">{r.do}</td>
                      <td className="py-2.5 pr-3">{r.bod}</td>
                      <td className="py-2.5 pr-3">{r.turbidity}</td>
                      <td className="py-2.5 pr-3">{r.tds}</td>
                      <td className="py-2.5 pr-3">{r.temperature}</td>
                      <td className="py-2.5 pr-3">{r.nitrate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="no-print mt-4 flex items-center justify-between text-sm text-white/60">
              <span>Page {page + 1} of {pages}</span>
              <div className="flex gap-2">
                <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="glass glass-hover grid h-9 w-9 place-items-center disabled:opacity-30">
                  <ChevronLeft size={16} />
                </button>
                <button disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} className="glass glass-hover grid h-9 w-9 place-items-center disabled:opacity-30">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="glass grid place-items-center p-12 text-center">
          <FileText size={32} className="text-white/40" />
          <p className="mt-3 font-semibold">No records match these filters</p>
        </div>
      )}
    </div>
  );
}