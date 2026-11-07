import { Droplets, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLive } from "../../context/LiveContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { connected } = useLive();

  return (
    <header className="sticky top-0 z-30 px-4 pt-4">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-aqua-500/20 text-aqua-300">
            <Droplets size={20} />
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Delta<span className="text-aqua-400">Trace</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold">
            <span className={`h-2 w-2 rounded-full ${connected ? "animate-pulse bg-emerald-400" : "bg-red-400"}`} />
            {connected ? "Live" : "Offline"}
          </span>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight">{user?.name}</p>
            <p className="text-xs capitalize text-white/50">{user?.role}</p>
          </div>
          <button onClick={logout} title="Logout" className="glass glass-hover grid h-9 w-9 place-items-center">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}