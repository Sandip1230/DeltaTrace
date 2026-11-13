import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { REGIONS, useScope } from "../../context/ScopeContext";

export default function ScopeBar() {
  const { region, setRegion } = useScope();

  return (
    <div className="mx-auto max-w-6xl px-3 pt-4 sm:px-4">
      <div className="glass-lav flex items-center gap-1 overflow-x-auto p-1.5 [scrollbar-width:none]">
        <span className="hidden shrink-0 items-center gap-1.5 pl-3 pr-2 font-mono text-[11px] font-bold uppercase tracking-widest text-ocean-950/60 sm:flex">
          <Globe size={13} /> Scope
        </span>
        {REGIONS.map((r) => (
          <button
            key={r.id}
            onClick={() => setRegion(r.id)}
            className={`relative shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${region === r.id ? "text-acid" : "text-ocean-950/70 hover:text-ocean-950"}`}
          >
            {region === r.id && (
              <motion.span
                layoutId="scope-pill"
                className="absolute inset-0 rounded-xl bg-ocean-950 shadow-[0_6px_18px_-6px_#00114D]"
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