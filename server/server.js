import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import { startMockStream } from "./services/mockStream.js";

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  app.listen(PORT, () => console.log(`DeltaTrace server running on port ${PORT}`));
  if (process.env.ENABLE_STREAM === "true") {
    await startMockStream(Number(process.env.STREAM_INTERVAL_MS) || 15000);
  }
});