import { useEffect, useState } from "react";
import { motion, useAnimationControls, useTransform } from "framer-motion";

const STEP = 78; // box 64 + gap 14
const R = 74; // orbit radius
const BASE = [180, 270, 0, 90]; // left, top, right, bottom
const rad = (d) => (d * Math.PI) / 180;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// p: 0 -> 0.4 row to diamond (flip 180deg), 0.4 -> 1 spiral into centre
function pose(i, p) {
  const rowX = (i - 1.5) * STEP;
  if (p < 0.4) {
    const e = ease(p / 0.4);
    return {
      x: rowX + (R * Math.cos(rad(BASE[i])) - rowX) * e,
      y: R * Math.sin(rad(BASE[i])) * e,
      rot: 180 * e,
      s: 1,
    };
  }
  const t = ease((p - 0.4) / 0.6);
  const a = rad(BASE[i] + 360 * t);
  const r = R * (1 - t);
  return { x: r * Math.cos(a), y: r * Math.sin(a), rot: 180 + 360 * t, s: 1 - 0.3 * t };
}

function OrbitBox({ i, digit, progress }) {
  const x = useTransform(progress, (p) => pose(i, p).x);
  const y = useTransform(progress, (p) => pose(i, p).y);
  const rotate = useTransform(progress, (p) => pose(i, p).rot);
  const scale = useTransform(progress, (p) => pose(i, p).s);
  const opacity = useTransform(progress, (p) => (p > 0.85 ? 1 - (p - 0.85) / 0.15 : 1));
  return (
    <motion.div className="otp-orbit" style={{ x, y, rotate, scale, opacity }}>
      {digit}
    </motion.div>
  );
}

export default function OtpStage({ value, phase, progress, inputRef, onChange, shakeKey }) {
  const [focused, setFocused] = useState(false);
  const controls = useAnimationControls();

  const ringOpacity = useTransform(progress, (p) =>
    p < 0.2 ? 0 : p < 0.4 ? ((p - 0.2) / 0.2) * 0.8 : p > 0.8 ? Math.max(0, 1 - (p - 0.8) / 0.2) * 0.8 : 0.8
  );
  const mergedOpacity = useTransform(progress, (p) => (p > 0.85 ? (p - 0.85) / 0.15 : 0));
  const mergedScale = useTransform(progress, (p) => (p > 0.85 ? 0.7 + ((p - 0.85) / 0.15) * 0.3 : 0.7));

  useEffect(() => {
    if (shakeKey) controls.start({ x: [0, -10, 10, -7, 7, 0], transition: { duration: 0.4 } });
  }, [shakeKey, controls]);

  const active = Math.min(value.length, 3);

  return (
    <motion.div className="otp-stage" animate={controls} onClick={() => inputRef.current?.focus()}>
      <input
        ref={inputRef}
        className="otp-hidden-input"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={4}
        value={value}
        disabled={phase !== "input"}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label="4-digit OTP"
      />

      {phase === "input" &&
        [0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`otp-slot ${focused && i === active ? "active" : ""}`}
            style={{ transform: `translateX(${(i - 1.5) * STEP}px)` }}
          >
            <div className="otp-box">
              {value[i] ? value[i] : focused && i === active ? <span className="otp-caret" /> : null}
            </div>
          </div>
        ))}

      {phase === "merging" && (
        <>
          <motion.svg
            width={2 * R + 8}
            height={2 * R + 8}
            style={{ position: "absolute", left: "50%", top: "50%", marginLeft: -(R + 4), marginTop: -(R + 4), opacity: ringOpacity }}
          >
            <circle cx={R + 4} cy={R + 4} r={R} fill="none" stroke="rgba(245,197,66,.4)" strokeWidth="1.5" strokeDasharray="3 7" strokeLinecap="round" />
          </motion.svg>
          {value.split("").map((d, i) => (
            <OrbitBox key={i} i={i} digit={d} progress={progress} />
          ))}
        </>
      )}

      {(phase === "merging" || phase === "verifying") && (
        <motion.div className="otp-merged" style={{ opacity: mergedOpacity, scale: mergedScale }}>
          <div />
        </motion.div>
      )}

      {phase === "verified" && (
        <motion.div
          className="otp-check"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.4 }} />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}