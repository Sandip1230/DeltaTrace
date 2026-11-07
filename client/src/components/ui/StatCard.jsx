export default function StatCard({ icon: Icon, label, value, sub, accent = "#38d5f0" }) {
  return (
    <div className="glass glass-hover p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/60">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: `${accent}22`, color: accent }}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/50">{sub}</p>}
    </div>
  );
}