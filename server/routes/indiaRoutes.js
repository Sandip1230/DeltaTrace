import { Router } from "express";
import { getIndiaSummary } from "../controllers/indiaController.js";

const router = Router();
router.get("/", getIndiaSummary);

export default router;