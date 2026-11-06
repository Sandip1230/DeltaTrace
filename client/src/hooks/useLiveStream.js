import { useEffect, useRef, useState } from "react";

export default function useLiveStream(onReadings) {
  const [connected, setConnected] = useState(false);
  const cb = useRef(onReadings);

  useEffect(() => {
    cb.current = onReadings;
  }, [onReadings]);

  useEffect(() => {
    const token = localStorage.getItem("dt_token");
    if (!token) return;

    const es = new EventSource(`/api/stream?token=${token}`);
    es.addEventListener("connected", () => setConnected(true));
    es.addEventListener("readings", (e) => cb.current?.(JSON.parse(e.data)));
    es.onerror = () => setConnected(false);

    return () => es.close();
  }, []);

  return connected;
}