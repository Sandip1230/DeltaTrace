import { STATUS_COLORS } from "../../utils/wqi";

export default function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || "#94a3b8";
  return (
    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ color: c, background: `${c}22`, border: `1px solid ${c}55` }}>
      {status}
    </span>
  );
}