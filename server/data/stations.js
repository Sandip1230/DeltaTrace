const S = (code, name, city, state, region, waterBody, type, lat, lng, extra = {}) => ({
  code, name, city, state, region, waterBody, type, location: { lat, lng }, ...extra,
});

// tier: 1 pristine, 2 good, 3 moderate, 4 polluted, 5 severe | temp: typical water temp (C)
// event: simulated pollution episode (reading index range 0-27)
export const stations = [
  // East: Kolkata (hand-tuned profiles in readings.js)
  S("DKS", "Dakshineswar", "Kolkata", "West Bengal", "East", "Hooghly River", "river", 22.6545, 88.3573, { riverOrder: 1 }),
  S("HWB", "Howrah Bridge", "Howrah", "West Bengal", "East", "Hooghly River", "river", 22.5851, 88.3468, { riverOrder: 2 }),
  S("GDR", "Garden Reach", "Kolkata", "West Bengal", "East", "Hooghly River", "river", 22.54, 88.299, { riverOrder: 3 }),
  S("ULB", "Uluberia", "Howrah", "West Bengal", "East", "Hooghly River", "river", 22.47, 88.11, { riverOrder: 4 }),
  S("TLG", "Tollygunge", "Kolkata", "West Bengal", "East", "Adi Ganga", "canal", 22.498, 88.345),
  S("SLK", "Salt Lake Outfall", "Kolkata", "West Bengal", "East", "Bagjola Canal", "canal", 22.6, 88.42),

  // North
  S("RSK", "Rishikesh", "Rishikesh", "Uttarakhand", "North", "Ganga River", "river", 30.0869, 78.2676, { riverOrder: 1, tier: 1, temp: 17 }),
  S("HRD", "Haridwar", "Haridwar", "Uttarakhand", "North", "Ganga River", "river", 29.9457, 78.1642, { riverOrder: 2, tier: 2, temp: 19 }),
  S("KNP", "Kanpur (Jajmau)", "Kanpur", "Uttar Pradesh", "North", "Ganga River", "river", 26.43, 80.37, { riverOrder: 3, tier: 4, temp: 27, event: { kind: "tannery", from: 20, to: 24 } }),
  S("PRG", "Prayagraj Sangam", "Prayagraj", "Uttar Pradesh", "North", "Ganga River", "river", 25.4358, 81.8463, { riverOrder: 4, tier: 4, temp: 27 }),
  S("VNS", "Varanasi", "Varanasi", "Uttar Pradesh", "North", "Ganga River", "river", 25.3176, 83.0104, { riverOrder: 5, tier: 4, temp: 27, event: { kind: "sewage", from: 12, to: 16 } }),
  S("DLY", "Delhi Nizamuddin", "Delhi", "Delhi", "North", "Yamuna River", "river", 28.5918, 77.25, { riverOrder: 1, tier: 5, temp: 26, event: { kind: "sewage", from: 18, to: 22 } }),
  S("AGR", "Agra", "Agra", "Uttar Pradesh", "North", "Yamuna River", "river", 27.175, 78.04, { riverOrder: 2, tier: 4, temp: 28 }),
  S("LKO", "Lucknow", "Lucknow", "Uttar Pradesh", "North", "Gomti River", "river", 26.8467, 80.9462, { tier: 4, temp: 27, event: { kind: "sewage", from: 6, to: 9 } }),
  S("LDH", "Ludhiana (Buddha Nullah)", "Ludhiana", "Punjab", "North", "Buddha Nullah", "canal", 30.901, 75.8573, { tier: 5, temp: 24, event: { kind: "textile", from: 21, to: 25 } }),
  S("KTA", "Kota", "Kota", "Rajasthan", "North", "Chambal River", "river", 25.2138, 75.8648, { tier: 2, temp: 27 }),
  S("SRN", "Srinagar", "Srinagar", "Jammu & Kashmir", "North", "Jhelum River", "river", 34.0837, 74.7973, { tier: 3, temp: 14 }),

  // West
  S("AMD", "Ahmedabad", "Ahmedabad", "Gujarat", "West", "Sabarmati River", "river", 23.0225, 72.5714, { tier: 4, temp: 29, event: { kind: "textile", from: 10, to: 14 } }),
  S("SRT", "Surat", "Surat", "Gujarat", "West", "Tapti River", "river", 21.1702, 72.8311, { tier: 3, temp: 29, event: { kind: "textile", from: 22, to: 26 } }),
  S("NSK", "Nashik", "Nashik", "Maharashtra", "West", "Godavari River", "river", 19.9975, 73.7898, { riverOrder: 1, tier: 3, temp: 27, event: { kind: "agricultural", from: 15, to: 19 } }),
  S("PUN", "Pune", "Pune", "Maharashtra", "West", "Mula-Mutha River", "river", 18.5204, 73.8567, { tier: 4, temp: 26 }),
  S("MUM", "Mumbai (Mithi)", "Mumbai", "Maharashtra", "West", "Mithi River", "river", 19.065, 72.865, { tier: 5, temp: 29, event: { kind: "sewage", from: 8, to: 12 } }),
  S("PNJ", "Panaji", "Panaji", "Goa", "West", "Mandovi River", "river", 15.4909, 73.8278, { tier: 2, temp: 29 }),

  // Central
  S("IND", "Indore", "Indore", "Madhya Pradesh", "Central", "Kan River", "river", 22.7196, 75.8577, { tier: 4, temp: 27, event: { kind: "chemical", from: 16, to: 20 } }),
  S("JBP", "Jabalpur (Bhedaghat)", "Jabalpur", "Madhya Pradesh", "Central", "Narmada River", "river", 23.1297, 79.8003, { tier: 2, temp: 26 }),
  S("BPL", "Bhopal Upper Lake", "Bhopal", "Madhya Pradesh", "Central", "Upper Lake", "lake", 23.2599, 77.4126, { tier: 3, temp: 26 }),
  S("RPR", "Raipur", "Raipur", "Chhattisgarh", "Central", "Kharun River", "river", 21.2514, 81.6296, { tier: 3, temp: 28, event: { kind: "mining", from: 5, to: 9 } }),

  // South
  S("HYD", "Hyderabad (Musi)", "Hyderabad", "Telangana", "South", "Musi River", "river", 17.385, 78.4867, { tier: 5, temp: 28, event: { kind: "chemical", from: 12, to: 16 } }),
  S("VJA", "Vijayawada", "Vijayawada", "Andhra Pradesh", "South", "Krishna River", "river", 16.5062, 80.648, { tier: 3, temp: 29, event: { kind: "agricultural", from: 18, to: 22 } }),
  S("RJY", "Rajahmundry", "Rajahmundry", "Andhra Pradesh", "South", "Godavari River", "river", 17.0005, 81.804, { riverOrder: 2, tier: 2, temp: 29 }),
  S("BLR", "Bengaluru (Bellandur)", "Bengaluru", "Karnataka", "South", "Bellandur Lake", "lake", 12.9304, 77.6784, { tier: 5, temp: 25, event: { kind: "sewage", from: 9, to: 13 } }),
  S("MYS", "Mysuru", "Mysuru", "Karnataka", "South", "Kaveri River", "river", 12.4219, 76.6947, { riverOrder: 1, tier: 2, temp: 26 }),
  S("TRC", "Tiruchirappalli", "Tiruchirappalli", "Tamil Nadu", "South", "Kaveri River", "river", 10.819, 78.69, { riverOrder: 2, tier: 2, temp: 29 }),
  S("CHN", "Chennai (Adyar)", "Chennai", "Tamil Nadu", "South", "Adyar River", "river", 13.01, 80.265, { tier: 4, temp: 30, event: { kind: "sewage", from: 14, to: 18 } }),
  S("TUP", "Tiruppur", "Tiruppur", "Tamil Nadu", "South", "Noyyal River", "river", 11.1085, 77.3411, { tier: 4, temp: 29, event: { kind: "textile", from: 4, to: 8 } }),
  S("KCH", "Kochi (Eloor)", "Kochi", "Kerala", "South", "Periyar River", "river", 10.0745, 76.2929, { tier: 4, temp: 29, event: { kind: "chemical", from: 19, to: 23 } }),

  // East (rest)
  S("PTN", "Patna", "Patna", "Bihar", "East", "Ganga River", "river", 25.5941, 85.1376, { riverOrder: 6, tier: 4, temp: 28 }),
  S("DHN", "Dhanbad", "Dhanbad", "Jharkhand", "East", "Damodar River", "river", 23.7957, 86.4304, { tier: 4, temp: 28, event: { kind: "mining", from: 11, to: 15 } }),
  S("CTC", "Cuttack", "Cuttack", "Odisha", "East", "Mahanadi River", "river", 20.4625, 85.883, { tier: 3, temp: 29 }),

  // Northeast
  S("GHY", "Guwahati", "Guwahati", "Assam", "Northeast", "Brahmaputra River", "river", 26.1445, 91.7362, { tier: 2, temp: 25 }),
  S("SHL", "Shillong (Umiam)", "Shillong", "Meghalaya", "Northeast", "Umiam Lake", "lake", 25.65, 91.89, { tier: 1, temp: 17 }),
  S("IMP", "Imphal", "Imphal", "Manipur", "Northeast", "Imphal River", "river", 24.817, 93.9368, { tier: 3, temp: 24 }),
];