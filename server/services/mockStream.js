import Station from "../models/Station.js";
import Reading from "../models/Reading.js";
import { calculateWQI } from "./wqiService.js";
import { syncAlerts } from "./alertService.js";
import Alert from "../models/Alert.js";

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
  ph: [5.5, 9.5], do: [0.5, 9], bod: [0.5, 30], turbidity: [2, 200],
  tds: [100, 1200], temperature: [22, 38], nitrate: [1, 80],
};

const SPIKES = {
  sewage: { bod: 1.9, do: 0.7, nitrate: 1.3 },
  tannery: { ph: 0.88, bod: 1.8, tds: 1.5, turbidity: 1.6 },
  textile: { ph: 1.1, turbidity: 2.2, tds: 1.3 },
  agricultural: { nitrate: 2.0, turbidity: 1.5 },
  thermal: { temperature: 1.15, do: 0.7 },
};

const clamp = (v, [min, max]) => Math.min(max, Math.max(min, v));

export async function startMockStream(intervalMs = 15000) {
  const stations = await Station.find({ isActive: true }).lean();
  const state = [];

  for (const st of stations) {
    const rows = await Reading.find({ station: st._id }).sort({ timestamp: -1 }).limit(28).lean();
    if (!rows.length) continue;
    const baseline = {};
    PARAMS.forEach((p) => (baseline[p] = rows.reduce((s, r) => s + r[p], 0) / rows.length));
    state.push({ st, baseline, current: { ...rows[0] } });
  }

  setInterval(() => send("ping", { t: Date.now() }), 25000);

  setInterval(async () => {
    try {
      const batch = [];

      for (const s of state) {
        const next = {};
        PARAMS.forEach((p) => {
          const revert = (s.baseline[p] - s.current[p]) * 0.1;
          const noise = (Math.random() - 0.5) * 2 * JITTER[p];
          next[p] = clamp(s.current[p] + revert + noise, LIMITS[p]);
        });

        let spike = null;
        if (Math.random() < 0.06) {
          const keys = Object.keys(SPIKES);
          spike = keys[Math.floor(Math.random() * keys.length)];
          for (const [p, m] of Object.entries(SPIKES[spike])) next[p] = clamp(next[p] * m, LIMITS[p]);
        }

        PARAMS.forEach((p) => (next[p] = Number(next[p].toFixed(2))));
        const reading = { station: s.st._id, timestamp: new Date(), ...next, ...calculateWQI(next) };
        await Reading.create(reading);
        s.current = reading;

        batch.push({ ...reading, stationName: s.st.name, stationCode: s.st.code, spike });
      }

      const sync = await syncAlerts();
      const open = await Alert.countDocuments({ status: { $in: ["open", "acknowledged"] } });

      send("readings", batch);
      send("alerts", { ...sync, open });
    } catch (err) {
      console.error("Stream tick failed:", err.message);
    }
  }, intervalMs);

  console.log(`Mock stream running every ${intervalMs / 1000}s`);
}