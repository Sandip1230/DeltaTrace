import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, useAnimationControls } from "framer-motion";
import { Bell, FileText, LayoutDashboard, MapPin, Radar } from "lucide-react";
import "../../styles/nav.css";

export const TABS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/stations", label: "Stations", icon: MapPin },
  { path: "/tracker", label: "Tracker", icon: Radar },
  { path: "/alerts", label: "Alerts", icon: Bell },
  { path: "/reports", label: "Reports", icon: FileText },
];

export default function FloatingNav({ alertCount = 0 }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const found = TABS.findIndex((t) => pathname.startsWith(t.path));
  const active = found === -1 ? 0 : found;

  const barRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [ready, setReady] = useState(false);
  const [anim, setAnim] = useState({ active, from: active, dur: 0.6 });
  const controls = useAnimationControls();

  // derive animation info the moment the active tab changes
  if (anim.active !== active) {
    const n = Math.abs(active - anim.active);
    setAnim({ active, from: anim.active, dur: Math.min(1.3, 0.4 + 0.2 * n) });
  }

  useLayoutEffect(() => {
    const el = barRef.current;
    const measure = () => setWidth(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const t = setTimeout(() => setReady(true), 80);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, []);

  // ball hops once per tab it passes
  useEffect(() => {
    const n = Math.abs(anim.active - anim.from);
    if (!n) return;
    const h = n === 1 ? 46 : 30;
    const pts = 2 * n + 1;
    controls.start({
      y: Array.from({ length: pts }, (_, i) => (i % 2 ? -h : 0)),
      transition: {
        duration: anim.dur,
        times: Array.from({ length: pts }, (_, i) => i / (pts - 1)),
        ease: Array.from({ length: pts - 1 }, (_, i) => (i % 2 ? "easeIn" : "easeOut")),
      },
    });
  }, [anim, controls]);

  const nx = width ? ((active + 0.5) * width) / TABS.length : 0;
  const ActiveIcon = TABS[active].icon;

  return (
    <div className="fnav" style={{ "--nx": `${nx}px`, "--dur": ready ? `${anim.dur}s` : "0s" }}>
      <div className="fnav-ring" />

      <nav className="fnav-bar" ref={barRef}>
        {TABS.map((t, i) => {
          const Icon = t.icon;
          return (
            <button key={t.path} className={`fnav-item ${i === active ? "on" : ""}`} onClick={() => navigate(t.path)}>
              <span className="fnav-icon">
                <Icon size={20} />
                {t.path === "/alerts" && alertCount > 0 && <i className="fnav-badge">{alertCount}</i>}
              </span>
              <span className="fnav-label">{t.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="fnav-ball-pos">
        <motion.div className="fnav-ball" animate={controls}>
          <motion.div
            key={active}
            initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: Math.min(anim.dur * 0.8, 0.5) }}
          >
            <ActiveIcon size={22} strokeWidth={2.3} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}