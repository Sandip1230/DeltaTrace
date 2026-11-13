export default function GoldBackdrop() {
  return (
    <div className="gold-backdrop" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="gA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0a1f7a" stopOpacity="0" />
            <stop offset="0.3" stopColor="#0145F2" />
            <stop offset="0.62" stopColor="#DBC9FA" />
            <stop offset="1" stopColor="#1b2a8a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gB" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#050d33" stopOpacity="0" />
            <stop offset="0.4" stopColor="#0b2070" />
            <stop offset="0.65" stopColor="#3a55c9" />
            <stop offset="1" stopColor="#050d33" stopOpacity="0" />
          </linearGradient>
          <filter id="b18" x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="b5" x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <g className="drift">
          <path d="M-150 700 C 250 560, 520 820, 880 600 S 1320 330, 1600 420" stroke="url(#gA)" strokeWidth="90" fill="none" filter="url(#b18)" opacity="0.75" />
          <path d="M-150 700 C 250 560, 520 820, 880 600 S 1320 330, 1600 420" stroke="url(#gA)" strokeWidth="6" fill="none" filter="url(#b5)" opacity="0.8" />
          <path d="M-120 140 C 260 330, 560 60, 920 250 S 1340 560, 1600 470" stroke="url(#gB)" strokeWidth="110" fill="none" filter="url(#b18)" />
          <path d="M-100 40 C 220 -20, 420 240, 760 150 S 1200 60, 1560 160" stroke="url(#gA)" strokeWidth="60" fill="none" filter="url(#b18)" opacity="0.5" />
          <path d="M-100 40 C 220 -20, 420 240, 760 150 S 1200 60, 1560 160" stroke="#7FFF00" strokeWidth="2" fill="none" filter="url(#b5)" opacity="0.35" />
        </g>
      </svg>
      <div className="gold-vignette" />
    </div>
  );
}