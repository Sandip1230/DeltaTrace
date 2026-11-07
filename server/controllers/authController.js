import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const RESEND_SECONDS = 40;
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const httpError = (status, message) => Object.assign(new Error(message), { status });
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "7d" });

async function issueOtp(user) {
  const otp = String(crypto.randomInt(1000, 10000));
  user.otpHash = sha(otp);
  user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
  user.otpSentAt = new Date();
  user.otpAttempts = 0;
  await user.save();
  console.log(`[DeltaTrace] OTP for ${user.email}: ${otp}`);
  return otp;
}

const otpResponse = (user, otp) => ({
  message: "OTP sent",
  email: user.email,
  resendIn: RESEND_SECONDS,
  ...((process.env.NODE_ENV !== "production" || process.env.SHOW_DEV_OTP === "true") && { devOtp: otp }),
});

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw httpError(400, "All fields are required");
  if (password.length < 6) throw httpError(400, "Password must be at least 6 characters");

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw httpError(409, "Email already registered");

  await User.create({ name, email, password });
  res.status(201).json({ message: "Registered. Please log in." });
};

export const login = async (req, res) => {
  const email = String(req.body.email || "").toLowerCase();
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(req.body.password || ""))) {
    throw httpError(401, "Invalid email or password");
  }
  const otp = await issueOtp(user);
  res.json(otpResponse(user, otp));
};

export const resendOtp = async (req, res) => {
  const email = String(req.body.email || "").toLowerCase();
  const user = await User.findOne({ email });
  if (!user) throw httpError(404, "User not found");

  const waited = user.otpSentAt ? (Date.now() - user.otpSentAt.getTime()) / 1000 : Infinity;
  if (waited < RESEND_SECONDS) {
    throw httpError(429, `Wait ${Math.ceil(RESEND_SECONDS - waited)}s before requesting a new code`);
  }
  const otp = await issueOtp(user);
  res.json(otpResponse(user, otp));
};

export const verifyOtp = async (req, res) => {
  const email = String(req.body.email || "").toLowerCase();
  const otp = String(req.body.otp || "");

  const user = await User.findOne({ email }).select("+otpHash");
  if (!user || !user.otpHash) throw httpError(400, "No OTP requested");
  if (user.otpExpires < new Date()) throw httpError(400, "OTP expired");
  if (user.otpAttempts >= MAX_ATTEMPTS) throw httpError(429, "Too many attempts. Request a new code");

  if (sha(otp) !== user.otpHash) {
    user.otpAttempts += 1;
    await user.save();
    throw httpError(400, "Invalid OTP");
  }

  user.otpHash = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.json({
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

export const me = async (req, res) => res.json(req.user);