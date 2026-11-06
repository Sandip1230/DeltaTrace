import { BASELINE } from "./wqiService.js";

const PARAMS = Object.keys(BASELINE);

const deviationOf = (reading) =>
  Object.fromEntries(PARAMS.map((p) => [p, ((reading[p] ?? BASELINE[p]) - BASELINE[p]) / BASELINE[p]]));

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (const p of PARAMS) {
    const x = a[p] || 0, y = b[p] || 0;
    dot += x * y; na += x * x; nb += y * y;
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

function haversineKm(a, b) {
  const R = 6371, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function identifySources(reading, station, sources) {
  const deviation = deviationOf(reading);
  const magnitude = Math.sqrt(PARAMS.reduce((s, p) => s + deviation[p] ** 2, 0));

  const results = sources
    .map((src) => {
      const similarity = cosine(deviation, src.signature);
      const distanceKm = haversineKm(station.location, src.location);
      const proximity = 1 / (1 + distanceKm / 10);
      const score = Math.max(similarity, 0) * 0.75 + proximity * 0.25;

      const matchedParams = Object.keys(src.signature).filter(
        (p) => Math.sign(deviation[p]) === Math.sign(src.signature[p]) && Math.abs(deviation[p]) > 0.25
      );

      return {
        sourceId: src._id,
        name: src.name,
        type: src.type,
        description: src.description,
        location: src.location,
        distanceKm: Number(distanceKm.toFixed(1)),
        similarity: Number(Math.max(similarity, 0).toFixed(2)),
        confidence: Math.round(score * 100),
        matchedParams,
      };
    })
    .sort((a, b) => b.confidence - a.confidence);

  return {
    deviation: Object.fromEntries(PARAMS.map((p) => [p, Number(deviation[p].toFixed(2))])),
    magnitude: Number(magnitude.toFixed(2)),
    significant: magnitude >= 0.6,
    results,
  };
}