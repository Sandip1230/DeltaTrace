import { Router } from "express";
import { register, login, resendOtp, verifyOtp, me } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/resend-otp", resendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/me", protect, me);

export default router;