import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import stationRoutes from "./routes/stationRoutes.js";
import readingRoutes from "./routes/readingRoutes.js";
import sourceRoutes from "./routes/sourceRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import trackerRoutes from "./routes/trackerRoutes.js";
import streamRoutes from "./routes/streamRoutes.js";
import { protect } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import indiaRoutes from "./routes/indiaRoutes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : true }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "DeltaTrace API", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/stations", protect, stationRoutes);
app.use("/api/readings", protect, readingRoutes);
app.use("/api/sources", protect, sourceRoutes);
app.use("/api/alerts", protect, alertRoutes);
app.use("/api/tracker", protect, trackerRoutes);
app.use("/api/stream", protect, streamRoutes);
app.use("/api/india", protect, indiaRoutes);
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use(errorHandler);

export default app;