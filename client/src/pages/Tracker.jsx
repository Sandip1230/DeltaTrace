import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip as MapTip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CheckCircle2, Crosshair, FlaskConical, MapPin, RotateCcw, Ruler, Target } from "lucide-react";
import api from "../api/axios";
import { useLive } from "../context/LiveContext";
import StatusBadge from "../components/ui/StatusBadge";
import { BASELINE, LIMITS, PARAMS, STATUS_COLORS } from "../utils/wqi";

const tip = {
  contentStyle: { background: "rgba(6,34,53,.92)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 12, color: "#fff" },
  labelStyle: { color: "#7ee8fa" },
};
const confColor = (c) => (c >= 70 ? "#f87171" : c >= 50 ? "#fb923c" : c >= 35 ? "#facc15" : "#94a3b8");
const pick = (reading) => Object.fromEntries(PARAMS.map((p) => [p.key, reading[p.key]]));

function FitBounds({ points }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    if (points.length) map.fitBounds(points, { padding: [45, 45], maxZoom: 13 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

export default function Tracker() {
  const { tick } = useLive();
  const [params, setParams] = useSearchParams();

  const [overview, setOverview] = useState([]);
  const [sources, setSources] = useState([]);
  const [data, setData] = useState(null);
  const [sim, setSim] = useState(false);
  const [values, setValues] = useState(null);
  const [simData, setSimData] = useState(null);

  const selectedId = params.get("station") || overview[0]?.station._id;
  const select = (id) => setParams({ station: id }, { replace: true });

  useEffect(() => {
    api.get("/sources").then((r) => setSources(r.data));
  }, []);

  useEffect(() => {
    api.get("/tracker").then((r) => setOverview(r.data));
  }, [tick]);

  useEffect(() => {
    if (!selectedId) return;
    api.get(`/tracker/${selectedId}`).then((r) => setData(r.data));
  }, [selectedId, tick]);

  // reset simulator values when the station changes
  const dataStationId = data?.station._id;
  useEffect(() => {
    if (data) setValues(pick(data.reading));
    setSimData(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataStationId]);

  // debounced what-if call
  useEffect(() => {
    if (!sim || !selectedId || !values) return;
    const t = setTimeout(() => {
      api.post("/tracker/simulate", { stationId: selectedId, values }).then((r) => setSimData(r.data)).catch(() => {});
    }, 350);
    return () => clearTimeout(t);
  }, [sim, values, selectedId]);

  const view = sim && simData && simData.station._id === selectedId ? simData : data;

  const devData = useMemo(
    () => (view ? PARAMS.map((p) => ({ name: p.label, dev: Math.round((view.analysis.deviation[p.key] ?? 0) * 100) })) : []),
    [view]
  );

  const applyPreset = (src) => {
    const v = {};
    PARAMS.forEach((p) => {
      const [mn, mx] = LIMITS[p.key];
      const raw = BASELINE[p.key] * (1 + (src.signature[p.key] || 0));
      v[p.key] = Number(Math.min(mx, Math.max(mn, raw)).toFixed(2));
    });
    setValues(v);
  };

  const toggleSim = () => {
    if (!sim && data) setValues(pick(data.reading));
    setSim((s) => !s);
  };

  if (!overview.length || !view) return <p className="p-10 text-center text-white/60">Analysing stations...</p>;

  const { analysis, station, reading } = view;
  const top = analysis.results[0];
  const topColor = confColor(top.confidence);
  const mapPoints = [[station.location.lat, station.location.lng], ...analysis.results.slice(0, 3).map((r) => [r.location.lat, r.location.lng])];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Source Tracker</h1>
          <p className="text-sm text-white/55">Matches the pollutant signature to the most likely effluent source</p>
        </div>
        <button
          onClick={toggleSim}
          className={`glass glass-hover flex items-center gap-2 px-4 py-2 text-sm font-semibold ${sim ? "text-purple-300 ring-1 ring-purple-400/50" : ""}`}
        >
          <FlaskConical size={16} /> What-if simulator {sim ? "ON" : "OFF"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Station list */}
        <div className="space-y-3">
          {overview.map((o) => {
            const on = o.station._id === selectedId;
            return (
              <button
                key={o.station._id}
                onClick={() => select(o.station._id)}
                className={`glass glass-hover w-full p-4 text-left ${on ? "ring-2 ring-aqua-400/70" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{o.station.name}</p>
                  <span className="text-lg font-bold" style={{ color: STATUS_COLORS[o.status] }}>{o.wqi}</span>
                </div>
                {o.significant && o.topSuspect ? (
                  <p className="mt-1 text-xs text-white/65">
                    <Target size={12} className="mr-1 inline text-amber-300" />
                    {o.topSuspect.name} · <b style={{ color: confColor(o.topSuspect.confidence) }}>{o.topSuspect.confidence}%</b>
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-emerald-300/80">
                    <CheckCircle2 size={12} className="mr-1 inline" />
                    Clean signature
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Analysis */}
        <div className="space-y-4">
          {/* Verdict */}
          <div className="glass p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/45">
                  {sim ? "Simulated analysis" : "Live analysis"} · {station.name}
                </p>
                {analysis.significant ? (
                  <>
                    <h2 className="mt-1 text-2xl font-bold">{top.name}</h2>
                    <p className="text-sm text-white/60">{top.type} · {top.distanceKm} km from station</p>
                  </>
                ) : (
                  <>
                    <h2 className="mt-1 text-2xl font-bold text-emerald-300">No significant pollution signature</h2>
                    <p className="text-sm text-white/60">Readings are close to clean-water baselines.</p>
                  </>
                )}
              </div>
              <div className="text-right">
                {analysis.significant && (
                  <>
                    <p className="text-4xl font-extrabold" style={{ color: topColor }}>{top.confidence}%</p>
                    <p className="text-xs text-white/50">match confidence</p>
                  </>
                )}
              </div>
            </div>

            {analysis.significant && (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${top.confidence}%`, background: topColor }} />
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/55">
              <StatusBadge status={reading.status} />
              <span>Deviation magnitude <b className="text-white">{analysis.magnitude}</b></span>
              <span>{analysis.significant ? "Above" : "Below"} detection threshold (0.6)</span>
            </div>
          </div>

          {/* Chart + map */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass p-5">
              <h3 className="mb-1 font-semibold">Deviation from clean baseline</h3>
              <p className="mb-3 text-xs text-white/45">Orange = higher than normal, blue = lower</p>
              <div className="h-60">
                <ResponsiveContainer>
                  <BarChart data={devData}>
                    <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,.6)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,.5)", fontSize: 11 }} axisLine={false} tickLine={false} width={42} unit="%" />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,.3)" />
                    <Tooltip {...tip} cursor={{ fill: "rgba(255,255,255,.05)" }} formatter={(v) => [`${v}%`, "vs baseline"]} />
                    <Bar dataKey="dev" radius={[6, 6, 6, 6]}>
                      {devData.map((d) => (
                        <Cell key={d.name} fill={d.dev >= 0 ? "#fb923c" : "#38d5f0"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass map-wrap" style={{ minHeight: 300 }}>
              <MapContainer center={[station.location.lat, station.location.lng]} zoom={11} style={{ height: "100%", minHeight: 300, width: "100%" }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap &copy; CARTO" />
                <FitBounds points={mapPoints} />

                {analysis.results.slice(0, 3).map((r, i) => (
                  <Polyline
                    key={`l-${r.sourceId}`}
                    positions={[[station.location.lat, station.location.lng], [r.location.lat, r.location.lng]]}
                    pathOptions={{ color: confColor(r.confidence), weight: i === 0 ? 3 : 1.5, dashArray: "6 6", opacity: i === 0 ? 0.9 : 0.5 }}
                  />
                ))}

                {analysis.results.map((r, i) => (
                  <CircleMarker
                    key={r.sourceId}
                    center={[r.location.lat, r.location.lng]}
                    radius={i === 0 && analysis.significant ? 11 : 7}
                    pathOptions={{ color: "#c084fc", fillColor: confColor(r.confidence), fillOpacity: 0.7, weight: 2 }}
                  >
                    <MapTip>{r.name} · {r.confidence}%</MapTip>
                  </CircleMarker>
                ))}

                <CircleMarker
                  center={[station.location.lat, station.location.lng]}
                  radius={12}
                  pathOptions={{ color: "#fff", fillColor: "#38d5f0", fillOpacity: 0.95, weight: 3 }}
                >
                  <MapTip permanent direction="top">{station.name}</MapTip>
                </CircleMarker>
              </MapContainer>
            </div>
          </div>

          {/* Ranked suspects */}
          <div className="glass p-5">
            <h3 className="mb-4 font-semibold">Ranked suspects</h3>
            <div className="space-y-3">
              {analysis.results.map((r, i) => {
                const c = confColor(r.confidence);
                return (
                  <div key={r.sourceId} className="rounded-2xl bg-white/5 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold" style={{ background: `${c}22`, color: c }}>{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{r.name}</p>
                        <p className="text-xs text-white/50">{r.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold" style={{ color: c }}>{r.confidence}%</p>
                        <p className="flex items-center justify-end gap-1 text-[11px] text-white/45"><Ruler size={11} />{r.distanceKm} km</p>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${r.confidence}%`, background: c }} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-white/40">Signature match:</span>
                      {r.matchedParams.length ? (
                        r.matchedParams.map((m) => (
                          <span key={m} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase">{m}</span>
                        ))
                      ) : (
                        <span className="text-[11px] text-white/40">none</span>
                      )}
                      <span className="ml-auto text-[11px] text-white/40">similarity {r.similarity}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* What-if simulator */}
          {sim && values && (
            <div className="glass p-5 ring-1 ring-purple-400/40">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 font-semibold">
                    <FlaskConical size={16} className="text-purple-300" /> What-if simulator
                  </h3>
                  <p className="text-xs text-white/50">Drag sliders or pick a preset; the matcher re-runs instantly.</p>
                </div>
                <button
                  onClick={() => setValues(pick(data.reading))}
                  className="flex items-center gap-1.5 rounded-xl bg-white/8 px-3 py-2 text-xs font-semibold hover:bg-white/15"
                >
                  <RotateCcw size={13} /> Reset to live
                </button>
              </div>

              <div className="mb-5 flex flex-wrap gap-2">
                {sources.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => applyPreset(s)}
                    className="flex items-center gap-1.5 rounded-full bg-purple-400/15 px-3 py-1.5 text-xs font-semibold text-purple-200 hover:bg-purple-400/25"
                  >
                    <Crosshair size={12} /> {s.type}
                  </button>
                ))}
              </div>

              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {PARAMS.map((p) => {
                  const [min, max, step] = LIMITS[p.key];
                  return (
                    <div key={p.key}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-white/70">{p.label}</span>
                        <span className="font-semibold">
                          {values[p.key]} <span className="text-xs font-normal text-white/40">{p.unit}</span>
                        </span>
                      </div>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={values[p.key]}
                        onChange={(e) => setValues((v) => ({ ...v, [p.key]: Number(e.target.value) }))}
                        className="w-full accent-aqua-400"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <p className="flex items-center gap-1.5 text-xs text-white/40">
            <MapPin size={12} /> Score = 75% signature similarity + 25% proximity to the station.
          </p>
        </div>
      </div>
    </div>
  );
}