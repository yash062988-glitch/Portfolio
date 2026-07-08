export default function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center px-4 py-1.5 rounded-full bg-[#120c08]/85 border border-[#E9B15D]/30 text-[9px] font-bold uppercase tracking-wider text-primary shadow-lg backdrop-blur-md select-none ${className}`}>
      {children}
    </span>
  );
}
