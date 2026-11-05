import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import Station from "../models/Station.js";
import Reading from "../models/Reading.js";
import Source from "../models/Source.js";
import { stations } from "./stations.js";
import { sources } from "./sources.js";
import { generateReadings } from "./readings.js";
import { calculateWQI } from "../services/wqiService.js";

const seed = async () => {
  await connectDB();

  await Promise.all([Station.deleteMany(), Reading.deleteMany(), Source.deleteMany()]);

  const createdStations = await Station.insertMany(stations);
  await Source.insertMany(sources);

  const allReadings = [];
  createdStations.forEach((st, idx) => {
    generateReadings(st.code, idx + 1).forEach((r) => {
      allReadings.push({ ...r, station: st._id, ...calculateWQI(r) });
    });
  });

  await Reading.insertMany(allReadings);

  console.log(`Seeded ${createdStations.length} stations, ${sources.length} sources, ${allReadings.length} readings`);
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});