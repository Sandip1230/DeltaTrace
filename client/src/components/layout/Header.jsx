import { Link } from "react-router-dom";
import { Droplets } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLive } from "../../context/LiveContext";
import MenuToggle from "../ui/MenuToggle";

export default function Header({ menuOpen, onMenu }) {
  const { user } = useAuth();
  const { connected } = useLive();

  return (
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="glass-bar mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-3">
          <MenuToggle open={menuOpen} onClick={onMenu} />
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-electric text-acid shadow-[0_8px_20px_-6px_#0145F2]">
              <Droplets size={20} />
            </span>
            <span className="hidden text-lg font-extrabold tracking-tight text-white min-[420px]:block">
              Delta<span className="text-lav">Trace</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-full border border-lav/30 bg-white/5 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-lav">
            <i className={`h-1.5 w-1.5 rounded-full ${connected ? "animate-pulse bg-acid" : "bg-red-400"}`} />
            {connected ? "Live" : "Offline"}
          </span>
          <button onClick={onMenu} className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-1 transition hover:bg-white/8 sm:pr-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-electric font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight text-white">{user?.name}</span>
              <span className="block text-xs capitalize text-white/60">{user?.role}</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}