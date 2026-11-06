import { Router } from "express";
import {
  getAlerts, getAlertStats, acknowledgeAlert, resolveAlert, syncNow,
} from "../controllers/alertController.js";
import { adminOnly } from "../middleware/auth.js";

const router = Router();
router.get("/", getAlerts);
router.get("/stats", getAlertStats);
router.post("/sync", adminOnly, syncNow);
router.patch("/:id/acknowledge", acknowledgeAlert);
router.patch("/:id/resolve", resolveAlert);

export default router;