import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Droplets, Home, LogOut } from "lucide-react";
import { TABS } from "./FloatingNav";
import { useAuth } from "../../context/AuthContext";
import { useLive } from "../../context/LiveContext";

export default function SideMenu({ open, onClose, alertCount = 0 }) {
  const { user, logout } = useAuth();
  const { connected } = useLive();
  const nav = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", esc);
    };
  }, [open, onClose]);

  const go = (p) => {
    onClose();
    nav(p);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      {open && (
        <motion.aside
          key="panel"
          className="glass-strong fixed bottom-3 left-3 top-3 z-50 flex w-[min(86vw,330px)] flex-col p-5"
          initial={{ x: "-112%" }} animate={{ x: 0 }} exit={{ x: "-112%" }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
        >
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-aqua-500/20 text-aqua-300 shadow-[0_0_20px_-4px_#38d5f0]"><Droplets size={20} /></span>
            <span className="text-lg font-extrabold tracking-tight">Delta<span className="text-aqua-400">Trace</span></span>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-aqua-400 to-neon-violet text-lg font-bold text-ocean-950">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{user?.name}</p>
              <p className="flex items-center gap-1.5 text-xs capitalize text-white/50">
                <i className={`h-1.5 w-1.5 rounded-full ${connected ? "animate-pulse bg-emerald-400" : "bg-red-400"}`} />
                {user?.role} · {connected ? "live" : "offline"}
              </p>
            </div>
          </div>

          <p className="mb-2 mt-6 font-mono text-[11px] uppercase tracking-widest text-white/35">Navigate</p>
          <div className="grid gap-1.5">
            {TABS.map((t, i) => {
              const on = pathname.startsWith(t.path);
              return (
                <motion.button
                  key={t.path}
                  onClick={() => go(t.path)}
                  initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.08 + i * 0.05 }}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm font-semibold transition ${
                    on
                      ? "border-aqua-400/50 bg-aqua-400/10 text-aqua-300 shadow-[0_0_24px_-8px_#38d5f0]"
                      : "border-transparent text-white/70 hover:border-white/10 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <t.icon size={18} />
                  {t.label}
                  {t.path === "/alerts" && alertCount > 0 && (
                    <span className="ml-auto rounded-full bg-red-400 px-2 py-0.5 text-[11px] font-bold text-white">{alertCount}</span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-auto grid gap-2 pt-6">
            <button onClick={() => go("/")} className="btn-ghost !justify-start !py-3 text-sm"><Home size={16} /> Landing page</button>
            <button
              onClick={() => { onClose(); logout(); }}
              className="flex items-center gap-2 rounded-[14px] border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/20 hover:shadow-[0_0_24px_-6px_#f87171]"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}