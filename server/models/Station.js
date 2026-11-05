import mongoose from "mongoose";

const stationSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    waterBody: { type: String, required: true },
    type: { type: String, enum: ["river", "canal"], default: "river" },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Station", stationSchema);