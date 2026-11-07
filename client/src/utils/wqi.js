export const STATUS_COLORS = {
  Excellent: "#34d399",
  Good: "#38d5f0",
  Poor: "#facc15",
  "Very Poor": "#fb923c",
  Unfit: "#f87171",
};

export const PARAMS = [
  { key: "ph", label: "pH", unit: "" },
  { key: "do", label: "DO", unit: "mg/L" },
  { key: "bod", label: "BOD", unit: "mg/L" },
  { key: "turbidity", label: "Turbidity", unit: "NTU" },
  { key: "tds", label: "TDS", unit: "mg/L" },
  { key: "temperature", label: "Temp", unit: "°C" },
  { key: "nitrate", label: "Nitrate", unit: "mg/L" },
];

// clean-water baselines (must match server/services/wqiService.js)
export const BASELINE = { ph: 7.5, do: 7, bod: 2, turbidity: 15, tds: 300, temperature: 28, nitrate: 8 };

// slider limits for the what-if simulator: [min, max, step]
export const LIMITS = {
  ph: [5.5, 9.5, 0.1],
  do: [0.5, 9, 0.1],
  bod: [0.5, 30, 0.5],
  turbidity: [2, 200, 1],
  tds: [100, 1200, 10],
  temperature: [22, 38, 0.5],
  nitrate: [1, 80, 1],
};

export const getStatus = (w) =>
  w <= 25 ? "Excellent" : w <= 50 ? "Good" : w <= 75 ? "Poor" : w <= 100 ? "Very Poor" : "Unfit";