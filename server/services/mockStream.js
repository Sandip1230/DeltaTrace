import Station from "../models/Station.js";
import Reading from "../models/Reading.js";
import Alert from "../models/Alert.js";
import { calculateWQI } from "./wqiService.js";
import { syncAlerts } from "./alertService.js";
import { SPIKES } from "../data/events.js";

const clients = new Set();

export const addClient = (res) => {
  clients.add(res);
  res.on("close", () => clients.delete(res));
};

const send = (event, data) => {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) res.write(msg);
};

const PARAMS = ["ph", "do", "bod", "turbidity", "tds", "temperature", "nitrate"];
const JITTER = { ph: 0.08, do: 0.15, bod: 0.4, turbidity: 2, tds: 12, temperature: 0.2, nitrate: 0.6 };
const LIMITS = {
  ph: [5.5, 9.5], do: [0.5, 10], bod: [0.3, 35], turbidity: [2, 250],
  tds: [80, 1500], temperature: [5, 40], nitrate: [0.5, 90],
};
const SPIKE_CHANCE = 0.015; // per station per tick
const SPIKE_KINDS = Object.keys(SPIKES);
const clamp = (v, [min, max]) => Math.min(max, Math.max(min, v));

export async function startMockStream(intervalMs = 20000) {
  const stations = await Station.find({ isActive: true }).lean();

  const state = (
    await Promise.all(
      stations.map(async (st) => {
        const rows = await Reading.find({ station: st._id }).sort({ timestamp: -1 }).limit(28).lean();
        if (!rows.length) return null;
        const baseline = {};
        PARAMS.forEach((p) => (baseline[p] = rows.reduce((s, r) => s + r[p], 0) / rows.length));
        return { st, baseline, current: { ...rows[0] } };
      })
    )
  ).filter(Boolean);

  setInterval(() => send("ping", { t: Date.now() }), 25000);

  setInterval(async () => {
    try {
      const docs = [];
      const batch = [];

      for (const s of state) {
        const next = {};
        PARAMS.forEach((p) => {
          const revert = (s.baseline[p] - s.current[p]) * 0.1;
          const noise = (Math.random() - 0.5) * 2 * JITTER[p];
          next[p] = clamp(s.current[p] + revert + noise, LIMITS[p]);
        });

        let spike = null;
        if (Math.random() < SPIKE_CHANCE) {
          spike = SPIKE_KINDS[Math.floor(Math.random() * SPIKE_KINDS.length)];
          for (const [p, m] of Object.entries(SPIKES[spike])) next[p] = clamp(next[p] * m, LIMITS[p]);
        }

        PARAMS.forEach((p) => (next[p] = Number(next[p].toFixed(2))));
        const doc = { station: s.st._id, timestamp: new Date(), ...next, ...calculateWQI(next) };
        docs.push(doc);
        s.current = doc;
        batch.push({ ...doc, stationName: s.st.name, stationCode: s.st.code, state: s.st.state, spike });
      }

      await Reading.insertMany(docs);
      const sync = await syncAlerts();
      const open = await Alert.countDocuments({ status: { $in: ["open", "acknowledged"] } });

      send("readings", batch);
      send("alerts", { ...sync, open });
    } catch (err) {
      console.error("Stream tick failed:", err.message);
    }
  }, intervalMs);

  console.log(`Mock stream running every ${intervalMs / 1000}s for ${state.length} stations`);
}