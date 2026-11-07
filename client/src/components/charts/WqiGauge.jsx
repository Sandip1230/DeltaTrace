import { STATUS_COLORS } from "../../utils/wqi";

const MAX = 150;

export default function WqiGauge({ value = 0, status = "Excellent" }) {
  const color = STATUS_COLORS[status] || "#38d5f0";
  const pct = Math.min(value / MAX, 1) * 100;
  const arc = "M20 105 A80 80 0 0 1 180 105";

  return (
    <svg viewBox="0 0 200 125" className="w-full max-w-[290px]">
      <path d={arc} pathLength="100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="14" strokeLinecap="round" />
      <path
        d={arc}
        pathLength="100"
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${pct} 100`}
        style={{ transition: "stroke-dasharray .9s ease, stroke .4s", filter: `drop-shadow(0 0 6px ${color})` }}
      />
      <text x="100" y="88" textAnchor="middle" fontSize="34" fontWeight="700" fill="#fff">{value}</text>
      <text x="100" y="108" textAnchor="middle" fontSize="12" fontWeight="600" fill={color}>{status}</text>
      <text x="20" y="122" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,.4)">0</text>
      <text x="180" y="122" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,.4)">{MAX}+</text>
    </svg>
  );
}