export default function Tag({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full bg-[#120c08]/80 text-[10px] uppercase font-bold tracking-wider text-primary border border-white/10 select-none ${className}`}>
      {children}
    </span>
  );
}
