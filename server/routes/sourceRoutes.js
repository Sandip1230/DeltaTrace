import { Router } from "express";
import { getSources } from "../controllers/sourceController.js";

const router = Router();
router.get("/", getSources);

export default router;