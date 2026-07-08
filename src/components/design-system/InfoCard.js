import GlassCard from "./GlassCard";

export default function InfoCard({ title, children, titleColor = "text-white", className = "" }) {
  return (
    <GlassCard hover={false} className={`p-5 border border-white/5 bg-white/[0.01] ${className}`}>
      <h5 className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${titleColor}`}>{title}</h5>
      <div className="text-white/70 text-xs font-light leading-relaxed">{children}</div>
    </GlassCard>
  );
}
