import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: String,
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  // deviation-from-baseline signature, e.g. { bod: 2.0, ph: -0.2 }
  signature: { type: mongoose.Schema.Types.Mixed, required: true },
});

export default mongoose.model("Source", sourceSchema);