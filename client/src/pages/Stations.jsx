import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip as MapTip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Factory, Search } from "lucide-react";
import api from "../api/axios";
import { useLive } from "../context/LiveContext";
import { useScope } from "../context/ScopeContext";
import StatusBadge from "../components/ui/StatusBadge";
import { PARAMS, STATUS_COLORS } from "../utils/wqi";
import { timeAgo } from "../utils/format";

function FlyTo({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 10, { duration: 0.8 });
  }, [lat, lng, map]);
  return null;
}

export default function Stations() {
  const { tick } = useLive();
  const { params } = useScope();
  const [latest, setLatest] = useState([]);
  const [sources, setSources] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [series, setSeries] = useState([]);
  const [showSources, setShowSources] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/sources", { params }).then((r) => setSources(r.data));
  }, [params]);

  useEffect(() => {
    api.get("/readings/latest", { params }).then((r) => {
      setLatest(r.data);
      setSelectedId((p) => (r.data.some((x) => x.station._id === p) ? p : r.data[0]?.station._id));
    });
  }, [tick, params]);

  useEffect(() => {
    if (!selectedId) return;
    api.get(`/stations/${selectedId}/readings?days=7`).then((r) =>
      setSeries(r.data.slice(-120).map((x) => ({ t: new Date(x.timestamp).toLocaleString([], { day: "numeric", month: "short", hour: "numeric" }), wqi: x.wqi })))
    );
  }, [selectedId, tick]);

  const selected = latest.find((l) => l.station._id === selectedId);
  const filtered = useMemo(
    () =>
      latest.filter((l) => `${l.station.name} ${l.station.waterBody} ${l.station.state}`.toLowerCase().includes(q.toLowerCase())),
    [latest, q]
  );

  if (!latest.length) return <p className="p-10 text-center text-white/60">Loading stations...</p>;

  const color = STATUS_COLORS[selected?.status] || "#38d5f0";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Stations</h1>
          <p className="text-sm text-white/55">Monitoring points and suspected effluent sources</p>
        </div>
        <button
          onClick={() => setShowSources((s) => !s)}
          className={`glass glass-hover flex items-center gap-2 px-4 py-2 text-sm font-semibold ${showSources ? "text-purple-300" : "text-white/60"}`}
        >
          <Factory size={16} /> {showSources ? "Hide" : "Show"} sources
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Map */}
        <div className="glass map-wrap lg:col-span-2" style={{ height: 430 }}>
          <MapContainer center={[22.8, 80]} zoom={5} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap &copy; CARTO"
            />
            <FlyTo lat={selected?.station.location.lat} lng={selected?.station.location.lng} />

            {showSources &&
              sources.map((s) => (
                <CircleMarker
                  key={s._id}
                  center={[s.location.lat, s.location.lng]}
                  radius={8}
                  pathOptions={{ color: "#c084fc", fillColor: "#c084fc", fillOpacity: 0.35, weight: 2, dashArray: "3 3" }}
                >
                  <MapTip>{s.name}</MapTip>
                  <Popup>
                    <b>{s.name}</b>
                    <br />
                    {s.type}
                    <br />
                    <span style={{ opacity: 0.7 }}>{s.description}</span>
                  </Popup>
                </CircleMarker>
              ))}

            {latest.map((l) => {
              const c = STATUS_COLORS[l.status];
              const on = l.station._id === selectedId;
              return (
                <CircleMarker
                  key={l._id}
                  center={[l.station.location.lat, l.station.location.lng]}
                  radius={on ? 14 : 11}
                  pathOptions={{ color: on ? "#fff" : c, fillColor: c, fillOpacity: 0.85, weight: on ? 3 : 2 }}
                  eventHandlers={{ click: () => setSelectedId(l.station._id) }}
                >
                  <MapTip>
                    {l.station.name} (WQI {l.wqi})
                  </MapTip>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* Detail */}
        <div className="glass p-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold">{selected.station.name}</h3>
              <p className="text-xs text-white/50">
                {selected.station.waterBody} · <span className="capitalize">{selected.station.type}</span>
              </p>
            </div>
            <StatusBadge status={selected.status} />
          </div>

          <div className="mt-3 flex items-end gap-2">
            <span className="text-4xl font-bold" style={{ color }}>{selected.wqi}</span>
            <span className="mb-1 text-xs text-white/50">WQI · {timeAgo(selected.timestamp)}</span>
          </div>

          <div className="mt-3 h-24">
            <ResponsiveContainer>
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ background: "rgba(6,34,53,.92)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 12, color: "#fff" }}
                  formatter={(v) => [v, "WQI"]}
                />
                <Area type="monotone" dataKey="wqi" stroke={color} strokeWidth={2} fill="url(#spark)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {PARAMS.map((p) => (
              <div key={p.key} className="rounded-xl bg-white/5 px-3 py-2">
                <p className="text-[11px] uppercase text-white/45">{p.label}</p>
                <p className="font-semibold">
                  {selected[p.key]} <span className="text-xs font-normal text-white/45">{p.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold">All stations</h3>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="w-52 rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm outline-none focus:border-aqua-400/60"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase text-white/45">
              <tr>
                <th className="pb-3">Station</th>
                <th className="pb-3">Water body</th>
                <th className="pb-3">State</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">WQI</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr
                  key={l._id}
                  onClick={() => setSelectedId(l.station._id)}
                  className={`cursor-pointer border-t border-white/8 transition hover:bg-white/5 ${l.station._id === selectedId ? "bg-white/8" : ""}`}
                >
                  <td className="py-3 font-semibold">{l.station.name}</td>
                  <td className="py-3 text-white/70">{l.station.waterBody}</td>
                  <td className="py-3 text-white/70">{l.station.state}</td>
                  <td className="py-3 capitalize text-white/70">{l.station.type}</td>
                  <td className="py-3 font-bold" style={{ color: STATUS_COLORS[l.status] }}>{l.wqi}</td>
                  <td className="py-3"><StatusBadge status={l.status} /></td>
                  <td className="py-3 text-white/50">{timeAgo(l.timestamp)}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={7} className="py-6 text-center text-white/50">No stations match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}