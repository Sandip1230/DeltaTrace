import Alert from "../models/Alert.js";
import { syncAlerts } from "../services/alertService.js";
import { scopedStationIds } from "../utils/scope.js";

export const getAlerts = async (req, res) => {
  const { status, severity, station, limit = 100 } = req.query;
  const q = {};
  if (status) q.status = status;
  if (severity) q.severity = severity;

  const ids = await scopedStationIds(req.query);
  if (station) q.station = station;
  else if (ids) q.station = { $in: ids };

  const alerts = await Alert.find(q)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate("station", "name code state region")
    .lean();
  res.json(alerts);
};

export const getAlertStats = async (req, res) => {
  const ids = await scopedStationIds(req.query);
  const match = { status: { $in: ["open", "acknowledged"] } };
  if (ids) match.station = { $in: ids };

  const rows = await Alert.aggregate([{ $match: match }, { $group: { _id: "$severity", count: { $sum: 1 } } }]);
  const stats = { critical: 0, warning: 0 };
  rows.forEach((r) => (stats[r._id] = r.count));
  res.json({ ...stats, total: stats.critical + stats.warning });
};

const setStatus = (status, extra = () => ({})) => async (req, res) => {
  const alert = await Alert.findByIdAndUpdate(req.params.id, { status, ...extra(req) }, { new: true });
  if (!alert) return res.status(404).json({ message: "Alert not found" });
  res.json(alert);
};

export const acknowledgeAlert = setStatus("acknowledged", (req) => ({
  acknowledgedBy: req.user._id,
  acknowledgedAt: new Date(),
}));

export const resolveAlert = setStatus("resolved", () => ({ resolvedAt: new Date() }));

export const syncNow = async (req, res) => res.json(await syncAlerts());