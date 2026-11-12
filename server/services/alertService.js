import Reading from "../models/Reading.js";
import Alert from "../models/Alert.js";

export const RULES = {
  ph: { label: "pH", unit: "", warnMin: 6.5, warnMax: 8.5, critMin: 6.0, critMax: 9.0 },
  do: { label: "Dissolved Oxygen", unit: " mg/L", warnMin: 5, critMin: 3 },
  bod: { label: "BOD", unit: " mg/L", warnMax: 6, critMax: 10 },
  turbidity: { label: "Turbidity", unit: " NTU", warnMax: 50, critMax: 100 },
  tds: { label: "TDS", unit: " mg/L", warnMax: 600, critMax: 900 },
  nitrate: { label: "Nitrate", unit: " mg/L", warnMax: 30, critMax: 45 },
  temperature: { label: "Temperature", unit: " °C", warnMax: 32, critMax: 35 },
};

export function evaluateReading(reading) {
  const out = [];
  for (const [param, r] of Object.entries(RULES)) {
    const v = reading[param];
    if (v === undefined || v === null) continue;

    let severity = null, threshold = null, direction = null;
    if (r.critMax !== undefined && v > r.critMax) [severity, threshold, direction] = ["critical", r.critMax, "above"];
    else if (r.critMin !== undefined && v < r.critMin) [severity, threshold, direction] = ["critical", r.critMin, "below"];
    else if (r.warnMax !== undefined && v > r.warnMax) [severity, threshold, direction] = ["warning", r.warnMax, "above"];
    else if (r.warnMin !== undefined && v < r.warnMin) [severity, threshold, direction] = ["warning", r.warnMin, "below"];

    if (severity) {
      out.push({
        parameter: param,
        value: v,
        threshold,
        direction,
        severity,
        message: `${r.label} ${v}${r.unit} is ${direction} the ${severity} limit (${threshold}${r.unit})`,
      });
    }
  }
  return out;
}

// One open alert per station+parameter; auto-resolves when back to normal
export async function syncAlerts() {
  const latest = await Reading.aggregate([
    { $sort: { timestamp: -1 } },
    { $group: { _id: "$station", doc: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$doc" } },
  ]);

  const open = await Alert.find({ status: { $in: ["open", "acknowledged"] } });
  const byStation = new Map();
  for (const a of open) {
    const k = String(a.station);
    if (!byStation.has(k)) byStation.set(k, []);
    byStation.get(k).push(a);
  }

  const toCreate = [];
  const saves = [];
  let updated = 0, resolved = 0;

  for (const r of latest) {
    const breaches = evaluateReading(r);
    const mine = byStation.get(String(r.station)) || [];
    const breached = new Set(breaches.map((b) => b.parameter));

    for (const b of breaches) {
      const existing = mine.find((a) => a.parameter === b.parameter);
      if (existing) {
        Object.assign(existing, { ...b, reading: r._id });
        saves.push(existing.save());
        updated++;
      } else {
        toCreate.push({ station: r.station, reading: r._id, ...b });
      }
    }

    for (const a of mine) {
      if (!breached.has(a.parameter)) {
        a.status = "resolved";
        a.resolvedAt = new Date();
        saves.push(a.save());
        resolved++;
      }
    }
  }

  if (toCreate.length) await Alert.insertMany(toCreate);
  await Promise.all(saves);
  return { created: toCreate.length, updated, resolved };
}