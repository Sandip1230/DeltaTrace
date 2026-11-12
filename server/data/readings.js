import { SPIKES } from "./events.js";

// Deterministic hardcoded readings: 7 days, every 6 hours (28 points per station)
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PARAMS = ["ph", "do", "bod", "turbidity", "tds", "temperature", "nitrate"];
const POINTS = 28;
const STEP_MS = 6 * 60 * 60 * 1000;

// quality tiers: 1 pristine ... 5 severe
const TIERS = {
  1: { ph: 7.7, do: 8.8, bod: 0.9, turbidity: 6, tds: 110, nitrate: 2 },
  2: { ph: 7.6, do: 7.2, bod: 2.0, turbidity: 14, tds: 240, nitrate: 7 },
  3: { ph: 7.4, do: 5.4, bod: 4.5, turbidity: 32, tds: 430, nitrate: 16 },
  4: { ph: 7.1, do: 3.6, bod: 8.5, turbidity: 55, tds: 620, nitrate: 26 },
  5: { ph: 6.9, do: 1.8, bod: 17, turbidity: 85, tds: 820, nitrate: 40 },
};

// hand-tuned Kolkata stations (original dataset)
const CUSTOM = {
  DKS: { base: { ph: 7.6, do: 6.8, bod: 2.2, turbidity: 18, tds: 310, temperature: 28, nitrate: 8 }, events: [] },
  HWB: {
    base: { ph: 7.5, do: 6.0, bod: 3.0, turbidity: 26, tds: 380, temperature: 28.5, nitrate: 11 },
    events: [{ from: 14, to: 17, mult: { turbidity: 2.4, tds: 1.3, ph: 1.1, bod: 1.3 } }],
  },
  GDR: {
    base: { ph: 7.2, do: 4.8, bod: 5.5, turbidity: 40, tds: 520, temperature: 29, nitrate: 18 },
    events: [{ from: 22, to: 26, mult: SPIKES.tannery }],
  },
  ULB: {
    base: { ph: 7.8, do: 6.5, bod: 2.5, turbidity: 20, tds: 300, temperature: 28, nitrate: 9 },
    events: [{ from: 8, to: 11, mult: { temperature: 1.15, do: 0.7, tds: 1.3 } }],
  },
  TLG: {
    base: { ph: 7.0, do: 2.5, bod: 14, turbidity: 55, tds: 620, temperature: 29.5, nitrate: 25 },
    events: [{ from: 18, to: 21, mult: { bod: 1.6, do: 0.6, nitrate: 1.3 } }],
  },
  SLK: {
    base: { ph: 7.4, do: 5.2, bod: 4.5, turbidity: 35, tds: 450, temperature: 28, nitrate: 32 },
    events: [{ from: 5, to: 9, mult: SPIKES.agricultural }],
  },
};

// station = plain object from data/stations.js
export function generateReadings(station, seed = 1) {
  const rand = rng(seed * 9973 + station.code.charCodeAt(0) * 31 + station.code.charCodeAt(1));
  const custom = CUSTOM[station.code];

  let base, events;
  if (custom) {
    base = custom.base;
    events = custom.events;
  } else {
    const t = TIERS[station.tier];
    const k = 0.92 + rand() * 0.16; // per-station variation
    base = {};
    PARAMS.forEach((p) => {
      base[p] = p === "temperature" ? station.temp : p === "ph" ? t.ph + (rand() - 0.5) * 0.3 : t[p] * k;
    });
    events = station.event ? [{ from: station.event.from, to: station.event.to, mult: SPIKES[station.event.kind] }] : [];
  }

  const end = Date.now();
  const out = [];
  for (let i = 0; i < POINTS; i++) {
    const r = { timestamp: new Date(end - (POINTS - 1 - i) * STEP_MS) };
    const ev = events.find((e) => i >= e.from && i <= e.to);
    PARAMS.forEach((p) => {
      let v = base[p] * (1 + (rand() - 0.5) * 0.12); // +-6% noise
      if (ev && ev.mult[p]) v *= ev.mult[p];
      r[p] = Number(v.toFixed(2));
    });
    out.push(r);
  }
  return out;
}