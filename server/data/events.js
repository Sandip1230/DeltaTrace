// pollution spike multipliers per source kind (shared by seed data and live stream)
export const SPIKES = {
  sewage: { bod: 1.9, do: 0.7, nitrate: 1.3 },
  tannery: { ph: 0.88, bod: 1.8, tds: 1.5, turbidity: 1.6 },
  textile: { ph: 1.1, turbidity: 2.2, tds: 1.3 },
  agricultural: { nitrate: 2.0, turbidity: 1.5 },
  thermal: { temperature: 1.15, do: 0.7 },
  chemical: { ph: 0.9, tds: 1.4, nitrate: 1.8, bod: 1.4 },
  distillery: { bod: 2.6, do: 0.55, ph: 0.9 },
  mining: { turbidity: 2.8, tds: 1.5, ph: 0.92 },
};