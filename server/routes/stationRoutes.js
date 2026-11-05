import { Router } from "express";
import { getStations, getStationById, getStationReadings } from "../controllers/stationController.js";

const router = Router();
router.get("/", getStations);
router.get("/:id", getStationById);
router.get("/:id/readings", getStationReadings);

export default router;