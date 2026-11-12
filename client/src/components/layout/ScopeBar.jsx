import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { REGIONS, useScope } from "../../context/ScopeContext";

export default function ScopeBar() {
  const { region, setRegion } = useScope();

  return (
    <div className="mx-auto max-w-6xl px-3 pt-4 sm:px-4">
      <div className="glass flex items-center gap-1 overflow-x-auto p-1.5 [scrollbar-width:none]">
        <span className="hidden shrink-0 items-center gap-1.5 pl-3 pr-2 font-mono text-[11px] uppercase tracking-widest text-white/40 sm:flex">
          <Globe size={13} /> Scope
        </span>
        {REGIONS.map((r) => (
          <button
            key={r.id}
            onClick={() => setRegion(r.id)}
            className={`relative shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${region === r.id ? "text-aqua-300" : "text-white/60 hover:text-white"}`}
          >
            {region === r.id && (
              <motion.span
                layoutId="scope-pill"
                className="absolute inset-0 rounded-xl bg-aqua-500/20 shadow-[0_0_20px_-4px_#38d5f0] ring-1 ring-aqua-400/60"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}