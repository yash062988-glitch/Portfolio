import GlassCard from "./GlassCard";

export default function MetricCard({ value, label, description, className = "" }) {
  return (
    <GlassCard hover={false} className={`p-5 flex flex-col gap-1 border border-white/5 bg-white/[0.01] ${className}`}>
      <span className="text-3xl font-extrabold text-primary tracking-tight">{value}</span>
      <span className="text-[10px] font-bold text-white uppercase tracking-wider">{label}</span>
      {description && <p className="text-[11px] text-white/50 font-light mt-1">{description}</p>}
    </GlassCard>
  );
}
