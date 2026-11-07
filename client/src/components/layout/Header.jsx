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
      <div className="glass mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-3">
          <MenuToggle open={menuOpen} onClick={onMenu} />
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-aqua-500/20 text-aqua-300 shadow-[0_0_20px_-4px_#38d5f0]"><Droplets size={20} /></span>
            <span className="hidden text-lg font-extrabold tracking-tight min-[420px]:block">Delta<span className="text-aqua-400">Trace</span></span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="chip !py-1.5">
            <i className={`h-1.5 w-1.5 rounded-full ${connected ? "animate-pulse bg-emerald-400" : "bg-red-400"}`} />
            {connected ? "Live" : "Offline"}
          </span>
          <button onClick={onMenu} className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-1 transition hover:bg-white/8 sm:pr-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-aqua-400 to-neon-violet font-bold text-ocean-950">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight">{user?.name}</span>
              <span className="block text-xs capitalize text-white/50">{user?.role}</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}