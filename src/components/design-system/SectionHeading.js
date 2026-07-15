import MeshText from "./MeshText";

export default function SectionHeading({ label, title, description, align = "left", className = "" }) {
  const isCenter = align === "center";
  return (
    <div className={`flex flex-col gap-3 mb-16 ${isCenter ? "items-center text-center max-w-2xl mx-auto" : "max-w-2xl"} ${className}`}>
      {label && (
        <span className="text-[10px] font-bold tracking-[0.25em] text-primary uppercase select-none">
          {label}
        </span>
      )}
      <MeshText
        text={title}
        className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-none"
        as="h2"
      />
      {description && (
        <p className="text-white/60 text-xs md:text-sm lg:text-base font-light leading-relaxed mt-2">
          {description}
        </p>
      )}
    </div>
  );
}
