import { Router } from "express";
import { addClient } from "../services/mockStream.js";

const router = Router();

router.get("/", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  res.write("event: connected\ndata: {}\n\n");
  addClient(res);
});

export default router;