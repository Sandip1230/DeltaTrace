import Reading from "../models/Reading.js";
import { latestPipeline } from "../services/latest.js";
import { getStatus } from "../services/wqiService.js";

const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const r1 = (n) => Number(n.toFixed(1));

const groupBy = (list, key) => {
  const m = new Map();
  for (const x of list) {
    if (!m.has(x[key])) m.set(x[key], []);
    m.get(x[key]).push(x);
  }
  return m;
};

export const getIndiaSummary = async (req, res) => {
  const latest = await Reading.aggregate(latestPipeline());
  const stations = latest.map((r) => ({
    id: r.station._id, code: r.station.code, name: r.station.name, city: r.station.city,
    state: r.station.state, region: r.station.region, waterBody: r.station.waterBody, type: r.station.type,
    order: r.station.riverOrder || 0, lat: r.station.location.lat, lng: r.station.location.lng,
    wqi: r.wqi, status: r.status,
  }));
  if (!stations.length) return res.json({ national: null });

  const summarize = (list) => {
    const a = r1(avg(list.map((s) => s.wqi)));
    const worst = list.reduce((x, y) => (y.wqi > x.wqi ? y : x));
    return { stations: list.length, avgWqi: a, status: getStatus(a), worst: { name: worst.name, wqi: worst.wqi } };
  };

  const regions = [...groupBy(stations, "region")].map(([region, list]) => ({
    region, ...summarize(list), critical: list.filter((s) => s.wqi > 100).length,
  }));
  const states = [...groupBy(stations, "state")]
    .map(([state, list]) => ({ state, ...summarize(list) }))
    .sort((a, b) => b.avgWqi - a.avgWqi);

  const rivers = [...groupBy(stations, "waterBody")]
    .filter(([, list]) => list.length >= 2)
    .map(([waterBody, list]) => ({
      waterBody,
      points: [...list].sort((a, b) => a.order - b.order).map(({ code, name, wqi, status }) => ({ code, name, wqi, status })),
    }));

  const sorted = [...stations].sort((a, b) => b.wqi - a.wqi);
  const statusCounts = stations.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});
  const national = r1(avg(stations.map((s) => s.wqi)));

  res.json({
    national: {
      avgWqi: national,
      status: getStatus(national),
      stations: stations.length,
      states: groupBy(stations, "state").size,
      unfit: stations.filter((s) => s.wqi > 100).length,
      statusCounts,
    },
    regions,
    states,
    worst: sorted.slice(0, 8),
    best: sorted.slice(-5).reverse(),
    rivers,
    stations,
  });
};