import { useEffect } from "react";

// sets --mx/--my on the hovered .glass-hover element (powers the glow that follows the cursor)
export default function useSpotlight() {
  useEffect(() => {
    const move = (e) => {
      const el = e.target.closest?.(".glass-hover");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
}