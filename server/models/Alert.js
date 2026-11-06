import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    station: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    reading: { type: mongoose.Schema.Types.ObjectId, ref: "Reading" },
    parameter: { type: String, required: true },
    value: Number,
    threshold: Number,
    direction: { type: String, enum: ["above", "below"] },
    severity: { type: String, enum: ["warning", "critical"], required: true },
    message: String,
    status: { type: String, enum: ["open", "acknowledged", "resolved"], default: "open" },
    acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    acknowledgedAt: Date,
    resolvedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Alert", alertSchema);