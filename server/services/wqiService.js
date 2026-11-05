// Weighted arithmetic WQI. Higher WQI = worse quality.
// ideal = value in pure water, std = permissible limit (BIS/WHO)
const STANDARDS = {
  ph: { ideal: 7, std: 8.5 },
  do: { ideal: 14.6, std: 5 },
  bod: { ideal: 0, std: 3 },
  turbidity: { ideal: 0, std: 5 },
  tds: { ideal: 0, std: 500 },
  nitrate: { ideal: 0, std: 45 },
};

export const BASELINE = {
  ph: 7.5, do: 7, bod: 2, turbidity: 15, tds: 300, temperature: 28, nitrate: 8,
};

export function getStatus(wqi) {
  if (wqi <= 25) return "Excellent";
  if (wqi <= 50) return "Good";
  if (wqi <= 75) return "Poor";
  if (wqi <= 100) return "Very Poor";
  return "Unfit";
}

export function calculateWQI(reading) {
  let sumQW = 0;
  let sumW = 0;

  for (const [param, { ideal, std }] of Object.entries(STANDARDS)) {
    const v = reading[param];
    if (v === undefined || v === null) continue;
    const q = (Math.abs(v - ideal) / Math.abs(std - ideal)) * 100;
    const w = 1 / std;
    sumQW += q * w;
    sumW += w;
  }

  const wqi = sumW ? Number((sumQW / sumW).toFixed(1)) : 0;
  return { wqi, status: getStatus(wqi) };
}