import Station from "../models/Station.js";
import Reading from "../models/Reading.js";

export const getStations = async (req, res) => {
  const stations = await Station.find({ isActive: true }).lean();
  res.json(stations);
};

export const getStationById = async (req, res) => {
  const station = await Station.findById(req.params.id).lean();
  if (!station) return res.status(404).json({ message: "Station not found" });
  const latest = await Reading.findOne({ station: station._id }).sort({ timestamp: -1 }).lean();
  res.json({ ...station, latest });
};

export const getStationReadings = async (req, res) => {
  const days = Number(req.query.days) || 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const readings = await Reading.find({ station: req.params.id, timestamp: { $gte: since } })
    .sort({ timestamp: 1 })
    .lean();
  res.json(readings);
};