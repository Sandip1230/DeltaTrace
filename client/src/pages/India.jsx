import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip as MapTip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertOctagon, Droplets, Flame, Landmark, MapPin, Waves } from "lucide-react";
import api from "../api/axios";
import { useLive } from "../context/LiveContext";
import { useScope } from "../context/ScopeContext";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import IndiaBoundaries from "../components/maps/IndiaBoundaries";
import { STATUS_COLORS } from "../utils/wqi";
import { CARTO_TILE_URL } from "../utils/mapTiles";

const tip = {
  contentStyle: { background: "rgba(6,26,43,.92)", border: "1px solid rgba(56,213,240,.3)", borderRadius: 12, color: "#fff" },
  labelStyle: { color: "#7ee8fa" },
};
const axis = { fill: "rgba(255,255,255,.55)", fontSize: 11 };
const regionLabel = (r) => (r === "Northeast" ? "North-East" : r);

export default function India() {
  const { tick } = useLive();
  const { setRegion } = useScope();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [river, setRiver] = useState(null);

  useEffect(() => {
    api.get("/india").then((r) => {
      setData(r.data);
      setRiver((prev) => prev || r.data.rivers?.[0]?.waterBody || null);
    });
  }, [tick]);

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-28" />
        <div className="skeleton h-[500px]" />
      </div>
    );
  }
  if (!data.national) return <p className="p-10 text-center text-white/60">No data yet. Run the seed script.</p>;

  const { national } = data;
  const nColor = STATUS_COLORS[national.status];
  const stateData = data.states.slice(0, 15).map((s) => ({ ...s, color: STATUS_COLORS[s.status] }));
  const riverData = data.rivers.find((r) => r.waterBody === river);

  const openRegion = (r) => {
    setRegion(r);
    navigate("/dashboard");
  };
  const openStation = (s) => {
    setRegion(s.region);
    navigate(`/tracker?station=${s.id}`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <span className="chip">Pan-India network · simulated data</span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
          India <span className="text-gradient">water quality</span> overview
        </h1>
        <p className="mt-1 text-sm text-white/55">National picture across rivers, canals and lakes. Click a region or station to drill down.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard delay={0.05} icon={Droplets} label="National avg WQI" value={national.avgWqi} decimals={1} sub={national.status} accent={nColor} />
        <StatCard delay={0.12} icon={MapPin} label="Stations" value={national.stations} sub="Rivers, canals, lakes" />
        <StatCard delay={0.19} icon={Landmark} label="States / UTs" value={national.states} sub="6 regions" accent="#a855f7" />
        <StatCard delay={0.26} icon={AlertOctagon} label="Unfit stations" value={national.unfit} sub="WQI above 100" accent="#f87171" />
      </div>

      {/* Map */}
      <div className="glass map-wrap relative" style={{ height: 500 }}>
        <MapContainer className="dt-map" center={[22.8, 80]} zoom={5} minZoom={4} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
          <TileLayer url={CARTO_TILE_URL} attribution="&copy; OpenStreetMap &copy; CARTO &copy; Natural Earth" />
          <IndiaBoundaries />
          {data.stations.map((s) => {
            const c = STATUS_COLORS[s.status];
            return (
              <CircleMarker
                key={s.id}
                center={[s.lat, s.lng]}
                radius={s.status === "Unfit" ? 11 : s.status === "Very Poor" ? 9 : 7}
                pathOptions={{ color: c, fillColor: c, fillOpacity: 0.8, weight: 2 }}
              >
                <MapTip>{s.name} · WQI {s.wqi}</MapTip>
                <Popup>
                  <b>{s.name}</b>
                  <br />
                  {s.city}, {s.state}
                  <br />
                  {s.waterBody}
                  <br />
                  WQI <b style={{ color: c }}>{s.wqi}</b> ({s.status})
                  <br />
                  <button onClick={() => openStation(s)} className="btn-neon !mt-2 !rounded-lg !px-3 !py-1.5 text-xs">Trace source</button>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
        <div className="absolute bottom-3 left-3 z-[1000] flex flex-wrap gap-x-3 gap-y-1 rounded-xl bg-black/50 px-3 py-2 text-[11px] backdrop-blur">
          {Object.entries(STATUS_COLORS).map(([k, c]) => (
            <span key={k} className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: c }} />{k}</span>
          ))}
        </div>
      </div>

      {/* Regions */}
      <div>
        <h3 className="mb-3 font-semibold">Regions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...data.regions].sort((a, b) => b.avgWqi - a.avgWqi).map((r) => (
            <button key={r.region} onClick={() => openRegion(r.region)} className="glass glass-hover p-5 text-left">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{regionLabel(r.region)}</p>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-3 text-3xl font-bold" style={{ color: STATUS_COLORS[r.status] }}>{r.avgWqi}</p>
              <p className="text-xs text-white/50">{r.stations} stations · {r.critical} unfit</p>
              <p className="mt-3 text-xs text-white/60">Hotspot: <b className="text-white">{r.worst.name}</b> ({r.worst.wqi})</p>
            </button>
          ))}
        </div>
      </div>

      {/* State ranking */}
      <div className="glass glass-hover p-6">
        <h3 className="mb-1 font-semibold">States ranked by average WQI</h3>
        <p className="mb-4 text-xs text-white/45">Top 15, most polluted first</p>
        <div style={{ height: 440 }}>
          <ResponsiveContainer>
            <BarChart data={stateData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid stroke="rgba(255,255,255,.07)" horizontal={false} />
              <XAxis type="number" tick={axis} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="state" width={118} tick={axis} axisLine={false} tickLine={false} />
              <Tooltip {...tip} cursor={{ fill: "rgba(255,255,255,.05)" }} formatter={(v) => [v, "Avg WQI"]} />
              <Bar dataKey="avgWqi" radius={[0, 8, 8, 0]} animationDuration={900}>
                {stateData.map((d) => <Cell key={d.state} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hotspots + cleanest */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass glass-hover p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold"><Flame size={16} className="text-orange-400" /> Pollution hotspots</h3>
          <div className="space-y-2">
            {data.worst.map((s, i) => (
              <button key={s.id} onClick={() => openStation(s)} className="flex w-full items-center gap-3 rounded-xl bg-white/5 p-3 text-left transition hover:bg-white/10">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{s.name}</span>
                  <span className="block truncate text-xs text-white/50">{s.waterBody} · {s.state}</span>
                </span>
                <b style={{ color: STATUS_COLORS[s.status] }}>{s.wqi}</b>
              </button>
            ))}
          </div>
        </div>

        <div className="glass glass-hover p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold"><Droplets size={16} className="text-emerald-400" /> Cleanest stations</h3>
          <div className="space-y-2">
            {data.best.map((s, i) => (
              <button key={s.id} onClick={() => openStation(s)} className="flex w-full items-center gap-3 rounded-xl bg-white/5 p-3 text-left transition hover:bg-white/10">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{s.name}</span>
                  <span className="block truncate text-xs text-white/50">{s.waterBody} · {s.state}</span>
                </span>
                <b style={{ color: STATUS_COLORS[s.status] }}>{s.wqi}</b>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* River profile */}
      {riverData && (
        <div className="glass glass-hover p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 font-semibold"><Waves size={16} className="text-aqua-400" /> River profile</h3>
              <p className="text-xs text-white/45">WQI from upstream to downstream</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.rivers.map((r) => (
                <button
                  key={r.waterBody}
                  onClick={() => setRiver(r.waterBody)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${river === r.waterBody ? "bg-aqua-500 text-ocean-950 shadow-[0_0_16px_-2px_#38d5f0]" : "bg-white/8 text-white/70 hover:bg-white/15"}`}
                >
                  {r.waterBody.replace(" River", "")}
                </button>
              ))}
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={riverData.points.map((p) => ({ ...p, color: STATUS_COLORS[p.status] }))}>
                <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
                <XAxis dataKey="code" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} width={40} />
                <Tooltip {...tip} cursor={{ fill: "rgba(255,255,255,.05)" }} labelFormatter={(l, p) => p?.[0]?.payload.name || l} formatter={(v) => [v, "WQI"]} />
                <Bar dataKey="wqi" radius={[8, 8, 0, 0]} animationDuration={900}>
                  {riverData.points.map((p) => <Cell key={p.code} fill={STATUS_COLORS[p.status]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-white/40">
        All readings are simulated for demonstration and are not live CPCB / NWMP measurements.
      </p>
    </motion.div>
  );
}