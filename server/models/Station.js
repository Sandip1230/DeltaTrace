import mongoose from "mongoose";

const stationSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    city: String,
    state: { type: String, index: true },
    region: { type: String, enum: ["North", "South", "East", "West", "Central", "Northeast"], index: true },
    waterBody: { type: String, required: true },
    type: { type: String, enum: ["river", "canal", "lake"], default: "river" },
    riverOrder: { type: Number, default: 0 },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Station", stationSchema);