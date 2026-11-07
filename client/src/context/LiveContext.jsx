import { createContext, useCallback, useContext, useState } from "react";
import useLiveStream from "../hooks/useLiveStream";

const LiveContext = createContext({ connected: false, tick: 0, events: [], lastUpdate: null });
export const useLive = () => useContext(LiveContext);

export function LiveProvider({ children }) {
  const [tick, setTick] = useState(0);
  const [events, setEvents] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  const onReadings = useCallback((batch) => {
    setTick((t) => t + 1);
    setLastUpdate(new Date());
    const spikes = batch
      .filter((b) => b.spike)
      .map((b) => ({
        id: `${b.stationCode}-${b.timestamp}`,
        time: b.timestamp,
        station: b.stationName,
        wqi: b.wqi,
        spike: b.spike,
      }));
    if (spikes.length) setEvents((e) => [...spikes, ...e].slice(0, 8));
  }, []);

  const connected = useLiveStream(onReadings);

  return (
    <LiveContext.Provider value={{ connected, tick, events, lastUpdate }}>{children}</LiveContext.Provider>
  );
}