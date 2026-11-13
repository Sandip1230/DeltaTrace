import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { ArrowUp } from "lucide-react";

const C = 2 * Math.PI * 21;

export default function BackToTop({ bottom = 24 }) {
  const [y, setY] = useState(0);
  const [p, setP] = useState(0);

  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setY(window.scrollY);
      setP(h > 0 ? Math.min(window.scrollY / h, 1) : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  return (
    <AnimatePresence>
      {y > 400 && (
        <motion.button
          key="btt"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          className="glass-lav fixed right-4 z-40 grid h-[52px] w-[52px] place-items-center rounded-full sm:right-6"
          style={{ bottom }}
        >
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="21" fill="none" stroke="rgba(0,17,77,.15)" strokeWidth="2.5" />
            <circle
              cx="26" cy="26" r="21" fill="none" stroke="#0145F2" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - p)}
            />
          </svg>
          <ArrowUp size={18} className="text-ocean-950" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-lav via-white to-acid"
      style={{ scaleX: scrollYProgress }}
    />
  );
}