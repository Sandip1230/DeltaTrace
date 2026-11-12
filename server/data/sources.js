export const SIG = {
  sewage: { bod: 3.0, do: -0.6, nitrate: 1.2, turbidity: 0.8 },
  tannery: { ph: -0.15, bod: 2.0, tds: 1.5, turbidity: 0.8 },
  textile: { ph: 0.15, turbidity: 2.0, tds: 1.2, bod: 0.8 },
  agricultural: { nitrate: 2.5, turbidity: 0.7, bod: 0.6 },
  thermal: { temperature: 0.18, do: -0.35, tds: 0.4 },
  chemical: { ph: -0.1, tds: 1.3, nitrate: 1.8, bod: 0.9, turbidity: 0.4 },
  distillery: { bod: 3.5, do: -0.55, ph: -0.12, turbidity: 0.5 },
  mining: { turbidity: 3.0, tds: 1.0, ph: -0.15 },
};

const LABEL = {
  sewage: "Domestic Sewage", tannery: "Tannery", textile: "Textile Dyeing", agricultural: "Agricultural Runoff",
  thermal: "Thermal Power Plant", chemical: "Chemical Industry", distillery: "Sugar & Distillery", mining: "Mining & Ore Washing",
};

const DESC = {
  sewage: "Untreated or partly treated municipal sewage with a heavy organic load.",
  tannery: "Leather processing effluent: high TDS and organic load, lowered pH.",
  textile: "Dye-house effluent with high alkalinity, turbidity and dissolved solids.",
  agricultural: "Fertilizer-laden runoff from farmland and wetlands.",
  thermal: "Heated cooling-water discharge that lowers dissolved oxygen.",
  chemical: "Industrial chemical and fertiliser effluent: dissolved salts and nutrients.",
  distillery: "Molasses and spent-wash effluent with a very high BOD.",
  mining: "Ore and coal washing: very high turbidity and dissolved solids.",
};

const src = (name, kind, state, region, lat, lng) => ({
  name, kind, type: LABEL[kind], description: DESC[kind], state, region, location: { lat, lng }, signature: SIG[kind],
});

// Illustrative locations for the academic demo (not verified pollution records)
export const sources = [
  // East
  src("Bantala Tannery Cluster", "tannery", "West Bengal", "East", 22.52, 88.43),
  src("Howrah Textile Dyeing Units", "textile", "West Bengal", "East", 22.59, 88.31),
  src("Tolly Nullah Sewage Outfall", "sewage", "West Bengal", "East", 22.5, 88.35),
  src("Eastern Fringe Agricultural Runoff", "agricultural", "West Bengal", "East", 22.6, 88.43),
  src("Budge Budge Thermal Discharge", "thermal", "West Bengal", "East", 22.47, 88.18),
  src("Dhanbad Coalfield Washeries", "mining", "Jharkhand", "East", 23.8, 86.43),
  src("Patna Urban Drains", "sewage", "Bihar", "East", 25.6, 85.12),
  src("Cuttack Urban Drains", "sewage", "Odisha", "East", 20.47, 85.88),
  // North
  src("Jajmau Tannery Belt", "tannery", "Uttar Pradesh", "North", 26.42, 80.4),
  src("Agra Foundry & Leather Cluster", "tannery", "Uttar Pradesh", "North", 27.19, 78.02),
  src("Prayagraj Drain Outfalls", "sewage", "Uttar Pradesh", "North", 25.44, 81.85),
  src("Varanasi Ghat Drains", "sewage", "Uttar Pradesh", "North", 25.31, 83.01),
  src("Lucknow Urban Drains", "sewage", "Uttar Pradesh", "North", 26.85, 80.93),
  src("Delhi Drain Outfalls", "sewage", "Delhi", "North", 28.58, 77.26),
  src("Ludhiana Dyeing & Electroplating Cluster", "textile", "Punjab", "North", 30.89, 75.86),
  src("Kota Fertiliser Complex", "chemical", "Rajasthan", "North", 25.18, 75.87),
  src("Srinagar Urban Drains", "sewage", "Jammu & Kashmir", "North", 34.09, 74.8),
  // West
  src("Vatva Industrial Estate", "chemical", "Gujarat", "West", 22.97, 72.65),
  src("Narol Textile Processing Cluster", "textile", "Gujarat", "West", 22.96, 72.62),
  src("Surat Dyeing Belt", "textile", "Gujarat", "West", 21.15, 72.85),
  src("Mithi Drain Outfalls", "sewage", "Maharashtra", "West", 19.07, 72.87),
  src("Pune Urban Drains", "sewage", "Maharashtra", "West", 18.52, 73.86),
  src("Nashik Farm Runoff", "agricultural", "Maharashtra", "West", 20.0, 73.78),
  // Central
  src("Pithampur Industrial Area", "chemical", "Madhya Pradesh", "Central", 22.62, 75.69),
  src("Bhopal Lake Inflows", "sewage", "Madhya Pradesh", "Central", 23.26, 77.4),
  src("Bhilai-Raipur Sponge-Iron Belt", "mining", "Chhattisgarh", "Central", 21.22, 81.42),
  // South
  src("Patancheru Bulk-Drug Cluster", "chemical", "Telangana", "South", 17.53, 78.27),
  src("Hyderabad Urban Drains", "sewage", "Telangana", "South", 17.4, 78.47),
  src("Bengaluru Lake Inflows", "sewage", "Karnataka", "South", 12.94, 77.7),
  src("Tiruppur Dyeing Cluster", "textile", "Tamil Nadu", "South", 11.11, 77.34),
  src("Chennai Adyar-Cooum Drains", "sewage", "Tamil Nadu", "South", 13.05, 80.25),
  src("Eloor Industrial Belt", "chemical", "Kerala", "South", 10.08, 76.3),
  src("Mandya Sugar & Distillery Belt", "distillery", "Karnataka", "South", 12.52, 76.9),
  src("Krishna Delta Farm Runoff", "agricultural", "Andhra Pradesh", "South", 16.52, 80.6),
  // Northeast
  src("Bharalu Drain, Guwahati", "sewage", "Assam", "Northeast", 26.16, 91.76),
  src("Imphal Urban Drains", "sewage", "Manipur", "Northeast", 24.82, 93.94),
  src("Shillong Urban Drains", "sewage", "Meghalaya", "Northeast", 25.57, 91.88),
];