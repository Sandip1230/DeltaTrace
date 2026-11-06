import Station from "../models/Station.js";
import Reading from "../models/Reading.js";
import Source from "../models/Source.js";
import { identifySources } from "../services/sourceIdentifier.js";

const latestOf = (stationId) => Reading.findOne({ station: stationId }).sort({ timestamp: -1 }).lean();

export const analyseAll = async (req, res) => {
  const [stations, sources] = await Promise.all([Station.find({ isActive: true }).lean(), Source.find().lean()]);
  const out = [];

  for (const st of stations) {
    const reading = await latestOf(st._id);
    if (!reading) continue;
    const a = identifySources(reading, st, sources);
    out.push({
      station: { _id: st._id, name: st.name, code: st.code, location: st.location },
      wqi: reading.wqi,
      status: reading.status,
      significant: a.significant,
      topSuspect: a.significant ? a.results[0] : null,
    });
  }
  res.json(out);
};

export const analyseStation = async (req, res) => {
  const station = await Station.findById(req.params.stationId).lean();
  if (!station) return res.status(404).json({ message: "Station not found" });

  const reading = req.query.readingId
    ? await Reading.findById(req.query.readingId).lean()
    : await latestOf(station._id);
  if (!reading) return res.status(404).json({ message: "No readings found" });

  const sources = await Source.find().lean();
  res.json({ station, reading, analysis: identifySources(reading, station, sources) });
};

// what-if mode: override some parameter values and re-run the matcher
export const simulate = async (req, res) => {
  const { stationId, values = {} } = req.body;
  const station = await Station.findById(stationId).lean();
  if (!station) return res.status(404).json({ message: "Station not found" });

  const base = await latestOf(station._id);
  const reading = { ...base, ...values };
  const sources = await Source.find().lean();
  res.json({ station, reading, analysis: identifySources(reading, station, sources) });
};