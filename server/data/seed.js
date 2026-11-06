import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import Station from "../models/Station.js";
import Reading from "../models/Reading.js";
import Source from "../models/Source.js";
import Alert from "../models/Alert.js";
import User from "../models/User.js";
import { stations } from "./stations.js";
import { sources } from "./sources.js";
import { generateReadings } from "./readings.js";
import { calculateWQI } from "../services/wqiService.js";
import { syncAlerts } from "../services/alertService.js";

const seed = async () => {
  await connectDB();

  await Promise.all([
    Station.deleteMany(), Reading.deleteMany(), Source.deleteMany(), Alert.deleteMany(), User.deleteMany(),
  ]);

  const createdStations = await Station.insertMany(stations);
  await Source.insertMany(sources);

  const allReadings = [];
  createdStations.forEach((st, idx) => {
    generateReadings(st.code, idx + 1).forEach((r) => {
      allReadings.push({ ...r, station: st._id, ...calculateWQI(r) });
    });
  });
  await Reading.insertMany(allReadings);

  await User.create({ name: "Admin", email: "admin@deltatrace.com", password: "Admin@123", role: "admin" });
  await User.create({ name: "Viewer", email: "viewer@deltatrace.com", password: "Viewer@123", role: "viewer" });

  const alerts = await syncAlerts();

  console.log(`Seeded ${createdStations.length} stations, ${sources.length} sources, ${allReadings.length} readings`);
  console.log(`Alerts: ${alerts.created} created | Users: admin@deltatrace.com / Admin@123`);
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});