// signature = relative deviation from clean baseline (+ higher, - lower)
export const sources = [
  {
    name: "Bantala Tannery Cluster",
    type: "Tannery",
    description: "Leather processing units discharging chromium-rich, high-TDS effluent.",
    location: { lat: 22.52, lng: 88.43 },
    signature: { ph: -0.15, bod: 2.0, tds: 1.5, turbidity: 0.8 },
  },
  {
    name: "Howrah Textile Dyeing Units",
    type: "Textile Dyeing",
    description: "Dye house effluent with high alkalinity and turbidity.",
    location: { lat: 22.59, lng: 88.31 },
    signature: { ph: 0.15, turbidity: 2.0, tds: 1.2, bod: 0.8 },
  },
  {
    name: "Tolly Nullah Sewage Outfall",
    type: "Domestic Sewage",
    description: "Untreated municipal sewage with heavy organic load.",
    location: { lat: 22.5, lng: 88.35 },
    signature: { bod: 3.0, do: -0.6, nitrate: 1.2, turbidity: 0.8 },
  },
  {
    name: "Eastern Fringe Agricultural Runoff",
    type: "Agricultural Runoff",
    description: "Fertilizer-laden runoff from farmland and wetlands.",
    location: { lat: 22.6, lng: 88.43 },
    signature: { nitrate: 2.5, turbidity: 0.7, bod: 0.6 },
  },
  {
    name: "Budge Budge Thermal Discharge",
    type: "Thermal Power Plant",
    description: "Heated cooling-water discharge lowering dissolved oxygen.",
    location: { lat: 22.47, lng: 88.18 },
    signature: { temperature: 0.18, do: -0.35, tds: 0.4 },
  },
];