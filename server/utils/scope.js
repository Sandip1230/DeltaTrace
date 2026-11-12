import Station from "../models/Station.js";

export const scopeFilter = (q = {}) => {
  const f = {};
  if (q.region && q.region !== "all") f.region = q.region;
  if (q.state && q.state !== "all") f.state = q.state;
  return f;
};

// returns null when there is no scope (all stations)
export const scopedStationIds = async (q = {}) => {
  const f = scopeFilter(q);
  return Object.keys(f).length ? Station.find(f).distinct("_id") : null;
};