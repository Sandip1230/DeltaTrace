import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import HudCorners from "../ui/HudCorners";
import { STATUS_COLORS, getStatus } from "../../utils/wqi";

const LINES = [
  { c: "text-white/45", t: "$ deltatrace --watch hooghly" },
  { c: "text-emerald-300", t: "[OK]     6 stations online" },
  { c: "text-amber-300", t: "[WARN]   Garden Reach · TDS above limit" },
  { c: "text-red-400", t: "[CRIT]   Garden Reach · BOD critical" },
  { c: "text-aqua-300", t: "[TRACE]  fingerprint match: Tannery" },
  { c: "text-neon-pink", t: "[RESULT] confidence 82% · sample" },
];

function Terminal() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setN((x) => (x >= LINES.length + 2 ? 1 : x + 1)), 1100);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative mt-4 min-h-[150px] overflow-hidden rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-[11px] leading-relaxed sm:text-xs">
      <div className="scan" />
      {LINES.slice(0, n).map((l, i) => (
        <motion.p key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={l.c}>
          {l.t}
        </motion.p>
      ))}
      <span className="inline-block h-3 w-1.5 animate-pulse bg-aqua-300 align-middle" />
    </div>
  );
}

export default function HeroPreview() {
  const [wqi, setWqi] = useState(42.6);
  const [bars, setBars] = useState(() => Array.from({ length: 28 }, () => 20 + Math.random() * 70));

  useEffect(() => {
    const t = setInterval(() => {
      setWqi((w) => Number(Math.min(70, Math.max(28, w + (Math.random() - 0.5) * 4)).toFixed(1)));
      setBars((b) => [...b.slice(1), 20 + Math.random() * 70]);
    }, 1400);
    return () => clearInterval(t);
  }, []);

  const status = getStatus(wqi);
  const color = STATUS_COLORS[status];

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="glass-strong glass-hover relative p-5 sm:p-6"
    >
      <HudCorners />
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <i className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <i className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <span className="chip">
          <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live sample
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/45">Station · Garden Reach</p>
          <p className="mt-1 text-5xl font-extrabold tabular-nums" style={{ color, textShadow: `0 0 28px ${color}99` }}>{wqi}</p>
          <p className="text-sm font-semibold" style={{ color }}>{status}</p>
        </div>
        <div className="flex h-24 flex-1 items-end gap-[3px]">
          {bars.map((b, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-gradient-to-t from-aqua-500/20 to-aqua-300"
              style={{ height: `${b}%`, transition: "height .9s ease", opacity: 0.35 + (i / bars.length) * 0.65 }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
        {[["pH", "7.2"], ["DO", "4.8"], ["BOD", "5.5"], ["TDS", "520"]].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-white/8 bg-white/5 py-1.5">
            <p className="font-mono text-[10px] text-white/45">{k}</p>
            <p className="font-semibold">{v}</p>
          </div>
        ))}
      </div>

      <Terminal />
    </motion.div>
  );
}