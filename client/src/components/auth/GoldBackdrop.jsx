export default function GoldBackdrop() {
  return (
    <div className="gold-backdrop" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="gA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6b3f0c" stopOpacity="0" />
            <stop offset="0.3" stopColor="#c8841f" />
            <stop offset="0.6" stopColor="#ffd98a" />
            <stop offset="1" stopColor="#7a4a10" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gB" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1a1a1d" stopOpacity="0" />
            <stop offset="0.4" stopColor="#3a3a40" />
            <stop offset="0.65" stopColor="#7a7a84" />
            <stop offset="1" stopColor="#1a1a1d" stopOpacity="0" />
          </linearGradient>
          <filter id="b18" x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="b5" x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <g className="drift">
          <path d="M-150 700 C 250 560, 520 820, 880 600 S 1320 330, 1600 420" stroke="url(#gA)" strokeWidth="90" fill="none" filter="url(#b18)" opacity="0.9" />
          <path d="M-150 700 C 250 560, 520 820, 880 600 S 1320 330, 1600 420" stroke="url(#gA)" strokeWidth="7" fill="none" filter="url(#b5)" opacity="0.9" />
          <path d="M-120 140 C 260 330, 560 60, 920 250 S 1340 560, 1600 470" stroke="url(#gB)" strokeWidth="110" fill="none" filter="url(#b18)" />
          <path d="M-100 40 C 220 -20, 420 240, 760 150 S 1200 60, 1560 160" stroke="url(#gA)" strokeWidth="60" fill="none" filter="url(#b18)" opacity="0.55" />
          <path d="M-100 40 C 220 -20, 420 240, 760 150 S 1200 60, 1560 160" stroke="url(#gA)" strokeWidth="4" fill="none" filter="url(#b5)" opacity="0.7" />
        </g>
      </svg>
      <div className="gold-vignette" />
    </div>
  );
}