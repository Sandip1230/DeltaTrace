import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Check, CheckCircle2, Eye, RefreshCw, ShieldAlert } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useLive } from "../context/LiveContext";
import { useScope } from "../context/ScopeContext";
import StatCard from "../components/ui/StatCard";
import { fmtTime, timeAgo } from "../utils/format";

const TABS = [
  { id: "active", label: "Active" },
  { id: "resolved", label: "Resolved" },
  { id: "all", label: "All" },
];
const SEV = ["all", "critical", "warning"];

export default function Alerts() {
  const { user } = useAuth();
  const { tick } = useLive();
  const { params } = useScope();
  const nav = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [tab, setTab] = useState("active");
  const [sev, setSev] = useState("all");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api.get("/alerts?limit=200", { params }).then((r) => setAlerts(r.data)), [params]);
  useEffect(() => {
    load();
  }, [load, tick]);

  const act = async (id, action) => {
    await api.patch(`/alerts/${id}/${action}`);
    load();
  };

  const runCheck = async () => {
    setBusy(true);
    await api.post("/alerts/sync");
    await load();
    setBusy(false);
  };

  const counts = useMemo(
    () => ({
      critical: alerts.filter((a) => a.status !== "resolved" && a.severity === "critical").length,
      warning: alerts.filter((a) => a.status !== "resolved" && a.severity === "warning").length,
      ack: alerts.filter((a) => a.status === "acknowledged").length,
      resolved: alerts.filter((a) => a.status === "resolved").length,
    }),
    [alerts]
  );

  const list = alerts.filter((a) => {
    const tabOk = tab === "all" || (tab === "active" ? a.status !== "resolved" : a.status === "resolved");
    const sevOk = sev === "all" || a.severity === sev;
    return tabOk && sevOk;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-sm text-white/55">Threshold breaches detected from live readings</p>
        </div>
        {user?.role === "admin" && (
          <button onClick={runCheck} disabled={busy} className="glass glass-hover flex items-center gap-2 px-4 py-2 text-sm font-semibold">
            <RefreshCw size={15} className={busy ? "animate-spin" : ""} /> Run check
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ShieldAlert} label="Critical" value={counts.critical} accent="#f87171" />
        <StatCard icon={AlertTriangle} label="Warnings" value={counts.warning} accent="#facc15" />
        <StatCard icon={Eye} label="Acknowledged" value={counts.ack} accent="#38d5f0" />
        <StatCard icon={CheckCircle2} label="Resolved" value={counts.resolved} accent="#34d399" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="glass flex gap-1 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition ${tab === t.id ? "bg-aqua-500 text-ocean-950" : "text-white/65 hover:text-white"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {SEV.map((s) => (
            <button
              key={s}
              onClick={() => setSev(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${sev === s ? "bg-white/90 text-ocean-950" : "bg-white/8 text-white/70 hover:bg-white/15"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {list.map((a) => {
          const crit = a.severity === "critical";
          const c = a.status === "resolved" ? "#34d399" : crit ? "#f87171" : "#facc15";
          const Icon = a.status === "resolved" ? CheckCircle2 : crit ? ShieldAlert : AlertTriangle;
          return (
            <div key={a._id} className="glass glass-hover flex flex-wrap items-center gap-4 p-4" style={{ borderLeft: `4px solid ${c}` }}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: `${c}22`, color: c }}>
                <Icon size={22} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{a.station?.name}</p>
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-bold uppercase" style={{ color: c, background: `${c}22` }}>
                    {a.status === "resolved" ? "resolved" : a.severity}
                  </span>
                  {a.status === "acknowledged" && <span className="rounded-full bg-aqua-500/20 px-2 py-0.5 text-[11px] font-bold uppercase text-aqua-300">acknowledged</span>}
                </div>
                <p className="mt-0.5 text-sm text-white/70">{a.message}</p>
                <p className="mt-0.5 text-xs text-white/40" title={fmtTime(a.createdAt)}>Raised {timeAgo(a.createdAt)}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => nav(`/tracker?station=${a.station?._id}`)} className="rounded-xl bg-white/8 px-3 py-2 text-xs font-semibold hover:bg-white/15">
                  Trace source
                </button>
                {a.status === "open" && (
                  <button onClick={() => act(a._id, "acknowledge")} className="flex items-center gap-1 rounded-xl bg-aqua-500/20 px-3 py-2 text-xs font-semibold text-aqua-300 hover:bg-aqua-500/30">
                    <Eye size={13} /> Acknowledge
                  </button>
                )}
                {a.status !== "resolved" && (
                  <button onClick={() => act(a._id, "resolve")} className="flex items-center gap-1 rounded-xl bg-emerald-400/20 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-400/30">
                    <Check size={13} /> Resolve
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {!list.length && (
          <div className="glass grid place-items-center p-12 text-center">
            <CheckCircle2 size={34} className="text-emerald-300" />
            <p className="mt-3 font-semibold">All clear</p>
            <p className="text-sm text-white/50">No alerts match this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}