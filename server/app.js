import express from "express";
import cors from "cors";
import stationRoutes from "./routes/stationRoutes.js";
import readingRoutes from "./routes/readingRoutes.js";
import sourceRoutes from "./routes/sourceRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "DeltaTrace API", time: new Date().toISOString() });
});

app.use("/api/stations", stationRoutes);
app.use("/api/readings", readingRoutes);
app.use("/api/sources", sourceRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use(errorHandler);

export default app;