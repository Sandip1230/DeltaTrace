import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import "./DashboardLoader.css";

const MESSAGES = [
  "Searching station data",
  "Synchronizing water quality readings",
  "Mapping the monitoring network",
  "India station network acquired",
];

export default function DashboardLoader({ readyToReveal, onFocusComplete, onComplete }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const focusTimer = window.setTimeout(() => {
      setFocused(true);
      setMessageIndex(MESSAGES.length - 1);
      onFocusComplete();
    }, reducedMotion ? 0 : 12000);
    return () => window.clearTimeout(focusTimer);
  }, [onFocusComplete]);

  useEffect(() => {
    if (focused) return undefined;
    const interval = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % (MESSAGES.length - 1));
    }, 1600);
    return () => window.clearInterval(interval);
  }, [focused]);

  useEffect(() => {
    if (!readyToReveal) return undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const transitionTimer = window.setTimeout(onComplete, reducedMotion ? 0 : 1100);
    return () => window.clearTimeout(transitionTimer);
  }, [readyToReveal, onComplete]);

  return createPortal(
    <motion.div
      className={`dashboard-loader${focused ? " is-focused" : ""}${readyToReveal ? " is-zooming" : ""}`}
      role="status"
      aria-live="polite"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="dashboard-loader__content">
        <div className="dashboard-loader__scene" aria-hidden="true">
          <div className="dashboard-loader__orbit" />
          <div className="dashboard-loader__atmosphere">
            <div className="dashboard-loader__earth">
              <div className="dashboard-loader__surface">
                {Array.from({ length: 4 }, (_, index) => (
                  <img key={index} src="/earth-borders.svg" alt="" draggable="false" />
                ))}
              </div>
              <div className="dashboard-loader__shade" />
            </div>
          </div>
        </div>

        <div className="dashboard-loader__copy">
          <p className="dashboard-loader__eyebrow">DeltaTrace · Live network</p>
          <p key={messageIndex} className="dashboard-loader__message">{MESSAGES[messageIndex]}...</p>
          <div className="dashboard-loader__progress" aria-hidden="true"><span /></div>
          <p className="dashboard-loader__detail">Establishing real-time connection</p>
        </div>
      </div>
    </motion.div>,
    document.body
  );
}
