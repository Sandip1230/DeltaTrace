import mongoose from "mongoose";

const readingSchema = new mongoose.Schema({
  station: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true, index: true },
  timestamp: { type: Date, required: true, index: true },
  ph: Number,
  do: Number,
  bod: Number,
  turbidity: Number,
  tds: Number,
  temperature: Number,
  nitrate: Number,
  wqi: Number,
  status: String,
});

export default mongoose.model("Reading", readingSchema);