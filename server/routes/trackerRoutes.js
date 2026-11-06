import { Router } from "express";
import { analyseAll, analyseStation, simulate } from "../controllers/trackerController.js";

const router = Router();
router.get("/", analyseAll);
router.post("/simulate", simulate);
router.get("/:stationId", analyseStation);

export default router;