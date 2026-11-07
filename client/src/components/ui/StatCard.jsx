import { motion } from "framer-motion";
import CountUp from "./CountUp";

export default function StatCard({ icon: Icon, label, value, sub, accent = "#38d5f0", decimals = 0, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="glass glass-hover group overflow-hidden p-5"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-25 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: accent }}
      />
      <div className="relative flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-wider text-white/55">{label}</p>
        <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${accent}1f`, color: accent, boxShadow: `0 0 18px -4px ${accent}` }}>
          <Icon size={18} />
        </span>
      </div>
      <p className="relative mt-3 truncate text-3xl font-bold tracking-tight">
        {typeof value === "number" ? <CountUp to={value} decimals={decimals} /> : value}
      </p>
      {sub && <p className="relative mt-1 text-xs text-white/50">{sub}</p>}
    </motion.div>
  );
}