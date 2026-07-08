export default function SectionDivider({ className = "" }) {
  return (
    <div className={`relative w-full h-[1px] bg-gradient-to-r from-transparent via-primary/15 to-transparent z-10 ${className}`} />
  );
}
