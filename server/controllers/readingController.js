import Reading from "../models/Reading.js";
import { latestPipeline } from "../services/latest.js";
import { scopedStationIds } from "../utils/scope.js";

export const getLatestReadings = async (req, res) => {
  const ids = await scopedStationIds(req.query);
  res.json(await Reading.aggregate(latestPipeline(ids)));
};

export const getSummary = async (req, res) => {
  const ids = await scopedStationIds(req.query);
  const latest = await Reading.aggregate(latestPipeline(ids));
  if (!latest.length) {
    return res.json({
      totalStations: 0, avgWqi: 0, best: { name: "-", wqi: 0 }, worst: { name: "-", wqi: 0 }, statusCounts: {},
    });
  }

  const sorted = [...latest].sort((a, b) => a.wqi - b.wqi);
  const avgWqi = Number((latest.reduce((s, r) => s + r.wqi, 0) / latest.length).toFixed(1));
  const statusCounts = latest.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totalStations: latest.length,
    avgWqi,
    best: { name: sorted[0].station.name, wqi: sorted[0].wqi },
    worst: { name: sorted.at(-1).station.name, wqi: sorted.at(-1).wqi },
    statusCounts,
    updatedAt: new Date(),
  });
};

export const getReadings = async (req, res) => {
  const { station, from, to, limit = 200 } = req.query;
  const ids = await scopedStationIds(req.query);
  const q = {};
  if (station) q.station = station;
  else if (ids) q.station = { $in: ids };
  if (from || to) {
    q.timestamp = {};
    if (from) q.timestamp.$gte = new Date(from);
    if (to) q.timestamp.$lte = new Date(to);
  }
  const data = await Reading.find(q)
    .sort({ timestamp: -1 })
    .limit(Number(limit))
    .populate("station", "name code state region")
    .lean();
  res.json(data);
};