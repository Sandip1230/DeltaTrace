import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

export default function CountUp({ to, decimals = 0, duration = 1.2, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const prev = useRef(0);
  const [v, setV] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const c = animate(prev.current, to, {
      duration,
      ease: "easeOut",
      onUpdate: (x) => {
        prev.current = x;
        setV(x);
      },
    });
    return () => c.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}