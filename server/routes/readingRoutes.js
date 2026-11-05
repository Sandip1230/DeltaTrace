import { Router } from "express";
import { getLatestReadings, getSummary, getReadings } from "../controllers/readingController.js";

const router = Router();
router.get("/latest", getLatestReadings);
router.get("/summary", getSummary);
router.get("/", getReadings);

export default router;