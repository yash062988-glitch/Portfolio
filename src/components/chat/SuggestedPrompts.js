export default function SuggestedPrompts({ prompts, onPromptClick, disabled }) {
  return (
    <div className="flex flex-col gap-2">
      {prompts.map((prompt, index) => (
        <button
          key={`${prompt}-${index}`}
          onClick={() => onPromptClick(prompt)}
          disabled={disabled}
          className="w-full text-left px-4 py-2.5 rounded-xl border border-white/10 hover:border-primary/30 bg-white/5 text-xs text-white/85 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
